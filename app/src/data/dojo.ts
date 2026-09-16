import type { DojoChallenge } from "../types";

// Explicit self-review prompts. No keyword score or simulated AI assessment.
export const DOJO_CHALLENGES: DojoChallenge[] = [
  {
    id: "white-1",
    title: "Zombie Game, But Actually Good",
    scenario:
      "You want an AI to design a simple zombie survival game idea for you to build in the Project studio.",
    badPrompt: "make me a zombie game",
    goal: "Get a prompt specific enough that two different people would build almost the same game from it.",
    rubric: [
      {
        label: "Names the game type",
        hint: "Say if it's top-down, a maze, a platformer, a shooter — the actual genre/view.",
      },
      {
        label: "States the goal / win condition",
        hint: "What does the player need to do to win or survive?",
      },
      {
        label: "Describes controls or abilities",
        hint: "How does the player move, jump, or fight?",
      },
      {
        label: "Sets the scene/theme",
        hint: "Where does this happen — forest, city, a specific map?",
      },
    ],
    example:
      "I want a simple top-down 2D zombie survival game for a browser. The player moves with arrow keys and shoots with spacebar. Zombies spawn from the edges of a small forest clearing map and slowly close in. The player wins by surviving 60 seconds; they lose if a zombie touches them 3 times. Keep it simple enough to build in under 200 lines of JavaScript.",
  },
  {
    id: "white-2",
    title: "Draw Me a Dragon (That Actually Looks Right)",
    scenario:
      "You want an AI image generator to draw a dragon for your game's cover art.",
    badPrompt: "draw a dragon",
    goal: "Describe the dragon specifically enough that you'd recognize it out of 10 different dragon pictures.",
    rubric: [
      {
        label: "Names an art style",
        hint: "Cartoon? Realistic? Pixel art? Anime?",
      },
      {
        label: "Describes colors",
        hint: "What color is the dragon and its background?",
      },
      {
        label: "Describes a pose or action",
        hint: "What is the dragon doing — flying, roaring, sleeping?",
      },
      {
        label: "Sets a background",
        hint: "What's behind the dragon?",
      },
    ],
    example:
      "Cartoon-style illustration of a friendly, chunky green dragon with gold underbelly scales, mid-flight with wings spread wide, breathing a small playful puff of orange fire. Background is a bright blue sky with fluffy white clouds and a distant castle on a hill. Bold outlines, flat colors, like a kids' animated show poster.",
  },
  {
    id: "yellow-1",
    title: "Bedtime Story With an Actual Plot",
    scenario:
      "You want an AI to write a bedtime story for your little sibling.",
    badPrompt: "write a story",
    goal: "Make sure the story fits the reader and has a real shape: beginning, middle, end.",
    rubric: [
      {
        label: "Says who it's for",
        hint: "Mention the age or 'for my little sibling'.",
      },
      {
        label: "Gives a length",
        hint: "How long — '300 words' or '5 minutes read aloud'?",
      },
      {
        label: "Names a character or world",
        hint: "Give the hero a name or the setting a name.",
      },
      {
        label: "Sets the tone",
        hint: "Calm and cozy? Funny and silly?",
      },
      {
        label: "Asks for a real ending",
        hint: "Should it have a clear ending or a lesson?",
      },
    ],
    example:
      "Write a cozy, calming bedtime story for my 6-year-old sister, about 300 words, meant to be read aloud in 3 minutes. It should star a sleepy baby fox named Ember who can't fall asleep in the Whispering Woods and asks each forest friend how they get sleepy. Give it a gentle, happy ending where Ember finally falls asleep. Keep the vocabulary simple enough for a kindergartner to follow along.",
  },
  {
    id: "yellow-2",
    title: "Study Help That Doesn't Just Give Answers",
    scenario:
      "You want an AI to help you study for a fractions quiz without just doing your homework for you.",
    badPrompt: "help me with fractions",
    goal: "Get help that teaches instead of just answering — and matches your actual level.",
    rubric: [
      {
        label: "Names the exact skill",
        hint: "Which fractions skill exactly — adding? simplifying? common denominators?",
      },
      {
        label: "Says your grade/level",
        hint: "What grade are you in, or how much do you already know?",
      },
      {
        label: "Asks for hints, not answers",
        hint: "Explicitly say 'give me hints, not the answer'.",
      },
      {
        label: "Asks for practice problems",
        hint: "Ask for a few practice problems to try yourself.",
      },
      {
        label: "Wants step-by-step format",
        hint: "Ask for one step at a time.",
      },
    ],
    example:
      "I'm in 5th grade and I'm stuck on adding fractions with different denominators (like 1/3 + 1/4). Don't give me the answer right away — give me one hint at a time and let me try each step myself. After I get the idea, give me 3 practice problems of increasing difficulty so I can check myself, and explain the common-denominator trick simply.",
  },
  {
    id: "orange-1",
    title: "A Game Mechanic That's Actually Buildable",
    scenario:
      "You're building a platformer in the Project studio and want an AI to help design a double-jump power-up.",
    badPrompt: "add a jump powerup",
    goal: "Describe the mechanic precisely enough that an AI (or you) could code it directly.",
    rubric: [
      {
        label: "Gives real numbers",
        hint: "How many jumps? How much higher? Use numbers.",
      },
      {
        label: "Asks for code/pseudocode",
        hint: "Ask for actual code or pseudocode, not just a description.",
      },
      {
        label: "Names the trigger",
        hint: "What has to happen for this to activate — press a key? collect an item?",
      },
      {
        label: "Asks for feedback (sound/visual)",
        hint: "How does the player know it happened — sound? flash?",
      },
      {
        label: "References the existing code",
        hint: "Mention hooking into an existing variable like JUMP_POWER.",
      },
    ],
    example:
      "In my platformer, add a double-jump power-up. When the player collects a floating star sprite, set a canDoubleJump flag to true for the rest of the level. If the player presses spacebar while already in the air and canDoubleJump is true, apply a second upward velocity of -12 (using the same JUMP_POWER variable style already in my code) and play a quick sparkle particle effect plus a 'boing' sound. Give me this as a commented JavaScript function I can drop into my existing update loop.",
  },
  {
    id: "orange-2",
    title: "Pixel Art Character Sheet, Not Just One Picture",
    scenario:
      "You want AI-generated pixel art for your game's main character, ready to actually use.",
    badPrompt: "make pixel art of my character",
    goal: "Describe it so precisely that the output is usable in a real game, not just a nice picture.",
    rubric: [
      {
        label: "Gives a pixel grid size",
        hint: "16x16? 32x32? Name the resolution.",
      },
      {
        label: "Asks for multiple poses",
        hint: "Ask for front/side view or a walk cycle, not just one pose.",
      },
      {
        label: "Describes character details",
        hint: "Hair color? Outfit? Distinct features?",
      },
      {
        label: "Specifies background",
        hint: "Ask for a transparent or plain background so it's usable.",
      },
      {
        label: "Names a retro style reference",
        hint: "8-bit? SNES-style? Give a reference.",
      },
    ],
    example:
      "Design a 32x32 pixel-art character sheet in 16-bit SNES style: a small explorer kid with a red backpack, green cap, and brown boots. Show 4 frames of a walking animation facing right, plus a single front-facing idle pose. Use a transparent background so I can drop these directly into a sprite sheet for my game.",
  },
  {
    id: "green-1",
    title: "Age-Appropriate Villain Design",
    scenario:
      "You want an AI to design a spooky-but-not-scary villain for a game your little cousin will play.",
    badPrompt: "make a scary villain",
    goal: "Add real constraints so the result is actually appropriate and usable, not just 'cool'.",
    rubric: [
      {
        label: "States audience age",
        hint: "How old is the player? Say it explicitly.",
      },
      {
        label: "Gives a real constraint",
        hint: "Say what to avoid — 'no blood', 'not too scary'.",
      },
      {
        label: "Adds a redeeming/silly trait",
        hint: "Give the villain a funny or sympathetic side.",
      },
      {
        label: "Names a visual style",
        hint: "Cartoonish? What color scheme?",
      },
      {
        label: "Says the villain's role",
        hint: "Is it a boss? What do they guard or block?",
      },
    ],
    example:
      "Design a spooky-but-silly villain for a platformer my 7-year-old cousin will play — nothing gory or genuinely scary, no blood or violence, just 'fun spooky' like a cartoon Halloween special. Make it a bumbling ghost librarian named Boo-kworm who's actually just grumpy about overdue books, with a purple-and-white color scheme and a clumsy waddle-float move. He should be the boss of the final level, blocking the exit until the player returns 3 'borrowed' books scattered around the level.",
  },
  {
    id: "green-2",
    title: "A Comic Strip With Real Structure",
    scenario:
      "You want an AI to write a 4-panel comic script about a superhero's bad day.",
    badPrompt: "write a comic about a superhero",
    goal: "Give it enough structure and constraints that the panels actually connect into a joke.",
    rubric: [
      {
        label: "Specifies panel format",
        hint: "Say how many panels and that it's a comic script.",
      },
      {
        label: "Names the character",
        hint: "Give your superhero a name.",
      },
      {
        label: "Sets up a twist or constraint",
        hint: "What's the ironic twist to the 'bad day'?",
      },
      {
        label: "Asks for dialogue format",
        hint: "Ask for actual speech-bubble text per panel.",
      },
      {
        label: "Sets a comedic tone",
        hint: "Say you want it funny/lighthearted.",
      },
    ],
    example:
      "Write a 4-panel comic strip script (with panel descriptions and speech-bubble dialogue) about a superhero named Captain Static who has incredible lightning powers but is deathly allergic to rubber — so every villain now just wears rubber gloves. Make it lighthearted and deadpan, ending on an ironic punchline in panel 4, not a real fight scene.",
  },
  {
    id: "blue-1",
    title: "Debugging Help With an Example",
    scenario:
      "Your game code has a bug — the player falls through the floor sometimes — and you want AI help fixing it.",
    badPrompt: "my game is broken fix it",
    goal: "Give enough context and an example that the AI can actually diagnose the real bug.",
    rubric: [
      {
        label: "Describes the exact symptom",
        hint: "What exactly goes wrong, and when?",
      },
      {
        label: "Shares the relevant code",
        hint: "Paste or describe the actual code involved.",
      },
      {
        label: "Gives steps to reproduce",
        hint: "What do you do right before it breaks?",
      },
      {
        label: "Asks WHY, not just for a fix",
        hint: "Ask the AI to explain the cause, not just paste a fix.",
      },
      {
        label: "Gives an example of what SHOULD happen",
        hint: "Describe what correct behavior looks like.",
      },
    ],
    example:
      "In my platformer, the player sometimes falls straight through platform tiles, but only when landing at high speed after a long fall — it doesn't happen with normal jumps. Here's my collision-check function: [paste code]. It's supposed to stop the player exactly on top of the platform, like it does for a regular jump. Can you explain why high speed might cause this (I'm guessing it's related to how far the player moves in one frame) and suggest a fix, not just give me new code to paste blindly?",
  },
  {
    id: "blue-2",
    title: "A Study Plan That Fits Your Actual Week",
    scenario:
      "You want AI help building a one-week study plan for a big science test.",
    badPrompt: "make me a study schedule",
    goal: "Give real constraints (time, topics, format) so the plan is something you'd actually follow.",
    rubric: [
      {
        label: "States available time",
        hint: "How much time per day, and for how many days?",
      },
      {
        label: "Lists the real topics",
        hint: "What's actually on the test?",
      },
      {
        label: "Requests a specific format",
        hint: "Ask for a table or day-by-day checklist.",
      },
      {
        label: "Names a study method",
        hint: "Flashcards? Practice quizzes? Say the method.",
      },
      {
        label: "Gives an example day",
        hint: "Show what one sample day should look like.",
      },
    ],
    example:
      "I have a science test in 6 days on cells, photosynthesis, and ecosystems, and about 40 minutes a day to study on weekdays plus 2 hours on Saturday. Build me a day-by-day table with a specific study method each day (flashcards, practice quiz, teach-it-to-someone, etc.), reviewing the hardest topic (photosynthesis) twice. For example, Day 1 might be '20 min flashcards on cell parts + 20 min labeling diagram' — give me all 6 days in that same concrete style.",
  },
  {
    id: "purple-1",
    title: "A One-Page Game Design Doc",
    scenario:
      "Before building a new game in the Forge, you want an AI to help you draft a real one-page design document.",
    badPrompt: "help me design a game",
    goal: "Ask for a structured multi-section document, not just an idea dump.",
    rubric: [
      {
        label: "Requests named sections",
        hint: "Ask for specific sections like 'core loop', 'controls', 'win condition'.",
      },
      {
        label: "Gives a genre or reference game",
        hint: "Compare it to something — 'like a mini Stardew Valley'.",
      },
      {
        label: "Sets a scope constraint",
        hint: "Say it needs to be small/buildable in a weekend.",
      },
      {
        label: "Requests a clean format",
        hint: "Ask for headings and bullet points.",
      },
      {
        label: "Describes the target feeling",
        hint: "How should the player FEEL playing it?",
      },
    ],
    example:
      "Help me draft a one-page game design doc, in markdown with headings and bullet points, for a small farming-sim-lite game inspired by Stardew Valley but scoped to a single weekend build (one field, 3 crop types, no NPCs). Include sections for: Core Loop, Controls, Win/Progress Condition, Art Style, and Stretch Goals. The player should feel relaxed and rewarded by small routines, not stressed by time pressure.",
  },
  {
    id: "purple-2",
    title: "An Honest Art Critique, Not Just Praise",
    scenario:
      "You made a piece of pixel art and want an AI to give real, useful feedback — not empty compliments.",
    badPrompt: "what do you think of my art",
    goal: "Ask for structured, specific, actionable feedback across multiple angles.",
    rubric: [
      {
        label: "Names critique categories",
        hint: "Ask about color, composition, readability specifically.",
      },
      {
        label: "Explicitly asks for honesty",
        hint: "Say 'don't just tell me it's good, be honest'.",
      },
      {
        label: "States your intent for the piece",
        hint: "What were you trying to achieve with it?",
      },
      {
        label: "Requests a ranked/numbered format",
        hint: "Ask for a numbered or prioritized list.",
      },
      {
        label: "Asks for the ONE biggest fix",
        hint: "Ask what the single most important change would be.",
      },
    ],
    example:
      "I made a 32x32 pixel-art sprite of my game's hero (attached) and I'm trying to make it read clearly as a friendly explorer even at small size on a busy background. Please give me honest, constructive feedback — don't just say it looks good — as a numbered list covering: silhouette readability, color contrast against a forest background, and shading. Then tell me the single biggest change I should make first.",
  },
  {
    id: "brown-1",
    title: "Code That Handles What Goes Wrong",
    scenario:
      "You want an AI to write a save/load function for your game — one that won't break your save file.",
    badPrompt: "write save and load code",
    goal: "Specify format, error handling, and edge cases so the code is actually production-safe.",
    rubric: [
      {
        label: "Specifies the data format",
        hint: "JSON? localStorage? Name the format.",
      },
      {
        label: "Requests error handling",
        hint: "What happens if the save is missing or corrupted?",
      },
      {
        label: "Lists the exact data to save",
        hint: "What fields need saving — score? level? position?",
      },
      {
        label: "Requests comments/explanation",
        hint: "Ask for comments explaining each part.",
      },
      {
        label: "Asks for a fallback behavior",
        hint: "What should happen with no valid save — start a fresh game?",
      },
    ],
    example:
      "Write a saveGame() and loadGame() pair of JavaScript functions using localStorage, storing the player's score, current level, and position as JSON. In loadGame(), handle the case where localStorage is empty (no save yet) or the JSON is corrupted/unparseable — in both cases, fall back to a fresh default game state instead of crashing. Add comments explaining each step so I can follow the logic.",
  },
  {
    id: "brown-2",
    title: "A Branching Story With Real Rules",
    scenario:
      "You want an AI to write a choose-your-own-adventure story with actual branching choices.",
    badPrompt: "write a choose your own adventure story",
    goal: "Give enough structural rules that the branches actually work as a system, not just a list of scenes.",
    rubric: [
      {
        label: "Specifies number of branches",
        hint: "How many choice points and endings?",
      },
      {
        label: "Requests a labeling system",
        hint: "Ask for numbered scenes so branches are easy to follow.",
      },
      {
        label: "States genre/setting",
        hint: "What world or genre is this in?",
      },
      {
        label: "Requires distinct endings",
        hint: "Say each ending must feel meaningfully different.",
      },
      {
        label: "Sets a length per scene",
        hint: "How long should each scene be?",
      },
    ],
    example:
      "Write a choose-your-own-adventure mystery story set on an abandoned space station, with exactly 3 choice points leading to 4 distinct endings (not just variations of the same outcome). Label each scene clearly (Scene 1, Scene 1A, Scene 1B, etc.) so I can follow the branches, keep each scene to 2-3 short paragraphs, and make sure only one ending is the 'good' ending where the player escapes safely.",
  },
  {
    id: "black-1",
    title: "Build Me a Study Buddy Agent",
    scenario:
      "You want to design a prompt for an AI 'study buddy agent' that quizzes you across multiple sessions, remembers what you struggled with, and adapts.",
    badPrompt: "be my study buddy",
    goal: "Write a full agent-style prompt: role, context/memory rules, step-by-step process, output format, and an edge case.",
    rubric: [
      {
        label: "Assigns a clear role",
        hint: "Start with 'You are...' to define its role.",
      },
      {
        label: "Defines a multi-step process",
        hint: "Lay out the steps it should follow each session.",
      },
      {
        label: "Sets memory/context rules",
        hint: "Say what it should remember between sessions.",
      },
      {
        label: "Specifies an output format",
        hint: "Ask for a consistent response format each time.",
      },
      {
        label: "Handles an edge case",
        hint: "What should it do if you keep getting something wrong?",
      },
      {
        label: "Gives an example interaction",
        hint: "Show a sample question/answer exchange.",
      },
    ],
    example:
      "You are Quizzy, a patient study-buddy agent helping me review for tests across multiple sessions. Each session, follow this process: (1) ask which subject/topic to review, (2) quiz me with 5 questions, easiest first, (3) after each answer, tell me if I'm right and briefly explain why, (4) at the end, summarize which topics I got wrong. Keep track of topics I've struggled with across sessions and start future sessions by re-testing those first. If I get the same topic wrong 3 times total, stop quizzing on it and instead explain it a completely different way (analogy, diagram description, or story) before trying again. Always format your quiz questions as a numbered list and your end-of-session summary as 'Nailed it: [...]' and 'Keep practicing: [...]'. Example: Q1: 'What is 3/4 + 1/8?' → I answer '7/8' → you say 'Correct! You found the common denominator of 8 correctly.'",
  },
  {
    id: "black-2",
    title: "Design-and-Build a Mini Game in One Shot",
    scenario:
      "You want an AI to act as a full 'game co-designer + coder' — going from your idea to an actual playable prototype in one structured conversation.",
    badPrompt: "make a cool game with you",
    goal: "Write a prompt that gives context, a clear multi-step process, an exact output format for the code, and edge-case rules — a true agent-style prompt.",
    rubric: [
      {
        label: "Gives context up front",
        hint: "Tell it what you have already (Forge editor, Canvas, JS).",
      },
      {
        label: "Assigns a role",
        hint: "'You are my game co-designer and coder.'",
      },
      {
        label: "Lays out ordered steps",
        hint: "Number the steps: idea, then mechanics, then code.",
      },
      {
        label: "Specifies exact code format",
        hint: "Say exactly what format the code should be in.",
      },
      {
        label: "Includes a scope constraint",
        hint: "Limit scope — no libraries, under X lines, etc.",
      },
      {
        label: "Handles ambiguity or edge cases",
        hint: "Tell it to ask clarifying questions if your idea is unclear.",
      },
    ],
    example:
      "You are my game co-designer and coder. Context: I'm working in a browser-based Canvas + vanilla JavaScript editor (no external libraries allowed), and I want to build a simple dodge-the-falling-objects game. Follow this process: Step 1 — ask me 2-3 clarifying questions about the player character, difficulty curve, and win condition if anything I say is ambiguous. Step 2 — once confirmed, write a short design summary (mechanics, controls, win/loss). Step 3 — output the full working prototype as a single self-contained HTML file with inline JS in one code block, under 150 lines, with comments marking the key tweakable variables (like FALL_SPEED and SPAWN_RATE) so I can remix it later. If my idea has an edge case you're unsure about (like what happens at max difficulty), ask me instead of guessing.",
  },
];
