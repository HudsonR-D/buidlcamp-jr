import { toggle } from "./files";
import { Link } from "react-router-dom";
import { integrationStatus } from "./integration";
import type { IntegrationStatus } from "./integration";
import { useEffect, useRef, useState } from "react";
import { DOJO_CHALLENGES } from "../data/dojo";
import { newPractice } from "./model";
import { coachPrompt, PROVIDERS, providerEligible } from "./providers";
import { useWorkspace } from "./store";
import { AdultGate, Button, CheckRow, Heading, Icon, Notice, Tabs } from "./ui";
function Trainer() {
  const [examples, setExamples] = useState([
    { size: 2, label: "small" },
    { size: 4, label: "small" },
    { size: 7, label: "large" },
    { size: 9, label: "large" },
  ]);
  const [size, setSize] = useState(5);
  const [label, setLabel] = useState("small");
  const [test, setTest] = useState(6);
  const nearest = [...examples].sort(
    (a, b) => Math.abs(a.size - test) - Math.abs(b.size - test),
  )[0];
  return (
    <section className="panel trainer">
      <h2>Teach a tiny classifier</h2>
      <p>
        This real, simple model predicts a label using its nearest training
        example. It runs on your device. It is not a language model.
      </p>
      <div className="form-grid">
        <div>
          <h3>1. Build your training set</h3>
          <label>
            Example size: {size}
            <input
              type="range"
              min={1}
              max={10}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </label>
          <label>
            Label
            <select value={label} onChange={(e) => setLabel(e.target.value)}>
              <option value="small">Small</option>
              <option value="large">Large</option>
            </select>
          </label>
          <Button
            variant="secondary"
            disabled={examples.length >= 20}
            onClick={() => setExamples([...examples, { size, label }])}
          >
            Add training example
          </Button>
          <ul className="training-set">
            {examples.map((e, i) => (
              <li key={i}>
                Size {e.size} → {e.label}
                <Button
                  variant="quiet"
                  aria-label={`Remove example ${i + 1}`}
                  onClick={() =>
                    setExamples(examples.filter((_, n) => n !== i))
                  }
                >
                  <Icon name="close" size={16} />
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>2. Test an unseen example</h3>
          <label>
            Test size: {test}
            <input
              type="range"
              min={1}
              max={10}
              value={test}
              onChange={(e) => setTest(Number(e.target.value))}
            />
          </label>
          <div className="model-output">
            <span>Model prediction</span>
            <strong>{nearest?.label ?? "Needs training examples"}</strong>
            {nearest && (
              <p>
                The nearest example is size {nearest.size}. Equal distances use
                the earlier example.
              </p>
            )}
          </div>
          <h3>3. Challenge your model</h3>
          <p>
            Give a large example the “small” label. What changes? Remove most of
            one label. Is the model still useful? A model can only learn from
            the examples you give it.
          </p>
          <p className="small muted">
            This experiment resets when you leave this view. Record your
            observations in a lesson reflection to keep them.
          </p>
        </div>
      </div>
    </section>
  );
}
function ApiCoach({
  prompt,
  onResponse,
}: {
  prompt: string;
  onResponse: (text: string) => void;
}) {
  const [provider, setProvider] = useState("openai");
  const [key, setKey] = useState("");
  const [model, setModel] = useState("");
  const [approved, setApproved] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const adult = useWorkspace((s) => s.adult);
  const [integration, setIntegration] = useState<IntegrationStatus>({
    configured: false,
    authenticated: false,
  });
  const localCompanion = ["127.0.0.1", "localhost", "[::1]"].includes(
    location.hostname,
  );
  useEffect(() => {
    let alive = true;
    integrationStatus().then((s) => {
      if (alive) setIntegration(s);
    });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    if (!adult) {
      setKey("");
      abortRef.current?.abort();
    }
  }, [adult]);
  async function send() {
    setBusy(true);
    setStatus("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-BuidlCamp-Request": "adult-coach",
          "X-BuidlCamp": "1",
          ...(integration.csrf ? { "X-CSRF-Token": integration.csrf } : {}),
        },
        body: JSON.stringify({
          provider,
          key,
          model,
          prompt: coachPrompt(prompt),
          adult: approved,
        }),
        signal: controller.signal,
      });
      if (!response.headers.get("content-type")?.includes("application/json"))
        throw new Error(
          "API mode needs the BuidlCamp companion server. Subscription and local practice work on this static site.",
        );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "The provider could not complete this request.",
        );
      if (typeof result.text !== "string" || result.text.length > 30000)
        throw new Error("The provider returned an unreadable response.");
      onResponse(result.text);
      setStatus("Response received. Check its reasoning before using it.");
    } catch (e) {
      setStatus(
        e instanceof Error && e.name === "AbortError"
          ? "Request cancelled."
          : e instanceof Error
            ? e.message
            : "Request failed. Your draft is saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <AdultGate>
      <div className="panel">
        <h3>Adult demonstration with your API key</h3>
        <p>
          This sends your prompt and temporary API key through the BuidlCamp
          relay to your selected provider. Keys stay in memory for this view and
          request, and are never saved in backups or GitHub. Provider API
          charges apply. Review the response before showing it to a learner.
        </p>
        {!localCompanion &&
          (!integration.authenticated || integration.role !== "adult") && (
            <Notice>
              <Link to="/versions">
                Connect your own GitHub account as an adult educator
              </Link>{" "}
              to use the hosted relay. Use a separate adult workspace when
              preparing examples for younger learners.
            </Notice>
          )}
        <div className="form-grid">
          <label>
            Provider
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                setKey("");
                setModel("");
              }}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </label>
          <label>
            Model ID
            <input
              autoComplete="off"
              value={model}
              maxLength={120}
              placeholder="A model available in your API account"
              onChange={(e) => setModel(e.target.value)}
            />
          </label>
        </div>
        <label>
          API key
          <input
            type="password"
            autoComplete="off"
            value={key}
            maxLength={300}
            onChange={(e) => setKey(e.target.value)}
          />
        </label>
        <CheckRow checked={approved} onChange={() => setApproved(!approved)}>
          I am an adult operating this demonstration. I have removed student
          names and personal information and accept my provider’s API charges.
        </CheckRow>
        <div className="button-row">
          <Button
            disabled={
              !approved ||
              (!localCompanion &&
                (!integration.authenticated || integration.role !== "adult")) ||
              !adult ||
              key.length < 16 ||
              !model.trim() ||
              !prompt.trim() ||
              busy
            }
            onClick={send}
          >
            {busy ? "Waiting for provider…" : "Send prompt"}
          </Button>
          {busy && (
            <Button
              variant="secondary"
              onClick={() => abortRef.current?.abort()}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="quiet"
            onClick={() => {
              setKey("");
              setStatus("API key cleared.");
            }}
          >
            Clear key
          </Button>
        </div>
        {status && <Notice>{status}</Notice>}
        <p className="small muted">
          Google’s Gemini API terms exclude apps directed toward under-18s, so
          Gemini is available through its own app workflow only.
        </p>
      </div>
    </AdultGate>
  );
}
export default function Practice() {
  const { data, update } = useWorkspace();
  const [tab, setTab] = useState("prompts");
  const [id, setId] = useState(DOJO_CHALLENGES[0].id);
  const [connection, setConnection] = useState("subscription");
  const [providerId, setProviderId] = useState("chatgpt");
  const [consent, setConsent] = useState(false);
  const [notice, setNotice] = useState("");
  const [showExample, setShowExample] = useState(false);
  const challenge = DOJO_CHALLENGES.find((c) => c.id === id)!;
  const work = data.practice[id] ?? newPractice();
  const provider = PROVIDERS.find((p) => p.id === providerId)!;
  const eligible = providerEligible(data.age, provider.minAge);
  const save = (patch: Partial<typeof work>) =>
    update((d) => ({
      ...d,
      practice: {
        ...d.practice,
        [id]: { ...(d.practice[id] ?? newPractice()), ...patch },
      },
    }));
  const prompt = work.prompt;
  return (
    <>
      <Heading title="AI practice">
        Ask better questions. Test the answers. Keep your own judgment.
      </Heading>
      <Tabs
        options={[
          { id: "prompts", label: "Prompt workshop" },
          { id: "trainer", label: "Train a tiny model" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "trainer" ? (
        <Trainer />
      ) : (
        <>
          <div className="practice-layout">
            <aside className="panel practice-picker">
              <h2>Choose a challenge</h2>
              <label>
                <span className="sr-only">Practice challenge</span>
                <select
                  value={id}
                  onChange={(e) => {
                    setId(e.target.value);
                    setShowExample(false);
                    setNotice("");
                  }}
                >
                  {DOJO_CHALLENGES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {data.practice[c.id]?.completedAt ? "✓ " : ""}
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <h3>{challenge.title}</h3>
              <p>{challenge.scenario}</p>
              <div className="example">
                <span className="small muted">Starting prompt</span>
                <p>“{challenge.badPrompt}”</p>
              </div>
              <h3>Your goal</h3>
              <p>{challenge.goal}</p>
              <Button
                variant="quiet"
                onClick={() => setShowExample(!showExample)}
              >
                {showExample ? "Hide example" : "Show an example"}
              </Button>
              {showExample && <p className="example">{challenge.example}</p>}
            </aside>
            <section className="panel practice-main">
              <h2>Make the prompt your own</h2>
              <label>
                Your prompt
                <textarea
                  rows={6}
                  maxLength={10000}
                  value={prompt}
                  onChange={(e) =>
                    save({ prompt: e.target.value, completedAt: undefined })
                  }
                  placeholder="Explain the task, audience, constraints, and how you will check the answer."
                />
              </label>
              <h3>A checklist, not an AI grade</h3>
              <p className="small muted">
                Read your prompt and check each statement you can explain. There
                is no keyword score or claim that a model assessed your work.
              </p>
              {challenge.rubric.map((r, i) => (
                <CheckRow
                  key={r.label}
                  checked={work.checks.includes(i)}
                  onChange={() =>
                    save({
                      checks: toggle(work.checks, i),
                      completedAt: undefined,
                    })
                  }
                >
                  <strong>{r.label}</strong>
                  <span className="small muted block">{r.hint}</span>
                </CheckRow>
              ))}
            </section>
          </div>
          <section className="section">
            <h2>Try it with your own AI</h2>
            <Tabs
              options={[
                { id: "subscription", label: "Use my subscription" },
                { id: "offline", label: "Practice without AI" },
                { id: "api", label: "API key · adult access" },
              ]}
              value={connection}
              onChange={setConnection}
            />
            {connection === "subscription" ? (
              <div className="panel">
                <p>
                  Use your existing plan in the provider’s own app. BuidlCamp
                  does not sign into, charge, or access that account. Copy your
                  learning prompt, try it there, then bring back a response to
                  examine.
                </p>
                <div className="provider-options">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      aria-pressed={p.id === providerId}
                      className={p.id === providerId ? "selected" : ""}
                      onClick={() => {
                        setProviderId(p.id);
                        setConsent(false);
                      }}
                    >
                      <strong>{p.name}</strong>
                      <span>{p.company}</span>
                    </button>
                  ))}
                </div>
                <p>
                  {provider.note}{" "}
                  <a href={provider.source} target="_blank" rel="noreferrer">
                    Provider requirements
                  </a>
                </p>
                {eligible ? (
                  <>
                    <CheckRow
                      checked={consent}
                      onChange={() => setConsent(!consent)}
                    >
                      I’ve checked the provider’s account rules and have parent
                      or school permission where required.
                    </CheckRow>
                    <div className="button-row">
                      <Button
                        disabled={!prompt.trim()}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              coachPrompt(prompt),
                            );
                            setNotice(
                              "Learning prompt copied. Paste it into your AI app.",
                            );
                          } catch {
                            setNotice(
                              "Clipboard is unavailable. Select and copy your prompt above.",
                            );
                          }
                        }}
                      >
                        Copy learning prompt
                      </Button>
                      {consent && (
                        <a
                          className="button secondary"
                          href={provider.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open {provider.name}
                          <Icon name="external" />
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <Notice>
                    This provider’s learner workflow isn’t available for your
                    age group. You can still complete the workshop without an AI
                    account. An adult can prepare examples separately.
                  </Notice>
                )}
                <p className="small muted">
                  Prefer another provider? You can use the same prompt in an
                  age-appropriate service approved by your parent or school.
                </p>
              </div>
            ) : connection === "offline" ? (
              <div className="panel">
                <h3>Practice is useful without a model</h3>
                <p>
                  Ask a person to follow your prompt. Is anything unclear?
                  Rewrite one instruction, then explain why it’s better. You can
                  also inspect the example provided with this challenge.
                </p>
              </div>
            ) : (
              <ApiCoach
                prompt={prompt}
                onResponse={(response) => save({ response })}
              />
            )}
          </section>
          {notice && <Notice>{notice}</Notice>}
          <section className="section panel">
            <h2>Inspect, don’t just accept</h2>
            <label>
              Response to examine (optional)
              <textarea
                rows={5}
                maxLength={30000}
                value={work.response}
                onChange={(e) => save({ response: e.target.value })}
                placeholder="Paste an AI response or notes from a person who tried your prompt. Do not include private information."
              />
            </label>
            <label>
              Your reflection
              <textarea
                rows={4}
                maxLength={10000}
                value={work.reflection}
                onChange={(e) =>
                  save({ reflection: e.target.value, completedAt: undefined })
                }
                placeholder="What worked? What could be wrong? How would you check it? What would you change next?"
              />
            </label>
            <div className="button-row">
              <Button
                disabled={
                  prompt.trim().length < 20 ||
                  work.reflection.trim().length < 20 ||
                  !challenge.rubric.every((_, i) => work.checks.includes(i))
                }
                onClick={() => {
                  save({ completedAt: new Date().toISOString() });
                  setNotice("Practice recorded in your learning portfolio.");
                }}
              >
                Record practice <Icon name="check" />
              </Button>
              <span className="small muted">
                {work.completedAt
                  ? "Practice recorded"
                  : "Add a prompt, complete the checklist, and write a reflection."}
              </span>
            </div>
          </section>
        </>
      )}
    </>
  );
}
