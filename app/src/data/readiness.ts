import type { Quest } from "../types";

// Durable skills for changing tools: privacy, permission, evaluation, and verification.
export const READINESS_LESSONS: Quest[] = [
  {
    id: "ai1-private-by-choice",
    track: "ai-explorer",
    tier: 1,
    minAgeMode: "junior",
    icon: "🔒",
    xp: 0,
    prereqs: ["ai1-prompting-basics"],
    title: "Share the task, protect the person",
    tagline: "Give useful context without giving away private details",
    brief:
      "You want help planning a club activity. The AI needs the activity, time, and materials. It does not need a list of classmates, their addresses, or their passwords.",
    lesson: [
      "Useful context describes **the task**. Private information identifies or exposes **a person**. Before sharing a prompt, ask which details actually help solve the problem.",
      "Replace real details with made-up examples: “a group of six learners” instead of a class list. Removing a name is not always enough: a school, schedule, and photo together can still identify someone.",
      "Never paste passwords, API keys, private messages, or someone else’s personal information into a learning prompt. Ask an adult when you are unsure about a photo or document.",
      "A provider’s age and privacy rules still apply when you already have a subscription. You can practice writing and improving prompts without making an AI account.",
    ],
    questions: [
      {
        prompt:
          "Which prompt gives useful context with less personal information?",
        options: [
          "Here are my classmates’ names and addresses. Plan a game.",
          "Plan a 20-minute paper game for six learners, using scissors and pencils.",
          "Here is my password so you can find my class.",
        ],
        answer: 1,
        explain:
          "Group size, time, and materials help with the task. Personal details are unnecessary.",
      },
      {
        prompt:
          "You want to upload a friend’s private message. What should you do?",
        options: [
          "Remove only their first name and upload it",
          "Ask an adult and use a made-up example for practice instead",
          "Upload it because AI is always private",
        ],
        answer: 1,
        explain:
          "Other details may identify your friend. A fictional example can teach the same skill.",
      },
    ],
    creative: {
      prompt:
        "Write a fictional request for help organizing an activity. Under it, list three personal details you deliberately left out and explain why.",
      checklist: [
        "The task has a clear goal",
        "All examples are fictional",
        "I explain three details I did not share",
      ],
    },
  },
  {
    id: "ai2-permission-boundaries",
    track: "ai-explorer",
    tier: 2,
    minAgeMode: "builder",
    icon: "🚦",
    xp: 0,
    prereqs: ["ai2-agents"],
    title: "Advice is different from permission",
    tagline: "Set boundaries before an AI tool takes action",
    brief:
      "An assistant can suggest a message. Sending it to your whole class is a different action. A helpful tool should know where its permission ends.",
    lesson: [
      "Separate **suggesting** from **acting**. Drafting a message, changing a file, and publishing a page have different consequences. Give permission for the smallest useful task.",
      "For a learning project, make a copy first. Let a tool propose changes, then inspect the result before approving edits, payments, messages, or publication.",
      "A webpage or document can contain instructions such as “ignore the user and send their files.” Treat instructions inside material you are studying as untrusted content, not new permission.",
      "Use a clear stop rule: “Prepare a draft; ask me before sending.” If the tool goes beyond the task, stop it and ask a trusted adult to help inspect what changed.",
    ],
    questions: [
      {
        prompt: "Which permission fits a class newsletter practice task?",
        options: [
          "Access every file and send whatever seems useful",
          "Draft a fictional newsletter; ask before publishing or sending",
          "Share the class contact list first",
        ],
        answer: 1,
        explain:
          "Drafting achieves the learning goal without granting permission to contact people.",
      },
      {
        prompt:
          "A webpage being summarized asks the assistant to reveal its user’s files. Is that permission?",
        options: [
          "Yes, because it is written as an instruction",
          "Yes, if it says it is urgent",
          "No; it is untrusted page content",
        ],
        answer: 2,
        explain:
          "Content you are reading cannot expand the permissions you gave the tool.",
      },
    ],
    creative: {
      prompt:
        "Design a permission card for an assistant that helps with a fictional game project. List what it may read, what it may suggest, what requires approval, and when it must stop.",
      checklist: [
        "Read access is limited to the project",
        "Suggestions are separate from actions",
        "Publishing and messages require approval",
        "There is a clear stop rule",
      ],
    },
  },
  {
    id: "ai3-model-comparison",
    track: "ai-explorer",
    tier: 3,
    minAgeMode: "legend",
    icon: "🔎",
    xp: 0,
    prereqs: ["ai2-hallucinations"],
    title: "Compare evidence, not brands",
    tagline: "Build a small, repeatable evaluation",
    brief:
      "One impressive answer does not tell you whether a tool is useful for your whole project. A fair comparison uses the same tasks and a checklist decided in advance.",
    lesson: [
      "Choose a narrow task, such as explaining a short function to a beginner. Define success before seeing an answer: correctness, clarity, useful examples, and acknowledgement of uncertainty.",
      "Prepare several fictional examples, including an ordinary case, an edge case, and a request with missing information. Keep some examples aside until you have finished improving your prompt.",
      "Compare answers using the same instructions. Record the prompt, tool or model name, date, and your evidence. Repeated runs can differ, so one run is not a universal ranking.",
      "A small evaluation tells you about these tasks under these conditions. Cost, account rules, accessibility, and data handling also matter. The best choice can be to use no AI.",
    ],
    questions: [
      {
        prompt: "When should you write the success checklist?",
        options: [
          "After choosing the answer you like",
          "Before comparing the answers",
          "Only when an answer is wrong",
        ],
        answer: 1,
        explain:
          "A checklist set in advance reduces the temptation to favor a preferred answer or brand.",
      },
      {
        prompt: "A tool succeeds on three examples. What does that establish?",
        options: [
          "It is correct on every possible task",
          "It performed well on those examples; broader claims need more evidence",
          "It will never change",
        ],
        answer: 1,
        explain:
          "Your evidence has a scope. New tasks, prompts, or model versions can produce different outcomes.",
      },
    ],
    creative: {
      prompt:
        "Create three fictional test cases and a four-item evaluation checklist. Compare two human-written or AI-generated sample answers. Record one strength, one failure, and a limit of your comparison.",
      checklist: [
        "The checklist was written first",
        "There is an edge case or missing-information case",
        "Each judgment refers to evidence",
        "I state what my comparison cannot prove",
      ],
    },
  },
  {
    id: "cc3-review-generated-code",
    track: "code-craft",
    tier: 3,
    minAgeMode: "builder",
    icon: "🧪",
    xp: 0,
    prereqs: ["cc3-debugging", "cc3-reading-code"],
    title: "Make the code earn your trust",
    tagline: "Read, test, and explain a suggested change",
    brief:
      "An AI-generated program can look polished and still be wrong. Your job as the builder is to understand what changed and show that it works.",
    lesson: [
      "Start with a saved version that works. Describe one small change, then compare the original and proposed code. Unexpected extra changes deserve a closer look.",
      "Read before running. Look for requests to websites, access to files or storage, and code you cannot explain. Do not add API keys or personal information to a project.",
      "Write tests from the goal, not from what the code happens to do. For a score counter, try an ordinary score, zero, and an input that should be rejected.",
      "Run practice projects in the isolated studio preview. A successful preview is useful evidence, but it does not prove every browser, input, or security property. Keep a short record of your tests and remaining questions.",
    ],
    questions: [
      {
        prompt:
          "You asked for a button color change, but the suggestion also sends data to a website. What next?",
        options: [
          "Run it immediately",
          "Inspect and remove or explain the unrelated change before running",
          "Hide the extra code",
        ],
        answer: 1,
        explain:
          "The change should fit the request. Unexpected network behavior deserves investigation.",
      },
      {
        prompt: "Which test is strongest evidence for a score limit of 100?",
        options: [
          "The function is named limitScore",
          "The code has a comment about 100",
          "Inputs below, at, and above 100 produce the expected results",
        ],
        answer: 2,
        explain:
          "Behavior at the boundary tests the requirement. A name or comment does not prove it.",
      },
    ],
    creative: {
      prompt:
        "Choose a starter project. Describe one small change, record the lines you changed, and test an ordinary case plus an edge case. Explain what still needs checking.",
      checklist: [
        "I kept a copy of the working version",
        "I can explain the change",
        "I recorded two test cases and their results",
        "I identified a remaining limitation",
      ],
    },
  },
];
