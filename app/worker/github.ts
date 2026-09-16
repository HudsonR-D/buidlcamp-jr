import {
  checkpointFiles,
  parseCheckpoint,
  MANAGED_ROOT,
} from "../src/workspace/checkpoints.ts";
import type { ProjectCheckpoint } from "../src/workspace/checkpoints.ts";
export class HttpError extends Error {
  status: number;
  detail?: unknown;
  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}
export type Transport = typeof fetch;
export class GitHub {
  private token: string;
  private transport: Transport;
  constructor(token: string, transport: Transport = fetch) {
    this.token = token;
    // Keep native Worker fetch detached from the GitHub instance receiver.
    this.transport = (input, init) => transport(input, init);
  }
  async request(
    path: string,
    method = "GET",
    body?: unknown,
    raw = false,
  ): Promise<any> {
    if (!path.startsWith("/") || path.startsWith("//"))
      throw new HttpError(400, "Invalid GitHub operation.");
    const response = await this.transport(`https://api.github.com${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: raw
          ? "application/vnd.github.raw+json"
          : "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "BuidlCamp",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      await response.body?.cancel();
      const status = response.status;
      throw new HttpError(
        status === 401
          ? 401
          : status === 403
            ? 403
            : status === 404
              ? 404
              : status === 409 || status === 422
                ? 409
                : status === 429
                  ? 429
                  : 502,
        status === 401
          ? "Reconnect GitHub; this session is no longer authorized."
          : status === 403
            ? "GitHub denied access or reached a limit. Check repository permissions and try later."
            : status === 404
              ? "The repository or version is unavailable. Check the app's selected repositories."
              : status === 409 || status === 422
                ? "The repository changed or needs an initial README. Refresh and review both versions before saving."
                : "GitHub could not complete this operation. Your local work is safe.",
      );
    }
    if (response.status === 204) return null;
    const reader = response.body!.getReader();
    let text = "",
      length = 0;
    const decoder = new TextDecoder();
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        length += value.length;
        if (length > 4_000_000) {
          await reader.cancel();
          throw new HttpError(413, "GitHub returned a file that is too large.");
        }
        text += decoder.decode(value, { stream: true });
      }
    } finally {
      reader.releaseLock();
    }
    text += decoder.decode();
    return raw ? text : JSON.parse(text);
  }
  async repositories() {
    const all: any[] = [];
    const installed = await this.request("/user/installations?per_page=100");
    for (const installation of installed.installations.slice(0, 20)) {
      for (let page = 1; page <= 10; page++) {
        const result = await this.request(
          `/user/installations/${installation.id}/repositories?per_page=100&page=${page}`,
        );
        all.push(
          ...result.repositories.filter(
            (r: any) => r.private && !r.archived && r.permissions?.push,
          ),
        );
        if (result.repositories.length < 100) break;
      }
    }
    return all.map((r) => ({
      version: 1,
      id: r.id,
      owner: r.owner.login,
      name: r.name,
      branch: r.default_branch,
    }));
  }
  async repository(id: unknown) {
    if (!Number.isSafeInteger(id) || Number(id) <= 0)
      throw new HttpError(400, "Choose a repository.");
    const allowed = (await this.repositories()).find((r) => r.id === id);
    if (!allowed)
      throw new HttpError(
        403,
        "Choose a private, writable repository selected for the BuidlCamp GitHub App.",
      );
    const current = await this.request(
      `/repos/${allowed.owner}/${allowed.name}`,
    );
    if (!current.private || current.archived || !current.permissions?.push)
      throw new HttpError(
        403,
        "Cloud saves are paused. This repository must remain private and writable.",
      );
    return {
      ...allowed,
      branch: current.default_branch,
      path: `/repos/${allowed.owner}/${allowed.name}`,
    };
  }
  async head(repo: { path: string; branch: string }) {
    try {
      return (
        await this.request(
          `${repo.path}/git/ref/heads/${encodeURIComponent(repo.branch)}`,
        )
      ).object.sha as string;
    } catch (error) {
      if (error instanceof HttpError && error.status === 404)
        throw new HttpError(
          409,
          "Initialize this private repository with a README on GitHub, then try again.",
        );
      throw error;
    }
  }
  async projects(id: number) {
    const repo = await this.repository(id),
      head = await this.head(repo);
    try {
      const files = await this.request(
        `${repo.path}/contents/${MANAGED_ROOT}/projects?ref=${head}`,
      );
      return {
        repository: {
          version: 1,
          id: repo.id,
          owner: repo.owner,
          name: repo.name,
          branch: repo.branch,
        },
        head,
        projects: files
          .filter(
            (f: any) =>
              f.type === "dir" && /^[a-zA-Z0-9_-]{1,100}$/.test(f.name),
          )
          .map((f: any) => ({ id: f.name })),
      };
    } catch (error) {
      if (error instanceof HttpError && error.status === 404)
        return {
          repository: {
            version: 1,
            id: repo.id,
            owner: repo.owner,
            name: repo.name,
            branch: repo.branch,
          },
          head,
          projects: [],
        };
      throw error;
    }
  }
  async history(id: number, project: string) {
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(project))
      throw new HttpError(400, "Invalid project.");
    const repo = await this.repository(id);
    const commits = await this.request(
      `${repo.path}/commits?sha=${encodeURIComponent(repo.branch)}&path=${MANAGED_ROOT}/projects/${project}&per_page=20`,
    );
    return commits.map((c: any) => ({
      sha: c.sha,
      message: String(c.commit.message).slice(0, 200),
      date: c.commit.committer.date,
    }));
  }
  async checkpoint(
    id: number,
    project: string,
    sha: string,
  ): Promise<ProjectCheckpoint> {
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(project) || !/^[a-f0-9]{40}$/.test(sha))
      throw new HttpError(400, "Invalid project version.");
    const repo = await this.repository(id),
      root = `${repo.path}/contents/${MANAGED_ROOT}/projects/${project}`;
    const meta = JSON.parse(
      await this.request(
        `${root}/checkpoint.json?ref=${sha}`,
        "GET",
        undefined,
        true,
      ),
    );
    const code = await this.request(
      `${root}/index.html?ref=${sha}`,
      "GET",
      undefined,
      true,
    );
    const checkpoint = parseCheckpoint({
      ...meta,
      project: { ...meta.project, code },
    });
    if (checkpoint.project.id !== project)
      throw new HttpError(400, "The project and checkpoint do not match.");
    return checkpoint;
  }
  async save(
    id: number,
    base: string,
    value: unknown,
    author: { id: number; login: string },
  ) {
    const checkpoint = parseCheckpoint(value),
      files = checkpointFiles(checkpoint);
    if (!/^[a-f0-9]{40}$/.test(base))
      throw new HttpError(400, "Refresh the repository before saving.");
    const repo = await this.repository(id),
      current = await this.head(repo);
    if (base !== current)
      throw new HttpError(
        409,
        "Another version was saved. Load it to compare; your local work has not been changed.",
        { head: current },
      );
    const parent = await this.request(`${repo.path}/git/commits/${current}`);
    const tree = [];
    for (const [path, content] of Object.entries(files)) {
      const blob = await this.request(`${repo.path}/git/blobs`, "POST", {
        content,
        encoding: "utf-8",
      });
      tree.push({ path, mode: "100644", type: "blob", sha: blob.sha });
    }
    const createdTree = await this.request(`${repo.path}/git/trees`, "POST", {
      base_tree: parent.tree.sha,
      tree,
    });
    const commit = await this.request(`${repo.path}/git/commits`, "POST", {
      message: checkpoint.message,
      tree: createdTree.sha,
      parents: [current],
      author: {
        name: author.login,
        email: `${author.id}+${author.login}@users.noreply.github.com`,
      },
    });
    await this.repository(id);
    await this.request(
      `${repo.path}/git/refs/heads/${encodeURIComponent(repo.branch)}`,
      "PATCH",
      { sha: commit.sha, force: false },
    );
    return { head: commit.sha, checkpointId: checkpoint.id };
  }
}
