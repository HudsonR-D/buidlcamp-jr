import type { Quest } from "../types";
type Seed = {
  id: string;
  title: string;
  goal: string;
  idea: string;
  example: string;
  hint: string;
  stretch: string;
  task: string;
  checks: string[];
  question: string;
  options: string[];
  answer: number;
  why: string;
};
const lessons: Seed[] = [
  {
    id: "bt1-private",
    title: "A home for your project",
    goal: "Distinguish a local folder, repository, and public visibility.",
    idea: "A repository keeps project files and their history. A local copy stays on your device. A private GitHub repository is stored by GitHub and can be seen by people you invite. Public means anyone may view it.",
    example:
      "Keep a drawing-game project private while learning. Share a reviewed copy later only if you have permission. Never assume a private repository is a secret vault.",
    hint: "Draw three boxes: your device, a private repository, and the public internet. Place example files in each.",
    stretch:
      "Explain why changing a public repository back to private cannot erase copies other people already made.",
    task: "Make a map showing where your project lives, who can see each copy, and what must stay out of every repository.",
    checks: [
      "I named the people or services with access",
      "I explained private versus public",
      "I kept passwords and personal records out",
    ],
    question: "Who can see files in a public repository?",
    options: ["Only you", "Only invited classmates", "Anyone on the internet"],
    answer: 2,
    why: "Public visibility permits anyone to read the repository; copies may remain after a later visibility change.",
  },
  {
    id: "bt1-secrets",
    title: "Secrets stay out",
    goal: "Recognize secrets and explain what .gitignore can and cannot do.",
    idea: "API keys and passwords are credentials. Keep them out of source code, screenshots, and commit messages. A .gitignore file tells Git which untracked files to skip. It does not erase files already committed.",
    example:
      "Ignore .env and keep a separate .env.example containing names and harmless placeholders. If a real key was committed, stop using that key and have its owner revoke or rotate it.",
    hint: "Use invented labels such as YOUR_API_KEY in exercises. Never paste a real credential into a practice scanner.",
    stretch:
      "Explain the difference between removing a file, rewriting history, and revoking a credential.",
    task: "Write a pretend project file list, a .gitignore, and a response plan for a accidentally committed key. Use no real secrets.",
    checks: [
      "My example contains no real credentials",
      "I explained why .gitignore is not retroactive",
      "My response starts with revoking the exposed key",
    ],
    question:
      "A key is already in a commit. Is adding .env to .gitignore enough?",
    options: [
      "Yes, it erases history",
      "No, revoke the key and address the committed history",
      "Yes, if the repository is private",
    ],
    answer: 1,
    why: "Ignore rules do not remove tracked files or invalidate credentials. The owner needs to revoke or rotate the exposed key.",
  },
  {
    id: "bt1-commits",
    title: "Save a version with a reason",
    goal: "Create a deliberate checkpoint with a useful message.",
    idea: "Autosave protects your current draft. A commit records a version and explains a change. Small commits are easier to understand and recover than a huge pile of unrelated edits.",
    example:
      "Change a button label and save a version called Explain the jump button. That message is more useful than stuff or final-final.",
    hint: "Finish the sentence: This version changes ___ because ___.",
    stretch:
      "Split three unrelated changes into sensible separate commits and explain your grouping.",
    task: "Change one part of a studio project, review the checkpoint, and save it locally with a message explaining the change.",
    checks: [
      "I changed one clear behavior",
      "I reviewed what the version contains",
      "My message explains the change",
    ],
    question: "Which commit message helps a future reader most?",
    options: ["Fix jump button label for touch users", "Stuff", "Final final"],
    answer: 0,
    why: "A concrete message identifies the change and who it helps.",
  },
  {
    id: "bt1-history",
    title: "Compare, recover, try again",
    goal: "Compare versions and restore without losing newer work.",
    idea: "A difference view shows how versions change. Restoring an old version should create a new checkpoint. Keeping history helps you recover a working idea without pretending later work never happened.",
    example:
      "Your new jump is too high. Compare the previous speed with the current speed, save the current attempt, then restore the earlier behavior as a new version.",
    hint: "Read both sides before choosing. If two devices changed the same project, keep both until you understand the differences.",
    stretch:
      "Explain why force-pushing can remove another person's visible history and why this app never does it.",
    task: "Save two local versions, compare them, and restore the first. Describe the evidence that your second version is still recoverable.",
    checks: [
      "I compared both versions",
      "I preserved work before replacing it",
      "I explained my restore decision",
    ],
    question:
      "Two devices saved different changes. What is the safest next step?",
    options: [
      "Force the newer device over the other",
      "Compare and preserve both changes",
      "Delete both versions",
    ],
    answer: 1,
    why: "A conflict is information. Reviewing both versions avoids silently discarding someone's work.",
  },
  {
    id: "bt2-connect",
    title: "Connect only what you need",
    goal: "Explain selected-repository permissions and an age-eligible setup.",
    idea: "GitHub users must meet its minimum age, at least 13 and sometimes older locally. Use your own account. BuidlCamp asks for file access only to repositories selected for its GitHub App. Account-free learners can practice all steps locally.",
    example:
      "Create a private repository with a README. Install the app for that repository only, review the requested file permission, and select it in Project versions. Do not choose all repositories for convenience.",
    hint: "Ages 10–12: draw the setup steps and export a checkpoint for an adult to review separately. Never use an adult's login.",
    stretch:
      "Describe how revoking an app differs from deleting a repository or deleting a browser workspace.",
    task: "Complete a local permission simulation, or connect an eligible account to one private practice repository. Record the exact access you granted without including account details.",
    checks: [
      "I followed the age-appropriate pathway",
      "I chose one private practice repository in my example",
      "I can explain how to disconnect",
    ],
    question: "Which installation choice gives the app the least access?",
    options: [
      "All my repositories",
      "Only my selected practice repository",
      "My account password",
    ],
    answer: 1,
    why: "Selected-repository access limits which projects the app can read and change. Password sharing is never needed.",
  },
  {
    id: "bt2-readme",
    title: "Leave a useful trail",
    goal: "Document how a project works and keep an independent backup.",
    idea: "A README tells someone what a project does and how to use it. A backup is another recoverable copy. Browser storage and cloud history can both become unavailable, so keep a reviewed downloadable copy too.",
    example:
      "Write the purpose, controls, how to run the HTML file, known limitations, and where any reused assets came from. Use a nickname only if you choose to include one.",
    hint: "Ask another person to explain your project using only the README.",
    stretch:
      "Test recovery in a separate workspace using the downloaded file, without changing your original.",
    task: "Write a README for a small project, export a checkpoint, and describe a safe restore test.",
    checks: [
      "My README explains controls and limitations",
      "I recorded sources and permissions",
      "I tested or described independent recovery",
    ],
    question: "Which detail belongs in a project README?",
    options: [
      "Your school address",
      "An API password",
      "Controls and known limitations",
    ],
    answer: 2,
    why: "A README helps people use the project; private details and credentials are unnecessary.",
  },
  {
    id: "bt3-branches",
    title: "Propose a change",
    goal: "Use branches and pull requests to discuss changes before merging.",
    idea: "A branch is a separate line of work. A pull request proposes bringing changes into another branch. A reviewer checks the proposed difference before it becomes part of the main project.",
    example:
      "On paper, draw main with a working button and a branch with a clearer label. Write a pull request explaining the reason and the touch and keyboard tests.",
    hint: "Under the GitHub age minimum, use local copies labeled main and proposal. The learning goal does not require posting online.",
    stretch:
      "Explain how a fork differs from a branch and when a maintainer might request revisions.",
    task: "Prepare a small change proposal with a before/after description, a reason, and testing evidence. Keep the exercise local or use an eligible private practice repository.",
    checks: [
      "My proposal has one clear purpose",
      "I reviewed the actual difference",
      "I included tests and a rollback idea",
    ],
    question: "What does opening a pull request do?",
    options: [
      "Automatically proves the code is safe",
      "Proposes changes for review",
      "Grants a license to every asset",
    ],
    answer: 1,
    why: "A pull request is a review workflow, not proof of correctness or licensing permission.",
  },
  {
    id: "bt3-review",
    title: "Review the work, respect the person",
    goal: "Give actionable feedback supported by a reproducible test.",
    idea: "A useful review explains what happened, why it matters, and how to reproduce it. Focus on the work. Follow the project's contribution guide and code of conduct.",
    example:
      "Instead of This is bad, write: With keyboard focus on Start, pressing Enter does nothing. Expected: the game begins. Tested in the current browser.",
    hint: "Label a suggestion separately from a bug. Do not send private student work or personal details to public issues.",
    stretch:
      "Review a generated patch for unnecessary dependencies, hidden network calls, and missing tests.",
    task: "Review one of your own saved versions as if helping another developer. Write one reproducible finding and one specific strength.",
    checks: [
      "I gave reproduction steps",
      "I separated observation from opinion",
      "My feedback is respectful and contains no personal details",
    ],
    question: "Which review comment is most actionable?",
    options: [
      "Nothing works",
      "You are bad at coding",
      "Pressing Enter on Start does not start the game; clicking does",
    ],
    answer: 2,
    why: "Specific steps and observed behavior let someone reproduce and investigate the problem.",
  },
  {
    id: "bt3-licenses",
    title: "Permission to reuse",
    goal: "Distinguish visibility, ownership, licenses, and attribution.",
    idea: "Publicly visible code is not automatically open source. A license explains permissions and conditions. MIT permits broad reuse while requiring its copyright and permission notice. Dependencies, images, music, and fonts can have different licenses.",
    example:
      "Your MIT-licensed code does not grant permission to reuse an unlicensed song. Keep a list of each source, its license, and required credit. Review AI-generated material instead of assuming a model cleared its rights.",
    hint: "Practice with your own shapes and invented code. When permission is unclear, replace the material or ask its rights holder.",
    stretch:
      "Compare MIT with Apache-2.0 and GPL using official license texts. Distinguish software licenses from Creative Commons asset licenses; avoid treating the exercise as legal advice.",
    task: "Make a permission inventory for a small project, identify what you own, and explain which notices must travel with a redistributed copy.",
    checks: [
      "I checked code and assets separately",
      "I distinguished public visibility from a license",
      "I retained required notices and flagged uncertainty",
    ],
    question:
      "Does a public repository without a license automatically permit reuse?",
    options: [
      "Yes, everything online is free",
      "No, visibility alone is not permission",
      "Yes, if AI found it",
    ],
    answer: 1,
    why: "Public access does not itself grant the permissions provided by an open-source license.",
  },
  {
    id: "bt3-release",
    title: "Release something you can stand behind",
    goal: "Review content, tests, permissions, and recovery before publication.",
    idea: "Publishing creates copies you may not be able to recall. Review the files, history, secrets, licenses, accessibility, and claims first. A small honest release is a worthwhile achievement.",
    example:
      "Package one tested game with controls, README, license choices, credits, and known limitations. Remove private material and keep a recoverable earlier version.",
    hint: "A local release folder is a complete learning outcome. Public publication is a separate decision for eligible owners with permission.",
    stretch:
      "Plan a security report channel and a maintenance process without promising support you cannot provide.",
    task: "Prepare a release candidate locally, review it against a checklist, and write release notes describing what works and what remains untested.",
    checks: [
      "I reviewed every release file and its permissions",
      "I checked for secrets and identifying information",
      "My notes separate tested behavior from limitations",
      "I can recover the earlier version",
    ],
    question: "What should honest release notes say?",
    options: [
      "Tested behavior and known limitations",
      "Works perfectly on every device",
      "Officially approved by every provider",
    ],
    answer: 0,
    why: "Evidence and limitations help people judge a release. Unsupported claims do not.",
  },
];
export const TOGETHER_LESSONS: Quest[] = lessons.map((s, i) => ({
  id: s.id,
  track: "build-together",
  tier: i < 4 ? 1 : i < 6 ? 2 : 3,
  minAgeMode: i < 4 ? "junior" : i < 6 ? "builder" : "legend",
  title: s.title,
  tagline: s.goal,
  icon: "📁",
  prereqs: i ? [lessons[i - 1].id] : [],
  xp: 0,
  brief: s.goal,
  lesson: [s.idea, s.example, s.hint, s.stretch],
  questions: [
    {
      prompt: s.question,
      options: s.options,
      answer: s.answer,
      explain: s.why,
    },
    {
      prompt: "What evidence will help you explain your learning?",
      options: [
        "A score with no explanation",
        "Your own example, checks, and reason for a decision",
        "A copied answer you did not inspect",
      ],
      answer: 1,
      explain:
        "A concrete example and your reasoning make learning discussable; completion is not independent certification.",
    },
  ],
  creative: { prompt: s.task, checklist: s.checks },
  support: {
    objective: s.goal,
    guided: [
      s.idea,
      `Try this example. ${s.example}`,
      `Your turn. ${s.hint}`,
      `Make something: ${s.task}`,
    ],
    example: s.example,
    hint: s.hint,
    stretch: s.stretch,
  },
}));
