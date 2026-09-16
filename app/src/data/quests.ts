import { READINESS_LESSONS } from "./readiness.ts";
import { TOGETHER_LESSONS } from "./together.ts";
import type { Quest, Track } from "../types";

export const TRACKS: Track[] = [
  {
    id: "code-craft",
    name: "Code Craft",
    tagline: "Programming fundamentals through real JavaScript",
    icon: "🧱",
    color: "#00b4ff",
  },
  {
    id: "ai-explorer",
    name: "AI Explorer",
    tagline: "How AI actually works, prompt by prompt",
    icon: "🤖",
    color: "#ff00aa",
  },
  {
    id: "game-design",
    name: "Game Design",
    tagline: "Mechanics, pixel art, and the craft of fun",
    icon: "🕹️",
    color: "#00ff9f",
  },
  {
    id: "build-together",
    name: "Build Together",
    tagline: "Private projects, useful history, and responsible open source",
    icon: "📁",
    color: "#006071",
  },
];

export const QUESTS: Quest[] = [
  // ── CODE CRAFT · TIER 1 ────────────────────────────────────────────────────
  {
    id: "cc1-sequences",
    track: "code-craft",
    tier: 1,
    minAgeMode: "junior",
    title: "Step by Step",
    tagline: "Order is everything — even for robots",
    icon: "🧭",
    prereqs: [],
    xp: 60,
    brief:
      "Ever notice a Minecraft crafting recipe doesn't work if you put items in the wrong slots? Same deal with code — computers do EXACTLY what you tell them, in EXACTLY the order you tell them.",
    lesson: [
      "A **sequence** is just a list of steps a computer runs one at a time, top to bottom, in order. No skipping, no guessing what you 'meant' — the computer does exactly what's written, exactly in that order.",
      "Think about opening a chest in a video game: `walk to chest`, `press E`, `pick up loot`. Swap step 1 and step 2 and you're pressing E on empty air. Code breaks the same way when steps are out of order.",
      "In real code this looks like separate lines that each do one thing: `let hp = 100`, then `hp = hp - 20`, then `console.log(hp)`. Each line finishes before the next one starts.",
      "This is the first rule of thinking like a programmer: **before you write anything, picture the exact order things need to happen.** Every game, app, and AI model you'll ever touch is built on sequences just like this.",
    ],
    questions: [
      {
        prompt:
          "You want a character to 'take damage, then check if HP is 0, then show Game Over.' Which order is correct?",
        options: [
          "Check HP → Take damage → Game Over",
          "Take damage → Check HP → Game Over",
          "Game Over → Take damage → Check HP",
          "All three at the exact same time",
        ],
        answer: 1,
        explain:
          "You have to apply the damage FIRST so the HP value is up to date, THEN check whether it hit 0, THEN react. Checking before applying damage would use stale data.",
      },
      {
        prompt:
          "What does a computer do if you write two steps in the wrong order?",
        options: [
          "It automatically fixes the order for you",
          "It guesses what you probably meant",
          "It runs them in the order you wrote, mistakes and all",
          "It skips both steps",
        ],
        answer: 2,
        explain:
          "Computers don't guess intent — they run your exact sequence. This is basically the first law of coding: it does what you SAY, not what you MEANT.",
      },
    ],
    creative: {
      prompt:
        "Grab paper (or Minecraft, if you've got it up) and write out the exact sequence of steps for a character to open a treasure chest, equip a sword, and fight a zombie — one action per line, in the correct order.",
      checklist: [
        "Every step is its own line",
        "The steps are in an order that would actually work in real life/game",
        "You have at least 5 steps",
        "Nothing important got skipped (like 'open chest' before 'take item')",
      ],
    },
  },
  {
    id: "cc1-conditionals",
    track: "code-craft",
    tier: 1,
    minAgeMode: "junior",
    title: "If This, Then Boom",
    tagline: "Teaching your code to make decisions",
    icon: "🔀",
    prereqs: ["cc1-sequences"],
    xp: 60,
    brief:
      "Every good game reacts to what you do — jump on a Goomba and it's squashed, miss and you take damage. That reacting is called a **conditional**, and it's how code makes decisions.",
    lesson: [
      "An `if` statement asks a yes/no question and only runs some code when the answer is yes. In plain English: **'if the door is locked, show a key icon.'** In code: `if (doorLocked) { showKeyIcon() }`.",
      "You can add an **else** for the opposite case: `if (hp <= 0) { gameOver() } else { keepPlaying() }`. Only one branch ever runs — never both.",
      "Conditions are built from comparisons like `>`, `<`, `===` (equals), and `!==` (not equals). `if (coins >= 100)` checks 'is coins 100 or more?' — that's the exact question the computer answers, nothing fuzzier.",
      "Almost everything that feels 'smart' in a game — enemies noticing you, doors needing keys, score thresholds unlocking new levels — is just conditionals stacked on top of each other. It's not magic, it's just `if` questions, a LOT of them.",
    ],
    questions: [
      {
        prompt:
          "In `if (score >= 1000) { unlockLevel2() }`, when does `unlockLevel2()` run?",
        options: [
          "Every single frame no matter what",
          "Only when score is 1000 or higher",
          "Only when score is exactly 999",
          "It runs once and never again",
        ],
        answer: 1,
        explain:
          "`>=` means 'greater than or equal to,' so the code inside only runs when score has reached at least 1000.",
      },
      {
        prompt: "What's true about `if / else`?",
        options: [
          "Both blocks always run together",
          "Only the `if` block can ever run, `else` is decoration",
          "Exactly one of the two blocks runs, never both",
          "`else` runs first, then `if`",
        ],
        answer: 2,
        explain:
          "`if/else` is an either/or fork in the road — the condition picks exactly one path, and the other path is skipped completely.",
      },
    ],
    creative: {
      prompt:
        "Design 3 'if this, then that' rules for an enemy in a game of your choice (real or made up) — e.g., 'if player is close, chase them.' Write them as `if (...) { ... }` in plain English or real-ish code.",
      checklist: [
        "You wrote 3 different conditions",
        "Each one has a clear condition AND a clear result",
        "At least one uses a comparison like >, <, or ==",
        "You could explain each rule out loud in one sentence",
      ],
    },
  },
  {
    id: "cc1-loops",
    track: "code-craft",
    tier: 1,
    minAgeMode: "junior",
    title: "Loop-de-Loop",
    tagline: "Say it once, run it a thousand times",
    icon: "🔁",
    prereqs: ["cc1-conditionals"],
    xp: 65,
    badge: { id: "badge-loop-master", label: "Loop Master", icon: "🔁" },
    brief:
      "Imagine writing 'spawn zombie' one hundred times by hand for a horde wave. Gross, right? **Loops** let you say 'do this a bunch of times' once, and the computer handles the repeating.",
    lesson: [
      "A **loop** repeats a block of code until a condition says stop. The two you'll meet constantly are `for` (repeat a known number of times) and `while` (repeat until something becomes false).",
      "A `for` loop looks like this: `for (let i = 0; i < 5; i++) { spawnZombie() }` — that spawns exactly 5 zombies. `i` is a counter that starts at 0 and climbs by 1 (`i++`) each time, and the loop stops the moment `i < 5` is false.",
      "A `while` loop is for when you don't know the exact count ahead of time: `while (hp > 0) { keepFighting() }` — it just keeps going as long as the condition stays true.",
      "Loops are everywhere: every enemy wave, every particle effect, every frame of animation in a game is a loop running over and over, insanely fast, so it feels smooth to you.",
      "Danger zone: forget to change the condition (like forgetting `i++`) and you get an **infinite loop** — the program never stops and your game freezes. Every programmer has done this at least once. It's basically a rite of passage.",
    ],
    questions: [
      {
        prompt:
          "`for (let i = 0; i < 3; i++) { console.log('hi') }` — how many times does it print 'hi'?",
        options: ["2", "3", "4", "Forever"],
        answer: 1,
        explain:
          "It starts at i=0 and runs while i < 3, so it runs for i=0, 1, 2 — that's 3 times total, then stops.",
      },
      {
        prompt: "What causes an infinite loop?",
        options: [
          "Using `for` instead of `while`",
          "The loop's stopping condition never becomes false",
          "Writing too many console.log statements",
          "Using a variable named `i`",
        ],
        answer: 1,
        explain:
          "A loop keeps running as long as its condition is true. If nothing inside the loop ever makes that condition false, it truly never stops — that's an infinite loop.",
      },
      {
        prompt: "Which is the better tool for 'spawn exactly 10 coins'?",
        options: [
          "`while` loop, because it's simpler",
          "`for` loop, because you know the exact count",
          "An `if` statement",
          "You must write it 10 separate times",
        ],
        answer: 1,
        explain:
          "`for` loops shine when you already know how many repeats you need — 'exactly 10' is a perfect `for (let i = 0; i < 10; i++)` job.",
      },
    ],
    creative: {
      prompt:
        "On paper, 'act out' a loop: write a rule like 'while HP > 0, take 1 step forward' and simulate it by hand for a starting HP of 5 — write down what happens on each pass through the loop.",
      checklist: [
        "You clearly wrote the loop's stopping condition",
        "You traced at least 5 passes through the loop",
        "You can point to the exact pass where the loop stops",
        "Nothing repeats forever — you know why it ends",
      ],
    },
  },
  {
    id: "cc1-variables",
    track: "code-craft",
    tier: 1,
    minAgeMode: "junior",
    title: "Named Boxes",
    tagline: "Give your data somewhere to live",
    icon: "📦",
    prereqs: ["cc1-loops"],
    xp: 60,
    brief:
      "Your character's HP, your score, your username — none of it exists unless you give it a place to live. That place is a **variable**, and it's the most-used tool in all of coding.",
    lesson: [
      "A **variable** is a named box that holds a value. In JavaScript you make one with `let` or `const`: `let hp = 100` creates a box named `hp` holding the number 100.",
      "`let` means the value can change later (`hp = hp - 10`), while `const` means it's locked forever once set (`const playerName = 'Nova'`). Use `const` by default — it's like a permanent marker instead of pencil, and it stops you from accidentally overwriting something important.",
      "Variables can hold different **types**: numbers (`100`), strings/text (`'Nova'`), booleans/true-false (`true`), and more. The computer treats each type differently — you can do math on numbers but not on text.",
      "Good variable names matter more than beginners expect. `hp` or `playerScore` tells a human (including future-you) exactly what's inside. `x` or `thing1` tells nobody anything. Name things like you're leaving a note for a friend.",
    ],
    questions: [
      {
        prompt: "What's the difference between `let` and `const`?",
        options: [
          "No difference, they're identical",
          "`let` can be reassigned later, `const` cannot",
          "`const` is only for numbers",
          "`let` is faster to run",
        ],
        answer: 1,
        explain:
          "`let` creates a variable you can change later; `const` locks the value in place — trying to reassign a `const` throws an error.",
      },
      {
        prompt: "`let score = 10; score = score + 5;` — what is `score` now?",
        options: ["10", "5", "15", "An error — you can't reuse `score`"],
        answer: 2,
        explain:
          "The right side runs first: `score + 5` is `10 + 5 = 15`, and that new value gets stored back into `score`. `let` variables are allowed to be reassigned like this.",
      },
    ],
    creative: {
      prompt:
        "List 6 variables a simple RPG character would need (like `hp`, `level`, `name`) and write out realistic starting values for each, using `let` or `const` correctly for each one.",
      checklist: [
        "You picked at least 6 different variables",
        "Each has a clear, honest name",
        "You chose `let` vs `const` correctly for each (does it need to change later?)",
        "Each value matches its type (numbers for numbers, quotes around text)",
      ],
    },
  },

  // ── CODE CRAFT · TIER 2 ────────────────────────────────────────────────────
  {
    id: "cc2-functions",
    track: "code-craft",
    tier: 2,
    minAgeMode: "junior",
    title: "Function Factory",
    tagline: "Build the machine once, use it forever",
    icon: "🏭",
    prereqs: ["cc1-variables"],
    xp: 100,
    brief:
      "Tired of copy-pasting the same 5 lines every time a zombie spawns? A **function** is a reusable mini-machine: build it once, call it by name whenever you need it.",
    lesson: [
      "A **function** packages up a block of code so you can run it over and over by calling its name, instead of retyping it every time. You define one with the `function` keyword: `function spawnZombie() { /* code here */ }`, then run it anywhere with `spawnZombie()`.",
      "Functions get way more powerful with **parameters** — inputs you hand them. `function spawnZombie(x, y) { /* place zombie at x, y */ }` lets you call `spawnZombie(100, 50)` and `spawnZombie(300, 20)` to spawn zombies in different spots using the SAME machine.",
      "Functions can also **return** a value back to whoever called them: `function double(n) { return n * 2 }` — calling `double(5)` hands you back `10`, which you can store or use immediately.",
      "This is the single biggest habit shift from 'kid who writes code' to 'programmer': instead of repeating yourself, you build a small, named, reusable tool. Real codebases are basically thousands of small functions calling each other.",
    ],
    questions: [
      {
        prompt:
          "Why use a function instead of copy-pasting the same code five times?",
        options: [
          "Copy-pasting runs faster",
          "If you need to fix a bug, you fix it once instead of five times",
          "Functions are required by the computer",
          "There's no real benefit",
        ],
        answer: 1,
        explain:
          "The huge win is maintenance: one bug fix or tweak inside the function instantly applies everywhere it's called, instead of you hunting down five copies.",
      },
      {
        prompt:
          "`function double(n) { return n * 2 } console.log(double(4))` — what prints?",
        options: ["4", "8", "double(4)", "Nothing, it's an error"],
        answer: 1,
        explain:
          "Calling `double(4)` runs `4 * 2` and returns `8`, which is what gets logged.",
      },
    ],
    creative: {
      prompt:
        "Design a function (in pseudocode or real JS) called `takeDamage(currentHP, damage)` that returns the new HP, and trace it by hand for 3 different damage values.",
      checklist: [
        "Function has a clear name and parameters",
        "It uses `return` to hand back a value",
        "You traced at least 3 example calls by hand",
        "The math is actually correct for each trace",
      ],
    },
  },
  {
    id: "cc2-arrays",
    track: "code-craft",
    tier: 2,
    minAgeMode: "junior",
    title: "Lineup Lists",
    tagline: "One box to hold your whole inventory",
    icon: "🎒",
    prereqs: ["cc2-functions"],
    xp: 100,
    badge: { id: "badge-array-ace", label: "Array Ace", icon: "🎒" },
    brief:
      "Your Minecraft hotbar, your Fortnite inventory, a leaderboard's top 10 — all lineups of items in order. In code, that's an **array**.",
    lesson: [
      "An **array** is an ordered list of values in one variable: `let inventory = ['sword', 'shield', 'potion']`. Each item has a position called an **index**, and indexes start counting at **0**, not 1 — so `inventory[0]` is `'sword'`, and `inventory[2]` is `'potion'`.",
      "You can add to the end with `.push()`: `inventory.push('bow')` now makes the list `['sword', 'shield', 'potion', 'bow']`. You can check how many items exist with `.length` — `inventory.length` would be `4`.",
      "Arrays get really powerful with loops: `for (let i = 0; i < inventory.length; i++) { console.log(inventory[i]) }` prints every item, no matter how long the list gets. That combo (array + loop) is one of the most common patterns in all of programming.",
      "Real games store almost everything in arrays: every enemy on screen, every bullet flying, every high score. When you hear 'iterate over a list,' this is exactly what's happening.",
    ],
    questions: [
      {
        prompt: "`let items = ['bow','axe','map']` — what is `items[1]`?",
        options: ["'bow'", "'axe'", "'map'", "1"],
        answer: 1,
        explain:
          "Indexes start at 0, so index 0 is 'bow', index 1 is 'axe', and index 2 is 'map'.",
      },
      {
        prompt: "What does `.push('gem')` do to an array?",
        options: [
          "Removes 'gem' from the array",
          "Adds 'gem' to the end of the array",
          "Replaces the whole array with 'gem'",
          "Sorts the array alphabetically",
        ],
        answer: 1,
        explain:
          "`.push()` adds a new item onto the end of the array, growing its length by 1.",
      },
      {
        prompt: "Why combine arrays with loops so often?",
        options: [
          "Because arrays don't work without loops",
          "To do the same action to every item without writing it out one-by-one",
          "Loops make arrays load faster",
          "It's required by JavaScript syntax rules",
        ],
        answer: 1,
        explain:
          "A loop lets you visit every index of an array automatically — perfect for 'do X to every enemy' or 'print every item' without hand-writing a line per item.",
      },
    ],
    creative: {
      prompt:
        "Write out an array of 6 items for a game inventory of your choice, then write (in pseudocode or real code) a loop that prints each item with its position number.",
      checklist: [
        "Array has exactly 6 items, in square brackets, comma-separated",
        "You correctly identify index 0 as the first item",
        "Your loop visits every index (not just the first one)",
        "Output would show both the position and the item name",
      ],
    },
  },
  {
    id: "cc2-objects",
    track: "code-craft",
    tier: 2,
    minAgeMode: "builder",
    title: "Object Blueprints",
    tagline: "One box, a bunch of labeled compartments",
    icon: "🗂️",
    prereqs: ["cc2-arrays"],
    xp: 100,
    brief:
      "An array is great for a list, but a character isn't just a list — it's a name, HP, level, and inventory all bundled together. That bundle is an **object**.",
    lesson: [
      "An **object** stores data as labeled **key-value pairs**: `let player = { name: 'Nova', hp: 100, level: 3 }`. Each key (`name`, `hp`, `level`) points to a value, like labeled drawers in a dresser.",
      "You grab a value with **dot notation**: `player.hp` gives you `100`. You can change it the same way: `player.hp = player.hp - 10` deals 10 damage.",
      "Objects can hold arrays, and arrays can hold objects — that's how you build real game state: `let player = { name: 'Nova', inventory: ['sword', 'potion'] }`. Almost every character, item, and level in a real game is an object like this under the hood.",
      "The difference in one line: use an **array** when order and position matter (a list of enemies), use an **object** when named properties matter (one character's stats).",
    ],
    questions: [
      {
        prompt:
          "`let hero = { name: 'Zed', hp: 80 }` — how do you read the HP?",
        options: ["`hero[0]`", "`hero.hp`", "`hp.hero`", "`hero('hp')`"],
        answer: 1,
        explain:
          "Objects use dot notation with the key name — `hero.hp` reads the value stored under the `hp` key, which is `80`.",
      },
      {
        prompt: "When should you reach for an object instead of an array?",
        options: [
          "When you need an ordered list of similar items",
          "When you need to bundle different named properties about one thing",
          "Never — arrays can do everything objects can",
          "Only when working with numbers",
        ],
        answer: 1,
        explain:
          "Objects are for describing one 'thing' with multiple named traits (name, hp, level). Arrays are better for ordered lists of similar items.",
      },
    ],
    creative: {
      prompt:
        "Design an object for a game character with at least 5 properties (mixing at least one number, one string, and one array), then write out what `character.hp = character.hp - 15` would produce if hp started at 100.",
      checklist: [
        "Object has 5+ properties with clear names",
        "At least one number, one string, and one array property",
        "You correctly traced the HP math after the damage",
        "You used dot notation correctly when referencing properties",
      ],
    },
  },
  {
    id: "cc2-events",
    track: "code-craft",
    tier: 2,
    minAgeMode: "builder",
    title: "Event Listeners",
    tagline: "Teach your code to react to the real world",
    icon: "🎧",
    prereqs: ["cc2-objects"],
    xp: 100,
    brief:
      "Code doesn't just run top-to-bottom forever — a LOT of it just waits around for something to happen, like a click or a key press. That's an **event**.",
    lesson: [
      "An **event** is something that happens — a mouse click, a key press, a timer finishing. An **event listener** is code that waits for that event and reacts when it fires: `button.addEventListener('click', jump)` means 'when this button is clicked, run the `jump` function.'",
      "This flips how you think about program flow. Instead of one long sequence from top to bottom, your code sits ready, and different functions fire in response to different events, in whatever order the player actually does things.",
      "Games are built almost entirely on this: `keydown` for movement, `click` for shooting, `collision` for taking damage. The **game loop** (you'll meet this in Game Design) constantly checks for new events and hands them off to the right function.",
      "The function that runs when an event fires is often called a **callback** — literally 'call me back when this happens.' Callbacks are everywhere once you start looking: timers, animations, button clicks, even AI chat responses arriving.",
    ],
    questions: [
      {
        prompt: "What is an event listener actually doing while it 'waits'?",
        options: [
          "Running the same code over and over pointlessly",
          "Sitting ready to trigger a specific function when a specific event happens",
          "Slowing down the whole program on purpose",
          "Nothing — event listeners don't really exist",
        ],
        answer: 1,
        explain:
          "An event listener registers 'when X happens, run this function' and then the browser/engine handles firing it at the right moment — it's not constantly re-running your code.",
      },
      {
        prompt:
          "`document.addEventListener('keydown', jump)` — when does `jump` run?",
        options: [
          "Immediately when the page loads, once",
          "Every single frame no matter what",
          "Whenever a key is pressed down",
          "Only when the mouse moves",
        ],
        answer: 2,
        explain:
          "`'keydown'` is the specific event name for a key being pressed, so `jump` fires every time any key goes down (you'd usually check WHICH key inside `jump`).",
      },
    ],
    creative: {
      prompt:
        "List 4 events a simple platformer game needs to listen for (like jump, move left, pause) and write, for each, what function should run and what it should do.",
      checklist: [
        "4 distinct events listed",
        "Each event is paired with a clearly named function",
        "You describe what each function actually does when triggered",
        "At least one uses a keyboard event and one uses a different kind (click, collision, timer)",
      ],
    },
  },

  // ── CODE CRAFT · TIER 3 ────────────────────────────────────────────────────
  {
    id: "cc3-debugging",
    track: "code-craft",
    tier: 3,
    minAgeMode: "legend",
    title: "Bug Hunter",
    tagline: "Every red error is a clue, not a wall",
    icon: "🐛",
    prereqs: ["cc2-events"],
    xp: 150,
    badge: { id: "badge-bug-hunter", label: "Bug Hunter", icon: "🐛" },
    brief:
      "Every programmer on Earth — yes, the ones who built the game you're playing tonight — spends huge chunks of their day staring at broken code. **Debugging** is the actual skill that separates coders from people who gave up.",
    lesson: [
      "A **bug** is any code that doesn't do what you intended. **Debugging** is the process of finding and fixing it. The single best skill here isn't memorizing syntax — it's staying calm and reading carefully.",
      "Error messages are not your enemy. `Uncaught TypeError: Cannot read properties of undefined (reading 'hp')` is annoying to read, but it's telling you exactly two things: WHAT went wrong (tried to read `.hp` off something that doesn't exist) and roughly WHERE (the line number listed with it).",
      "A classic debugging move: sprinkle `console.log()` around your code to see what values actually are at each step, instead of what you assumed they were. `console.log('hp before:', hp)` right before a suspicious line often reveals the problem instantly.",
      "The real technique is **rubber duck debugging**: explain your code line-by-line, out loud, to literally anything (a rubber duck, a sibling, a wall). Half the time, saying 'and THEN this runs, and THEN—wait' out loud is enough for your brain to spot the mistake.",
      "Common tier-3 bugs to know by name: **off-by-one errors** (loop runs one too many/few times), **typos in variable names** (`plyaer` vs `player`), and **undefined values** (using something before it's ever set).",
    ],
    questions: [
      {
        prompt:
          "You get `Cannot read properties of undefined (reading 'hp')`. What's the most useful first move?",
        options: [
          "Delete the whole file and start over",
          "Ignore it, it'll probably fix itself",
          "Check what's supposed to hold the object with `.hp` — is it actually defined at that point?",
          "Add more features to distract from the bug",
        ],
        answer: 2,
        explain:
          "The error is telling you something is `undefined` when you tried to read `.hp` off it — the fastest fix is tracing back to where that object should've been created or passed in.",
      },
      {
        prompt: "What's an 'off-by-one' error?",
        options: [
          "A typo in a variable name",
          "A loop that runs one time too many or too few",
          "A missing semicolon",
          "Using the wrong data type",
        ],
        answer: 1,
        explain:
          "Off-by-one errors happen constantly around loop boundaries — like using `<=` instead of `<`, causing one extra (or one missing) iteration.",
      },
      {
        prompt: "Why does 'rubber duck debugging' actually work?",
        options: [
          "Ducks are secretly good at coding",
          "Explaining code out loud, step by step, forces you to slow down and notice gaps you skipped over while thinking silently",
          "It's a myth with no real effect",
          "It only works with real ducks, not siblings or friends",
        ],
        answer: 1,
        explain:
          "Talking through your logic step-by-step forces precision. Your brain skips steps when thinking silently, but has to fill in every gap when narrating out loud — that's usually where the bug hides.",
      },
    ],
    creative: {
      prompt:
        "Find (or write) a short broken code snippet — even 5 lines — with a bug on purpose. Trade with a sibling/friend or just re-read it fresh in 10 minutes, and use `console.log` style notes to hunt the bug down. Write up what was wrong and how you found it.",
      checklist: [
        "You have a real (or realistic) broken snippet",
        "You describe the exact error or wrong behavior observed",
        "You explain the debugging steps you took, not just the final answer",
        "You state clearly what the actual bug was and the fix",
      ],
    },
  },
  {
    id: "cc3-reading-code",
    track: "code-craft",
    tier: 3,
    minAgeMode: "legend",
    title: "Code Archaeology",
    tagline: "Read like a detective before you touch a thing",
    icon: "🔍",
    prereqs: ["cc3-debugging"],
    xp: 150,
    brief:
      "Most professional coding isn't writing new code from scratch — it's reading someone ELSE's code (sometimes thousands of lines) to understand it before you can safely change anything. That's a real, learnable skill.",
    lesson: [
      "When you open a file you didn't write, don't try to understand every line at once. Start with the **shape**: what functions exist, what are they named, what do the names suggest they do? Good code names things honestly — `calculateDamage` almost certainly calculates damage.",
      "Trace **one path at a time**. Pick a single action (like 'what happens when the player presses jump') and follow it function-by-function, ignoring everything unrelated. Don't try to hold the whole program in your head at once — nobody can.",
      "Comments (`// like this`) are notes from the original author, but don't trust them blindly — code changes over time and comments sometimes go stale. The actual code is always the ground truth; the comment is just a hint.",
      "A great habit: when you finally understand a confusing chunk, add your OWN comment explaining it in your own words. You're leaving a trail for the next person (which might be you, in six months, having forgotten everything).",
    ],
    questions: [
      {
        prompt:
          "You open a big file you've never seen. What's the smartest first move?",
        options: [
          "Read every single line top to bottom in order",
          "Skim function names to get the overall shape before diving deep",
          "Rewrite the whole thing from scratch immediately",
          "Delete anything you don't immediately understand",
        ],
        answer: 1,
        explain:
          "Getting the big picture from function/variable names first gives you a map before you start exploring — way faster than reading blind top-to-bottom.",
      },
      {
        prompt:
          "Why shouldn't you 100% trust a comment in someone else's code?",
        options: [
          "Comments are always lies on purpose",
          "Code can change after the comment was written, so the comment might be outdated — the actual code is the real behavior",
          "Comments slow down the program",
          "Only AI-written comments can be trusted",
        ],
        answer: 1,
        explain:
          "Comments describe intent at the moment they were written. If the code changes later and nobody updates the comment, it goes stale — the running code is always the real truth.",
      },
    ],
    creative: {
      prompt:
        "Find any real, short piece of code online (a simple game snippet, a CodePen, an open tutorial example — doesn't need to be huge) you haven't seen before. Without running it, write a plain-English summary of what you THINK it does, function by function, then check yourself by running or researching it.",
      checklist: [
        "You picked real code you hadn't seen before",
        "You summarized what each major function seems to do",
        "You checked your guess against reality (ran it, or looked up docs)",
        "You noted anywhere your first guess was wrong",
      ],
    },
  },
  {
    id: "cc3-closures",
    track: "code-craft",
    tier: 3,
    minAgeMode: "legend",
    title: "Scope & Secrets",
    tagline: "Where your variables can (and can't) be seen",
    icon: "🔐",
    prereqs: ["cc3-reading-code"],
    xp: 150,
    brief:
      "Ever wonder why a variable inside one function is invisible to another function? That invisibility has a name — **scope** — and understanding it unlocks one of JavaScript's coolest tricks: **closures**.",
    lesson: [
      "**Scope** is the region of code where a variable exists and can be used. A variable made with `let` or `const` inside a function only exists inside that function — it's invisible outside, like it never happened once the function finishes.",
      "Example: `function attack() { let damage = 10; return damage; }` — that `damage` variable is completely gone the moment `attack()` finishes running. You can't reach it from outside no matter how hard you try.",
      "Here's the twist: a function defined INSIDE another function can still 'remember' the outer function's variables, even after the outer function is done. That remembered bundle is called a **closure**. Example: `function makeCounter() { let count = 0; return function() { count++; return count } }` — calling `makeCounter()` gives you back a mini function that remembers its own private `count`, forever.",
      "Closures are how you build private, protected data in JavaScript — like a health-pack counter that only your game's own code can touch, immune to outside interference. It looks like magic the first time you see it work; it's really just 'the inner function kept its backpack from the outer function.'",
    ],
    questions: [
      {
        prompt:
          "A variable declared inside a function with `let` — where can it be used?",
        options: [
          "Anywhere in the whole program",
          "Only inside that function (and things nested inside it)",
          "Only inside `if` statements",
          "Only after the function returns",
        ],
        answer: 1,
        explain:
          "That's function scope — variables declared inside a function are local to it and disappear once the function finishes, invisible from the outside.",
      },
      {
        prompt: "What makes something a closure?",
        options: [
          "Any function that has a `return` statement",
          "An inner function that keeps access to its outer function's variables even after the outer function has finished running",
          "A function with no parameters",
          "Two functions with the same name",
        ],
        answer: 1,
        explain:
          "A closure is specifically an inner function 'closing over' variables from its enclosing scope, keeping them alive and private even after the outer function has already returned.",
      },
    ],
    creative: {
      prompt:
        "Write (pseudocode is fine) a `makeCounter()` style closure for a game score tracker that starts at 0 and has an inner function that adds 1 each time it's called. Trace calling it 4 times by hand and write down the score after each call.",
      checklist: [
        "Outer function creates a starting value",
        "Inner function updates and returns that value",
        "You traced 4 calls and the number correctly goes up each time",
        "You can explain in your own words why the outer variable doesn't reset between calls",
      ],
    },
  },
  {
    id: "cc3-algorithms",
    track: "code-craft",
    tier: 3,
    minAgeMode: "legend",
    title: "Algorithm Thinking",
    tagline: "Same answer, wildly different speed",
    icon: "⚡",
    prereqs: ["cc3-closures"],
    xp: 150,
    badge: { id: "badge-algorithm-ace", label: "Algorithm Ace", icon: "⚡" },
    brief:
      "Two programs can give the exact same answer — but one finishes instantly and the other takes literal minutes. That difference is **algorithm** design, and it's one of the most valuable skills in all of computing.",
    lesson: [
      "An **algorithm** is just a step-by-step method for solving a problem. The SAME problem can have many different algorithms, and they can perform wildly differently as the amount of data grows.",
      "Take searching for a name in a list of 1,000,000 players. A **linear search** checks every single entry one by one — worst case, a million checks. A **binary search** on a SORTED list repeatedly cuts the search area in half — worst case, only about 20 checks. Same answer, radically different speed.",
      "Programmers describe this with **Big O notation** as a rough shorthand: linear search is `O(n)` (time grows directly with the size of the list), binary search is `O(log n)` (time barely grows at all as the list gets huge). You don't need the math yet — just the intuition: some approaches scale, some don't.",
      "This matters for real games: sorting a leaderboard of 10 players can use any lazy method. Sorting a leaderboard of 10 million requires actually thinking about the algorithm, or your game freezes while it 'thinks.' Algorithm thinking is choosing the RIGHT tool for the size of the problem, not just A tool that technically works.",
    ],
    questions: [
      {
        prompt:
          "Why is binary search so much faster than linear search on a huge sorted list?",
        options: [
          "It checks every item twice for accuracy",
          "It cuts the remaining search area in half each step instead of checking one item at a time",
          "It's not actually faster, just newer",
          "It only works on numbers, never text",
        ],
        answer: 1,
        explain:
          "By eliminating half the remaining possibilities each step, binary search needs only about log2(n) steps instead of up to n steps — a massive difference on large lists.",
      },
      {
        prompt: "What does `O(n)` roughly mean?",
        options: [
          "The algorithm never finishes",
          "The time it takes grows roughly in proportion to the size of the input",
          "The algorithm always takes exactly n seconds",
          "It means the code has n bugs",
        ],
        answer: 1,
        explain:
          "Big O describes how running time scales as input size (n) grows. `O(n)` means: double the data, roughly double the time — a direct, linear relationship.",
      },
      {
        prompt: "Binary search requires the list to be...",
        options: [
          "Sorted",
          "Full of only numbers",
          "Under 100 items",
          "Stored in an object, not an array",
        ],
        answer: 0,
        explain:
          "Binary search only works because it can safely assume 'everything to the left is smaller, everything to the right is bigger' — that assumption requires a sorted list.",
      },
    ],
    creative: {
      prompt:
        "Pick a real problem (finding your fastest friend's time on a leaderboard, alphabetizing a bookshelf) and describe TWO different algorithms to solve it — one obvious/brute-force way and one smarter way. Explain in your own words which would win on a huge dataset and why.",
      checklist: [
        "Two genuinely different algorithms described",
        "You identify which is closer to O(n) vs a faster approach",
        "You explain the tradeoff in plain English, not just formulas",
        "You'd actually trust your explanation if a friend asked 'wait, why is one faster?'",
      ],
    },
  },

  // ── AI EXPLORER · TIER 1 ───────────────────────────────────────────────────
  {
    id: "ai1-patterns",
    track: "ai-explorer",
    tier: 1,
    minAgeMode: "junior",
    title: "Pattern Party",
    tagline: "AI doesn't 'think' — it spots patterns",
    icon: "🧩",
    prereqs: [],
    xp: 55,
    brief:
      "When Minecraft's Villager AI decides to trade, or your phone finishes your text before you do, none of it is 'thinking' the way you think. It's **pattern spotting**, taken to an extreme.",
    lesson: [
      "**Artificial Intelligence** in the form you use every day (chatbots, image generators, recommendation feeds) works by finding patterns in huge piles of examples, then using those patterns to make predictions about new situations.",
      "Here's a simple version: if you showed a program a thousand pictures labeled 'cat' and a thousand labeled 'dog,' it would start noticing patterns — certain shapes, ear positions, textures — that separate the two groups. It's not 'knowing' what a cat IS the way you do; it's recognizing statistical patterns that usually mean 'cat.'",
      "This is why AI can be fooled in weird ways humans wouldn't be — like misreading a picture of a cat wearing a very doglike costume, because the visual pattern shifted even though a human would instantly still say 'that's obviously a cat in a costume.'",
      "Every AI system you'll learn about this summer — chatbots, image generators, game NPCs — starts from this same core idea: **learn patterns from tons of examples, then predict what comes next based on those patterns.**",
    ],
    questions: [
      {
        prompt: "How does an AI model 'learn' what a cat looks like?",
        options: [
          "Someone manually writes rules for every possible cat photo",
          "It reads a dictionary definition of 'cat'",
          "It finds statistical patterns across thousands of example photos labeled 'cat'",
          "It asks a human every single time",
        ],
        answer: 2,
        explain:
          "Modern AI learns from huge sets of labeled examples, finding the visual patterns statistically associated with the label 'cat' rather than being hand-coded with rules.",
      },
      {
        prompt:
          "Why can pattern-based AI get fooled by unusual images (like an animal in a weird costume)?",
        options: [
          "AI is being lazy",
          "The visual pattern shifted away from what the AI's training examples looked like, even though a human can use context and reasoning to adjust",
          "AI can never recognize animals at all",
          "It's a hardware problem, not a software one",
        ],
        answer: 1,
        explain:
          "Since AI relies on learned visual patterns rather than true understanding, an unusual pattern (a costume) can confuse it in ways a human, who reasons about context, wouldn't be fooled by.",
      },
    ],
    creative: {
      prompt:
        "Play a 'pattern game' with a partner: show them 5 examples from one category (like 'things that bounce') and 5 from another ('things that don't bounce'), without saying the category name, and see if they can guess the pattern — just like an AI would have to.",
      checklist: [
        "You picked two genuinely different categories",
        "You gave 5 clear examples of each without naming the category out loud",
        "Your partner had to guess the pattern from examples alone",
        "You can explain how this mirrors how real AI learns patterns",
      ],
    },
  },
  {
    id: "ai1-training-data",
    track: "ai-explorer",
    tier: 1,
    minAgeMode: "junior",
    title: "Feed the Brain",
    tagline: "An AI is only as good as what it studied",
    icon: "📚",
    prereqs: ["ai1-patterns"],
    xp: 55,
    brief:
      "An AI that's only ever seen pictures of golden retrievers will be baffled by a chihuahua. What an AI learns depends entirely on what it was fed — and that's the whole idea behind **training data**.",
    lesson: [
      "**Training data** is the huge collection of examples an AI model learns from before it's ever used by you. A model that recognizes handwriting was trained on huge numbers of handwritten letters; a chatbot was trained on huge amounts of text.",
      "The quality and variety of training data directly shapes what the AI can do well. If the training data mostly shows one kind of example, the model gets great at that kind and struggles with anything unusual or underrepresented — this is a real, well-documented issue called **bias in AI**.",
      "More data isn't automatically better — MESSY or unbalanced data can teach an AI the wrong lessons entirely. A famous real example: an early AI trained to spot 'huskies vs wolves' actually learned to detect **snow in the background**, because most wolf photos happened to have snow. It wasn't looking at the animal at all!",
      "This is why responsible AI teams care enormously about WHERE their training data comes from, whether it's diverse and fairly sourced, and whether it accidentally teaches the model something misleading.",
    ],
    questions: [
      {
        prompt: "Why did the 'husky vs wolf' AI actually fail?",
        options: [
          "It couldn't process images at all",
          "It learned to detect snow in the background instead of the actual animal, because of a pattern in the training photos",
          "It was too slow to run",
          "It had never seen a husky before",
        ],
        answer: 1,
        explain:
          "The training photos happened to correlate wolves with snowy backgrounds, so the model learned a shortcut — snow means wolf — instead of learning actual animal features.",
      },
      {
        prompt:
          "Why does more training data not automatically mean a better AI?",
        options: [
          "AI models can only process a limited amount of data total",
          "If the data is unbalanced or messy, the AI can learn wrong or biased patterns instead of correct ones",
          "Training data doesn't actually matter",
          "More data always slows the AI down with no benefit",
        ],
        answer: 1,
        explain:
          "Quality and balance matter as much as quantity — bad or skewed data can teach an AI misleading shortcuts, just like in the husky/wolf snow example.",
      },
    ],
    creative: {
      prompt:
        "Design a (fictional) training dataset for an AI that should recognize 'good vs bad Minecraft builds.' List what kinds of examples you'd include, and explain one way your dataset could accidentally be biased or unbalanced.",
      checklist: [
        "You describe realistic example categories for the dataset",
        "You explain what 'good' vs 'bad' examples would look like",
        "You identify at least one realistic way the dataset could be biased",
        "You suggest one fix for that bias",
      ],
    },
  },
  {
    id: "ai1-tokens",
    track: "ai-explorer",
    tier: 1,
    minAgeMode: "junior",
    title: "Word Crumbs",
    tagline: "How AI actually reads your sentence",
    icon: "🍞",
    prereqs: ["ai1-training-data"],
    xp: 60,
    badge: { id: "badge-token-tracker", label: "Token Tracker", icon: "🍞" },
    brief:
      "When you type a message to a chatbot, it doesn't see words the way you do — it sees chopped-up chunks called **tokens**. This is the secret unit AI text runs on.",
    lesson: [
      "A **token** is a chunk of text — sometimes a whole word, sometimes part of one, sometimes just punctuation. The sentence 'BuidlCamp is awesome!' might break into tokens like `Buidl`, `Camp`, ` is`, ` awesome`, `!` — the exact split depends on the specific tokenizer a model uses.",
      "Why chunks instead of whole words? Because there are way too many possible whole words (including made-up ones, typos, and other languages) for a model to have a slot for every single one. Breaking words into smaller reusable pieces lets the model handle almost anything, even words it's never seen whole before.",
      "This is also why AI models have **context limits** — they can only 'see' a certain number of tokens at once (like a maximum backpack size for the conversation). Once a conversation gets long enough, older tokens can get pushed out of view.",
      "And it's why AI usage is often measured and even priced in tokens rather than words or characters — every chunk the model reads or writes costs a little bit of computation, so token count is basically the AI world's version of 'how much did I actually type or generate.'",
    ],
    questions: [
      {
        prompt: "What is a 'token' in AI language models?",
        options: [
          "Always exactly one full word",
          "A chunk of text — sometimes a whole word, sometimes a piece of one — that the model reads text in units of",
          "A type of virtual currency for buying AI subscriptions only",
          "A single letter of the alphabet",
        ],
        answer: 1,
        explain:
          "Tokens are the model's actual reading/writing unit, and they can be whole words, word pieces, or punctuation — not a fixed one-word-per-token rule.",
      },
      {
        prompt: "Why do language models have a 'context limit'?",
        options: [
          "They can only understand English",
          "They can only process a maximum number of tokens at once, like a limited-size window into the conversation",
          "They get bored after too many messages",
          "It's a rule made up by parents, not a real technical limit",
        ],
        answer: 1,
        explain:
          "Models process a fixed-size window of tokens at a time. Once you exceed that window, the oldest tokens can no longer be considered — that's the real, technical reason for context limits.",
      },
    ],
    creative: {
      prompt:
        "Take a sentence you'd send a chatbot and try to manually 'tokenize' it — break it into small chunks the way you imagine a model might, then count how many chunks you got. Compare with a sibling/friend's guess for the same sentence.",
      checklist: [
        "You picked a real sentence, at least 8 words long",
        "You broke it into plausible token-sized chunks, not just whole words",
        "You counted the total number of chunks",
        "You can explain in your own words why chunking helps a model handle unfamiliar words",
      ],
    },
  },
  {
    id: "ai1-prompting-basics",
    track: "ai-explorer",
    tier: 1,
    minAgeMode: "junior",
    title: "Ask It Right",
    tagline: "The question shapes the answer",
    icon: "💬",
    prereqs: ["ai1-tokens"],
    xp: 60,
    brief:
      "Two people can ask an AI the 'same' question and get totally different quality answers — because HOW you ask matters just as much as WHAT you ask. Welcome to **prompting**.",
    lesson: [
      "A **prompt** is the input you give an AI — your question, instruction, or request. AI models are extremely literal and extremely sensitive to wording, so a vague prompt tends to get a vague, generic answer.",
      "Compare `'write about dogs'` to `'write 3 fun facts about golden retrievers for a 10-year-old, in a playful tone.'` The second prompt gives the AI a clear **topic, length, audience, and tone** — and it will almost always produce a better, more useful answer.",
      "A simple formula for better prompts: be specific about **what** you want, **who** it's for, and **how** it should be formatted (a list? a paragraph? short or long?). The AI can't read your mind — it can only work with the words you actually gave it.",
      "Prompting isn't cheating or 'not real coding' — it's becoming a genuinely important skill, closer to giving really clear instructions to a very capable but very literal assistant. You'll practice this hard in the AI practice.",
    ],
    questions: [
      {
        prompt:
          "Why does `'write 3 fun facts about golden retrievers for a 10-year-old, playful tone'` usually beat `'write about dogs'`?",
        options: [
          "It's a longer prompt so it must be better",
          "It gives clear specifics: topic, count, audience, and tone, instead of leaving everything vague",
          "AI prefers prompts with numbers in them",
          "There's no real difference",
        ],
        answer: 1,
        explain:
          "Specificity is the whole game — naming the exact topic, quantity, audience, and tone removes guesswork, so the AI's response matches what you actually wanted.",
      },
      {
        prompt: "What's a fair way to describe prompting as a skill?",
        options: [
          "It's not a real skill, just luck",
          "Giving very clear, specific instructions to a capable but very literal assistant",
          "Memorizing secret magic words that unlock hidden AI features",
          "Something only professional programmers can learn",
        ],
        answer: 1,
        explain:
          "Prompting is really about clear communication — the AI does exactly what your words say, so specificity and clarity are what separate a mediocre prompt from a great one.",
      },
    ],
    creative: {
      prompt:
        "Take a vague prompt like 'help me with math' and rewrite it 3 different ways, each adding more specifics (topic, grade level, format), ending with a genuinely great, specific prompt.",
      checklist: [
        "Started with a clearly vague prompt",
        "Each rewrite adds a specific detail (topic, audience, format, etc.)",
        "Final version names a clear topic, audience, AND format",
        "You could hand your final prompt to someone and they'd know exactly what kind of answer to expect",
      ],
    },
  },

  // ── AI EXPLORER · TIER 2 ───────────────────────────────────────────────────
  {
    id: "ai2-llms",
    track: "ai-explorer",
    tier: 2,
    minAgeMode: "junior",
    title: "Meet the LLM",
    tagline: "How ChatGPT actually guesses its next word",
    icon: "🧠",
    prereqs: ["ai1-prompting-basics"],
    xp: 100,
    brief:
      "Ready for the actual secret behind ChatGPT, Claude, and every chatbot like them? It's simpler — and weirder — than most people think: it's one giant next-word guessing machine.",
    lesson: [
      "An **LLM (Large Language Model)** is a program trained on enormous amounts of text — books, websites, conversations — to get extremely good at one specific task: **predicting the next token**, given everything written so far.",
      "That's it. That's the core trick. Given 'The sky is', a well-trained model predicts 'blue' is a very likely next token. Given a whole conversation, it predicts the most likely next chunk of a helpful response, one token at a time, over and over, until it decides to stop.",
      "The 'large' part matters: these models have been trained on so much text, and have so many internal adjustable numbers (called **parameters**, often in the billions), that 'just predicting the next token really well' ends up capable of writing code, explaining science, and holding a conversation — because doing THAT well requires a genuinely deep statistical understanding of language and the world it describes.",
      "It's crucial to know: an LLM doesn't 'look things up' in a database when you chat with it (unless it's specifically hooked up to search tools). It's generating its response fresh, token by token, based on patterns learned during training — which is exactly why it can sometimes confidently make things up (more on that soon).",
    ],
    questions: [
      {
        prompt:
          "At its core, what is an LLM doing when it generates a response?",
        options: [
          "Searching a giant database of pre-written answers",
          "Predicting the most likely next token, one at a time, based on patterns learned from training text",
          "Running a fixed script written by humans for every possible question",
          "Connecting to the internet in real time for every single word",
        ],
        answer: 1,
        explain:
          "The fundamental mechanism is next-token prediction, repeated over and over — not database lookup or live web browsing (unless explicitly given that tool).",
      },
      {
        prompt: "What does 'Large' in Large Language Model mainly refer to?",
        options: [
          "The size of the computer screen needed to run it",
          "The huge amount of training text and the huge number of internal parameters",
          "How long each response takes to generate",
          "The number of languages it can translate",
        ],
        answer: 1,
        explain:
          "'Large' refers to scale — massive training datasets and often billions of internal parameters, which is what enables surprisingly capable, human-like output from 'just' next-token prediction.",
      },
      {
        prompt: "Why can an LLM sometimes state a wrong fact very confidently?",
        options: [
          "It's deliberately lying to be funny",
          "It generates plausible-sounding text based on patterns, without a built-in fact-checking step, so a confident-sounding wrong answer is possible",
          "It's broken and needs a repair",
          "It only happens with very old AI models, never modern ones",
        ],
        answer: 1,
        explain:
          "Since generation is pattern-based prediction rather than verified lookup, an LLM can produce fluent, confident-sounding text that happens to be factually wrong — this is exactly what 'hallucination' means, which you'll dig into next.",
      },
    ],
    creative: {
      prompt:
        "Play 'be the LLM' with a partner: they say a sentence starter like 'My favorite game is...' and you predict, out loud, the single most statistically likely next word based on nothing but common sense and pattern guessing — no using real AI. Do this for 5 different starters.",
      checklist: [
        "Did this for 5 different sentence starters",
        "Predicted one word at a time (not a full sentence at once)",
        "Explained why each word felt like a likely guess",
        "Can explain how this mirrors what a real LLM does, just far more sophisticated",
      ],
    },
  },
  {
    id: "ai2-prompting-pro",
    track: "ai-explorer",
    tier: 2,
    minAgeMode: "junior",
    title: "Prompt Like a Pro",
    tagline: "Level up from asking to engineering",
    icon: "🛠️",
    prereqs: ["ai2-llms"],
    xp: 100,
    badge: { id: "badge-prompt-pro", label: "Prompt Pro", icon: "🛠️" },
    brief:
      "You already know clear beats vague. Now let's steal the actual tricks pros use — giving examples, assigning roles, and asking the AI to think step by step — to get genuinely great results.",
    lesson: [
      "**Give examples (few-shot prompting):** showing the AI 1-2 examples of the exact format you want massively improves results. Instead of just saying 'write a haiku,' show one example haiku first, THEN ask for a new one in that style.",
      "**Assign a role:** starting a prompt with something like `'You are a patient math tutor explaining to a 6th grader'` shapes the tone, vocabulary, and depth of the whole response, because it gives the model a clear persona and audience to aim for.",
      "**Ask for step-by-step thinking:** for anything tricky (math, logic, planning), adding `'think through this step by step before giving your final answer'` genuinely improves accuracy — it gives the model room to reason instead of jumping straight to a guess.",
      "**Iterate, don't restart:** if the first answer isn't quite right, don't throw it away — respond with exactly what to change: `'good, but make it shorter and cut the second paragraph.'` Treat it like a real conversation with a collaborator, not a vending machine you only get one try with.",
    ],
    questions: [
      {
        prompt:
          "Why does giving the AI 1-2 examples before your request usually help (few-shot prompting)?",
        options: [
          "It makes the AI respond faster",
          "It shows the exact format/style you want, instead of leaving it to guess",
          "Examples are required by law for AI use",
          "It only helps with math problems",
        ],
        answer: 1,
        explain:
          "Concrete examples remove ambiguity about format and style — the model can pattern-match to what you showed it instead of guessing what 'good' means to you.",
      },
      {
        prompt:
          "What's the benefit of asking the AI to 'think step by step' on a tricky problem?",
        options: [
          "It has no real effect on accuracy",
          "It gives the model room to reason through the problem instead of jumping straight to a possibly-wrong final answer",
          "It makes responses shorter",
          "It only works if you also assign a role",
        ],
        answer: 1,
        explain:
          "Step-by-step prompting encourages a more deliberate reasoning process, which measurably reduces careless mistakes on logic and math-heavy tasks compared to demanding an instant final answer.",
      },
    ],
    creative: {
      prompt:
        "Take one request (like 'help me plan a birthday party') and write 3 versions of the prompt: a plain version, a version that assigns the AI a role, and a version that also asks for step-by-step thinking. Predict how the 3 answers might differ.",
      checklist: [
        "3 clearly different prompt versions written",
        "One version assigns a specific role/persona",
        "One version explicitly asks for step-by-step reasoning",
        "You predicted a plausible difference in the resulting answers",
      ],
    },
  },
  {
    id: "ai2-hallucinations",
    track: "ai-explorer",
    tier: 2,
    minAgeMode: "builder",
    title: "Fact-Check Force",
    tagline: "When AI sounds sure but isn't",
    icon: "🕵️",
    prereqs: ["ai2-prompting-pro"],
    xp: 100,
    brief:
      "AI can state a completely made-up fact with the exact same confident tone as a true one. Spotting the difference is a survival skill for the AI era, and it's called catching a **hallucination**.",
    lesson: [
      "A **hallucination** is when an AI generates text that sounds plausible and confident but is actually false — a made-up fact, a fake quote, a book that doesn't exist, a citation that leads nowhere. It's not the AI 'lying' on purpose; it's a side effect of how generation works: predicting likely-sounding text, not verified truth.",
      "Hallucinations happen more on **specific, obscure details** — exact dates, exact statistics, exact citations, niche facts — because the model is filling gaps with the most statistically plausible-SOUNDING text, which isn't the same as the most factually correct text.",
      "The fix isn't 'never use AI for facts' — it's **verify anything that matters** with a real, independent source before you trust or repeat it, especially for schoolwork, anything you'll say publicly, or any real decision. Treat surprising or high-stakes AI claims like a rumor: cool if true, but check before you spread it.",
      "A great habit: ask the AI itself to cite where a claim comes from, or ask 'are you sure about this, and how confident are you?' It won't be perfect (it can even hallucinate a fake source!), but combined with your own independent check, it builds a real fact-checking reflex.",
    ],
    questions: [
      {
        prompt: "What is an AI 'hallucination'?",
        options: [
          "The AI intentionally lying to trick you",
          "The AI generating confident, plausible-sounding text that is actually false",
          "A visual glitch in an AI-generated image only",
          "A rare bug that was fully fixed in modern models",
        ],
        answer: 1,
        explain:
          "Hallucination describes fluent, confident, false output — a natural side effect of predicting likely-sounding text rather than verified truth, and it still happens in modern models, especially on obscure specifics.",
      },
      {
        prompt:
          "Why are hallucinations more likely on obscure, specific details (exact dates, niche facts)?",
        options: [
          "The model gets tired after a long conversation",
          "There's less reliable training data to pattern-match against, so the model fills gaps with plausible-sounding guesses",
          "Obscure facts are against the AI's programming rules",
          "It only happens with old models, not current ones",
        ],
        answer: 1,
        explain:
          "Common, well-documented facts appear constantly in training data and get reinforced; rare specifics are underrepresented, so the model is more likely to generate a smooth-sounding guess instead of the true detail.",
      },
    ],
    creative: {
      prompt:
        "Ask an AI (or imagine a plausible answer) for a very specific, somewhat obscure fact — like an exact statistic or a quote from a specific person — then independently fact-check it using a real, separate source. Write up whether it held up and how you checked.",
      checklist: [
        "Picked a genuinely specific/obscure claim, not a common well-known fact",
        "Actually checked an independent, real source (not just 'it sounded right')",
        "Wrote down whether the claim held up or was wrong/unverifiable",
        "Explained your fact-checking process, not just the result",
      ],
    },
  },
  {
    id: "ai2-agents",
    track: "ai-explorer",
    tier: 2,
    minAgeMode: "builder",
    title: "Meet Your AI Sidekick",
    tagline: "When AI stops chatting and starts doing",
    icon: "🤖",
    prereqs: ["ai2-hallucinations"],
    xp: 100,
    brief:
      "A chatbot talks. An **AI agent** actually DOES things — searches the web, runs code, edits files, clicks buttons — by using tools, checking the results, and deciding what to do next. This is basically how Claude Code (the thing helping build BuidlCamp!) works.",
    lesson: [
      "An **AI agent** is an LLM given access to **tools** (like web search, running code, reading/writing files) plus a loop: think about the goal, pick a tool, use it, look at the result, and decide the next step — repeating until the task is done.",
      "The key difference from a plain chatbot: a chatbot just replies with text. An agent can take real ACTIONS in the world (or a sandboxed version of it) and adjust its plan based on what actually happens, not just what it predicted would happen.",
      "This is genuinely how a lot of modern coding assistants work: given 'add a login button,' an agent might read the relevant files, write new code, run tests to check it actually works, see an error, and fix it — all without a human manually doing each step.",
      "Agents raise real new questions too: what tools should an agent be allowed to use? What should it double-check with a human before doing (like sending an email, spending money, or deleting a file)? This is a live, actively-debated area of AI safety, not a solved problem.",
    ],
    questions: [
      {
        prompt:
          "What's the core difference between a plain chatbot and an AI agent?",
        options: [
          "Agents are just chatbots with a fancier name",
          "An agent can use tools to take real actions and adapt based on results, not just generate a text reply",
          "Chatbots are always more accurate than agents",
          "Agents can't use language models at all",
        ],
        answer: 1,
        explain:
          "The defining feature of an agent is the think → act → observe → repeat loop using real tools, versus a chatbot which only produces a text response.",
      },
      {
        prompt:
          "Why is deciding what an agent is 'allowed to do without asking a human first' a real safety question?",
        options: [
          "It isn't actually a concern anyone thinks about",
          "Because agents can take real, sometimes irreversible actions (like deleting files or sending messages), so mistakes can have real consequences beyond a wrong sentence",
          "Agents are always perfectly safe by design",
          "This only matters for physical robots, not software agents",
        ],
        answer: 1,
        explain:
          "Unlike a chatbot's wrong sentence (easy to ignore), an agent's wrong ACTION (deleting a file, sending a message) can have real, sometimes irreversible consequences — which is exactly why permission boundaries matter.",
      },
    ],
    creative: {
      prompt:
        "Design a simple AI agent (on paper) for a task like 'clean up my Minecraft inventory.' List the tools it would need, and write out its think → act → observe loop for at least 3 steps, including one moment where it should check with a human before acting.",
      checklist: [
        "Listed at least 2 realistic tools the agent would need",
        "Wrote out at least 3 steps of the think/act/observe loop",
        "Included one clear moment requiring human confirmation before acting",
        "The task and steps are specific, not vague",
      ],
    },
  },

  // ── AI EXPLORER · TIER 3 ───────────────────────────────────────────────────
  {
    id: "ai3-vibecoding",
    track: "ai-explorer",
    tier: 3,
    minAgeMode: "legend",
    title: "Vibecoding Workflow",
    tagline: "Idea → prompt → code → play → repeat",
    icon: "🌀",
    prereqs: ["ai2-agents"],
    xp: 150,
    badge: { id: "badge-vibecoder", label: "Vibecoder", icon: "🌀" },
    brief:
      "You can ask for a small code draft, then inspect it, test it in the isolated Project studio, and explain each change. Generated code can be incorrect or unsafe. The goal is to understand and improve a project, with or without AI.",
    lesson: [
      "**Vibecoding** is building software by describing your intent in natural language to an AI, getting real code back, running it, and iterating — rather than hand-typing every line yourself from scratch. It's still real coding: you're reading, testing, and adjusting actual code, just with an AI as a fast first-draft partner.",
      "The real workflow has a rhythm: **idea → prompt → code → test → tweak → repeat.** You describe what you want ('a platformer where the player double-jumps'), the AI generates a first version, you run it, and almost always something's off — too floaty, wrong key, missing a wall check — so you describe the fix and go again.",
      "The skill that actually matters here isn't 'typing a good prompt once.' It's **being able to read the generated code well enough to test it, spot what's wrong, and describe the fix precisely** — which is exactly why you've spent this whole track learning sequences, loops, functions, and debugging first. Vibecoding without knowing how to read code is just hoping really hard.",
      "A pro habit: after AI generates code for you, find the ONE variable or function that controls the thing you care about (like `JUMP_POWER`) and change it yourself by hand. That single habit — tweaking a real value and seeing the real result — turns 'AI wrote this' into 'I understand and own this.'",
    ],
    questions: [
      {
        prompt:
          "What's the real, ongoing skill in vibecoding — beyond writing one good first prompt?",
        options: [
          "Never touching the generated code yourself",
          "Reading the generated code well enough to test it, spot problems, and describe precise fixes",
          "Getting it perfect on the very first try, every time",
          "Only using AI-generated code, never hand-editing anything",
        ],
        answer: 1,
        explain:
          "Since AI-generated code is rarely perfect on the first try, the real skill is reading it critically, testing it, and giving precise follow-up instructions — which requires genuinely understanding the code, not just prompting.",
      },
      {
        prompt:
          "Why does learning sequences, loops, and debugging BEFORE vibecoding actually matter?",
        options: [
          "It doesn't — vibecoding replaces the need to know how code works",
          "Without those fundamentals, you can't tell if AI-generated code is right, safe, or doing what you actually wanted",
          "Those topics are only useful for job interviews",
          "AI-generated code never contains bugs, so debugging is unnecessary",
        ],
        answer: 1,
        explain:
          "AI-generated code can absolutely contain bugs or subtle mistakes. Without fundamentals like debugging and reading code, you can't verify or fix what the AI produced — you'd just be trusting it blindly.",
      },
      {
        prompt: "What's a great habit after getting AI-generated game code?",
        options: [
          "Never look at the code, just run it forever",
          "Find one key variable (like JUMP_POWER) and hand-tweak it yourself to see a real effect",
          "Delete all the comments immediately",
          "Ask for a completely different game instead of iterating",
        ],
        answer: 1,
        explain:
          "Hand-tweaking a real variable and observing the real result is how 'AI wrote this' becomes genuine understanding — it's the fastest path from passive user to active coder.",
      },
    ],
    creative: {
      prompt:
        "Describe (in writing, as if prompting an AI) a simple game idea in one sentence, then write out 3 realistic follow-up prompts you'd need to send after seeing the first version, to fix or improve specific things (like 'the jump feels too floaty, make it snappier'). If you have Forge access, actually try this for real.",
      checklist: [
        "Initial one-sentence game idea prompt is clear and specific",
        "3 realistic follow-up/fix prompts written, each targeting one specific issue",
        "At least one follow-up references a specific, nameable thing to change (a variable, a rule, a feel)",
        "You can explain why iterating beats trying to nail it in one giant prompt",
      ],
    },
  },
  {
    id: "ai3-ethics",
    track: "ai-explorer",
    tier: 3,
    minAgeMode: "legend",
    title: "AI Ethics HQ",
    tagline: "Just because AI can, doesn't mean it should",
    icon: "⚖️",
    prereqs: ["ai3-vibecoding"],
    xp: 150,
    brief:
      "AI can write essays, generate art, and mimic voices — which means it can also be used to cheat, deceive, or hurt people. Thinking clearly about **AI ethics** isn't optional homework; it's part of using this stuff responsibly, starting now.",
    lesson: [
      "**AI bias** happens when a model's training data over- or under-represents certain groups, causing worse or unfair results for them — like a hiring-screening AI trained mostly on past resumes from one demographic performing worse for others. This isn't the AI being 'evil'; it's the training data reflecting (and amplifying) real-world imbalance.",
      "**Deepfakes** — AI-generated fake images, video, or audio of real people saying or doing things they never did — are a growing, serious issue. The same technology that can make a fun filter can also create convincing, harmful misinformation. Consent and honesty matter enormously here.",
      "**Academic honesty**: using AI to help you learn (explaining a concept, checking your work, brainstorming) is very different from having it do your assignment and turning that in as entirely your own unaided work. Most schools now have explicit AI policies — knowing and following them is part of being a trustworthy student in this era.",
      "**Privacy**: what you type into an AI chat isn't always fully private or forgotten — some tools may use conversations to improve future models, depending on their settings and policies. Never paste real passwords, other people's private info, or anything you wouldn't want potentially stored.",
    ],
    questions: [
      {
        prompt: "Where does AI bias typically come from?",
        options: [
          "AI models are programmed to be biased on purpose",
          "Training data that over- or under-represents certain groups, causing the model to perform unevenly across them",
          "It's a random hardware glitch",
          "Only very old AI models have any bias at all",
        ],
        answer: 1,
        explain:
          "Bias in AI models is usually a reflection of imbalances or gaps in the training data, not an intentional design choice — which is exactly why diverse, carefully-vetted training data matters so much.",
      },
      {
        prompt: "What makes deepfakes a serious ethical concern?",
        options: [
          "They're always low quality and easy to spot",
          "They can convincingly show real people saying or doing things that never actually happened, enabling misinformation and harm without consent",
          "They only affect celebrities, never regular people",
          "They're illegal everywhere so it's not really an issue",
        ],
        answer: 1,
        explain:
          "The danger is realism plus lack of consent: a convincing fake of a real person can spread false information or cause real harm, and laws/detection haven't fully caught up everywhere.",
      },
      {
        prompt:
          "What's the key difference between using AI to LEARN vs. using it to CHEAT on an assignment?",
        options: [
          "There's no real difference, both are equally fine",
          "Using AI to explain, check, or brainstorm supports your own understanding; submitting AI-generated work as entirely your own unaided effort misrepresents what you actually did",
          "Cheating is only a problem if you get caught",
          "AI use in school is always against the rules everywhere",
        ],
        answer: 1,
        explain:
          "The line is about honesty and actual learning: AI as a study helper builds your understanding; AI as a ghostwriter you pass off as your own work misrepresents your effort and skips the learning entirely.",
      },
    ],
    creative: {
      prompt:
        "Pick one AI ethics issue (bias, deepfakes, academic honesty, or privacy) and write a short 'camp counselor PSA' — 4-6 sentences explaining the issue AND one concrete, practical rule you'll personally follow because of it.",
      checklist: [
        "Picked one specific ethics issue, not all four vaguely",
        "Explained the issue accurately in your own words",
        "Included one concrete personal rule/behavior, not just a vague warning",
        "Written like something you'd actually say to a friend, not a legal disclaimer",
      ],
    },
  },
  {
    id: "ai3-limits",
    track: "ai-explorer",
    tier: 3,
    minAgeMode: "legend",
    title: "Where AI Breaks",
    tagline: "Knowing the edges makes you the expert",
    icon: "🧱",
    prereqs: ["ai3-ethics"],
    xp: 150,
    brief:
      "Every powerful tool has edges where it stops working well — and knowing exactly where those edges are is what separates someone who USES AI from someone who's actually good at working WITH it.",
    lesson: [
      "**Context window limits**: as covered with tokens, models can only 'see' a limited amount of the conversation at once. In a very long chat, early details can effectively fall out of view — the model isn't ignoring you on purpose, it genuinely may no longer have that part in its working context.",
      "**Reasoning failures on tricky logic/math**: LLMs are dramatically better at some kinds of reasoning than others. Multi-step math, tricky logic puzzles, and precise counting can trip up even strong models, because generating a fluent-sounding step doesn't guarantee the underlying calculation was actually correct — this is a real, active area of research.",
      "**No real-world grounding by default**: a base LLM doesn't automatically know today's date, live scores, or anything that happened after its training data was collected, unless it's specifically connected to a live tool (like search) to check. Assuming an AI 'just knows' current events without checking is a common, avoidable mistake.",
      "**Confidently wrong is worse than obviously wrong**: the scariest failure mode isn't an AI saying 'I don't know' — it's an AI stating something incorrect in the same smooth, confident tone as something correct. Knowing this keeps you appropriately skeptical, especially on anything specific or high-stakes.",
    ],
    questions: [
      {
        prompt:
          "Why might a base LLM (without search tools connected) not know about very recent events?",
        options: [
          "It refuses to discuss current events on purpose",
          "Its knowledge mostly comes from training data collected up to some point in the past, and it can't browse the live internet by default",
          "It only knows about topics from before the year 2000",
          "This isn't actually true of any AI model",
        ],
        answer: 1,
        explain:
          "Unless explicitly given a live tool like web search, a model's knowledge is essentially frozen at whatever training data it learned from — it has no automatic live connection to today's news.",
      },
      {
        prompt:
          "Why can LLMs sometimes get multi-step math wrong even though they 'know' math facts?",
        options: [
          "They're incapable of any math at all",
          "Generating fluent-sounding reasoning steps doesn't guarantee each underlying calculation is verified correct, so errors can creep into longer reasoning chains",
          "Math questions are against their programming",
          "This only happened with the very first AI models ever made",
        ],
        answer: 1,
        explain:
          "Text generation and verified calculation aren't the same thing — a model can produce a plausible-sounding chain of reasoning where one step quietly contains an error, which is why checking multi-step answers matters.",
      },
      {
        prompt: "What's the most dangerous kind of AI mistake to watch for?",
        options: [
          "An AI saying 'I'm not fully sure about this'",
          "A wrong answer stated with the exact same fluent confidence as a correct one",
          "An AI taking a long time to respond",
          "An AI asking a clarifying question",
        ],
        answer: 1,
        explain:
          "A hedge ('I'm not sure') at least signals you to double-check. A confidently wrong answer gives no such signal — it's indistinguishable in tone from a correct one, which is exactly why independent verification matters.",
      },
    ],
    creative: {
      prompt:
        "Design a short 'stress test' of 3 questions meant to probe an AI's known limits — one about very recent events, one multi-step math/logic puzzle, and one very obscure specific fact. Predict where you think it might struggle, then test it if you have access, or reason through what you'd expect.",
      checklist: [
        "3 questions genuinely target 3 different known-limit categories",
        "You predicted specifically WHERE and WHY it might struggle before testing",
        "If tested, you recorded what actually happened",
        "You can explain each limit in your own words, not just repeat this lesson",
      ],
    },
  },
  {
    id: "ai3-safety",
    track: "ai-explorer",
    tier: 3,
    minAgeMode: "legend",
    title: "Safety First, Always",
    tagline: "Powerful tools need thoughtful humans",
    icon: "🛡️",
    prereqs: ["ai3-limits"],
    xp: 150,
    badge: { id: "badge-safety-steward", label: "Safety Steward", icon: "🛡️" },
    brief:
      "The people building the most advanced AI in the world spend enormous effort making it safer, not just smarter. Understanding WHY reveals what responsible AI use actually looks like — for a company, and for you.",
    lesson: [
      "**Alignment** is the challenge of making sure an AI system's actual behavior matches what humans actually intend and value — not just doing exactly what was literally said in a way that technically satisfies the words but violates the actual intent. A famous thought experiment: told to 'make as many paperclips as possible' with zero other guardrails, a hyper-literal optimizer could theoretically cause massive harm chasing that single goal — the point isn't that this specific scenario is realistic, it's that literal goal-following without broader values can go very wrong.",
      "**Guardrails and refusals**: well-designed AI systems are built to decline harmful requests (building weapons, generating dangerous misinformation, helping cheat in harmful ways) even if a user asks directly or tries to trick them. This is a deliberate safety design choice, not a bug or the AI being 'no fun.'",
      "**Human oversight** matters especially as AI gets more capable and agent-like (remember agents taking real actions!). Keeping humans able to review, pause, or override AI decisions — especially high-stakes ones — is a core current safety principle, not an afterthought.",
      "**Your role in this**: you don't need to solve alignment to use AI responsibly today. You can: verify important claims, use AI transparently (not to deceive), respect that it can be wrong, and treat 'just because it CAN do something doesn't mean it SHOULD' as a real, personal rule — for AI, and honestly, for a lot of powerful tools in life.",
    ],
    questions: [
      {
        prompt: "What is 'AI alignment' fundamentally about?",
        options: [
          "Making AI models run faster",
          "Making sure an AI's actual behavior matches genuine human intent and values, not just a literal, narrow reading of instructions",
          "Aligning text formatting in AI-generated documents",
          "A marketing term with no real technical meaning",
        ],
        answer: 1,
        explain:
          "Alignment is specifically about closing the gap between 'what was literally said' and 'what was actually meant and valued,' which becomes a much harder and more important problem as AI systems get more capable.",
      },
      {
        prompt:
          "Why do well-designed AI systems refuse certain requests even when a user insists?",
        options: [
          "It's a bug that developers haven't fixed yet",
          "It's a deliberate safety design choice to avoid enabling real-world harm, regardless of how the request is phrased",
          "AI systems are incapable of understanding those requests at all",
          "Refusals only happen with older, less capable models",
        ],
        answer: 1,
        explain:
          "Refusing harmful requests is an intentional safety guardrail, not a limitation or accident — it's part of designing AI to be broadly helpful without being harmful.",
      },
      {
        prompt:
          "What's a practical, personal AI-safety habit for you right now?",
        options: [
          "Trust every AI answer completely without question",
          "Verify important claims, be honest about when you used AI, and remember 'just because it can, doesn't mean it should'",
          "Avoid using AI for anything ever",
          "Only worry about AI safety once you're an adult working at an AI company",
        ],
        answer: 1,
        explain:
          "Real responsible AI use starts with personal habits available to anyone today: verification, transparency, and thoughtful restraint — you don't need to be an AI researcher to practice good AI citizenship.",
      },
    ],
    creative: {
      prompt:
        "Write your own personal 'AI safety pledge' — 4-5 concrete rules you'll actually follow when using AI this summer (things like 'I'll fact-check anything I'd repeat to someone else' or 'I'll say when I used AI to help with something'). Make it genuinely yours, not generic.",
      checklist: [
        "4-5 concrete, specific rules (not vague platitudes)",
        "At least one rule about verifying/fact-checking",
        "At least one rule about honesty/transparency about AI use",
        "You'd actually be willing to follow these for real",
      ],
    },
  },

  // ── GAME DESIGN · TIER 1 ───────────────────────────────────────────────────
  {
    id: "gd1-game-loop",
    track: "game-design",
    tier: 1,
    minAgeMode: "junior",
    title: "The Game Loop",
    tagline: "The heartbeat every game shares",
    icon: "💓",
    prereqs: [],
    xp: 60,
    brief:
      "Every game you've ever played — Minecraft, Fortnite, Mario, all of them — shares one invisible heartbeat running underneath everything: the **game loop**.",
    lesson: [
      "A **game loop** is the core cycle every video game runs, over and over, dozens of times per second: **input → update → render.** Check what the player did (input), change the game world based on that (update), then draw the new frame on screen (render). Then do it again. And again. Forever, until the game ends.",
      "This happens SO fast — often 60 times per second — that it feels like smooth, continuous motion, even though it's really thousands of separate still frames flashed one after another, like a flipbook.",
      "'Input' isn't just button presses — it's anything the game needs to check each frame: has time passed, did an enemy collide with the player, did a timer run out. 'Update' is where the actual game logic lives: moving positions, checking health, deciding AI enemy moves. 'Render' is purely visual — drawing the current state, and nothing else.",
      "Understanding the game loop is the single most useful mental model for making ANY game, because every feature you'll ever add — jumping, shooting, scoring — has to fit into this same cycle: check something, change something, draw something, repeat.",
    ],
    questions: [
      {
        prompt: "What are the three core phases of a game loop, in order?",
        options: [
          "Render → Update → Input",
          "Input → Update → Render",
          "Update → Render → Input",
          "There's only one phase: Render",
        ],
        answer: 1,
        explain:
          "The standard cycle checks what happened (input), changes the game state accordingly (update), then draws the result (render) — always in that order, every single frame.",
      },
      {
        prompt:
          "Why does a game feel like smooth motion instead of a slideshow?",
        options: [
          "The game loop runs so fast (often 60 times per second) that individual still frames blend into apparent continuous motion",
          "Games don't actually use frames at all",
          "It's an optical illusion unrelated to the game loop",
          "Only high-end computers can produce smooth motion",
        ],
        answer: 0,
        explain:
          "At a high enough frame rate, the human eye perceives a rapid sequence of still images as continuous, smooth motion — the same principle behind film and animation.",
      },
    ],
    creative: {
      prompt:
        "Pick a simple game action (jumping, shooting, collecting a coin) and write out exactly what happens in each phase of the game loop for that one action — one sentence for Input, one for Update, one for Render.",
      checklist: [
        "Picked one specific, concrete game action",
        "Clearly separated what happens in Input vs Update vs Render",
        "The three phases are in the correct order",
        "You could explain this out loud to someone who's never coded a game",
      ],
    },
  },
  {
    id: "gd1-mechanics",
    track: "game-design",
    tier: 1,
    minAgeMode: "junior",
    title: "Mechanics 101",
    tagline: "The verbs your game lets you do",
    icon: "🕹️",
    prereqs: ["gd1-game-loop"],
    xp: 60,
    brief:
      "Jump. Shoot. Craft. Dash. Every game is built from a small set of core actions the player can DO — and picking the right ones is the very first design decision of any game.",
    lesson: [
      "A **game mechanic** is a basic rule or action the player can perform — jump, shoot, mine, craft, dash, block. Mechanics are like a game's verbs: they define what you're actually ABLE to do, moment to moment.",
      "Great games often start from just a HANDFUL of core mechanics, executed really well, rather than a huge messy pile of half-finished ones. Classic platformers might really be built on just 'move' + 'jump' + 'stomp enemies' — three mechanics, endlessly combined into new challenges.",
      "Mechanics **combine** to create depth. Minecraft's 'mine' + 'craft' + 'place' mechanics, combined, create an entire building/survival system far bigger than any single mechanic alone. This is a huge design lesson: depth often comes from combining SIMPLE mechanics cleverly, not from piling on complexity.",
      "When you design your own game (hello, Project studio), the first real question is always: **what are my 2-4 core mechanics, and are they actually fun on their own, before I add anything else?** If the core verb isn't fun, more content won't save it.",
    ],
    questions: [
      {
        prompt: "What is a 'game mechanic'?",
        options: [
          "The graphics style of a game",
          "A basic rule or action the player can perform, like jumping or crafting",
          "The company that made the game",
          "The music playing in the background",
        ],
        answer: 1,
        explain:
          "Mechanics are the fundamental actions/rules available to the player — the verbs of the game — separate from graphics, story, or any other layer.",
      },
      {
        prompt:
          "Why do many great games use just a handful of mechanics instead of dozens?",
        options: [
          "Because adding more mechanics is technically impossible",
          "A small set of well-executed mechanics, combined cleverly, can create deep, fun gameplay — more isn't automatically better",
          "Players get confused by any game with more than 3 mechanics",
          "It's cheaper to make, which is the only reason",
        ],
        answer: 1,
        explain:
          "Depth comes from how mechanics interact and combine, not just from stacking on more of them — a few fun, well-tuned mechanics often beat many shallow ones.",
      },
    ],
    creative: {
      prompt:
        "Design a tiny game concept using ONLY 3 mechanics (like 'jump,' 'push blocks,' 'collect keys'). Describe how those 3 mechanics could combine to create at least 2 different interesting challenges/puzzles.",
      checklist: [
        "Exactly 3 mechanics chosen, clearly named",
        "At least 2 distinct challenge ideas described",
        "Each challenge genuinely uses a COMBINATION of the mechanics, not just one at a time",
        "You'd actually want to play this if it existed",
      ],
    },
  },
  {
    id: "gd1-difficulty",
    track: "game-design",
    tier: 1,
    minAgeMode: "junior",
    title: "Curve Control",
    tagline: "Too easy is boring, too hard is rage-quit",
    icon: "📈",
    prereqs: ["gd1-mechanics"],
    xp: 65,
    badge: { id: "badge-curve-crafter", label: "Curve Crafter", icon: "📈" },
    brief:
      "Ever rage-quit a game that spiked in difficulty out of nowhere? Or gotten bored by one that never got harder? Both are failures of the **difficulty curve** — one of the most underrated skills in game design.",
    lesson: [
      "A **difficulty curve** is how a game's challenge level changes over time. A well-designed curve generally rises gradually, giving players time to learn each new skill before the next challenge builds on it — steady growth, not a flat line and not a cliff.",
      "Good difficulty design usually **teaches through play, not text**. Instead of a wall of instructions, a well-made early level puts the player in a safe situation where the ONLY reasonable move teaches the new mechanic naturally — like a level with one gap that requires jumping, right after jump was introduced.",
      "**Difficulty spikes** — a sudden, unfair jump in challenge with no warning or practice — are one of the most common ways games lose players. The fix is usually pacing: introduce ONE new challenge at a time, let players practice it a bit, THEN combine it with previous challenges.",
      "Great difficulty curves also allow small dips right after a hard section — a moment to breathe and feel accomplished — before ramping up again. Difficulty isn't just 'always harder'; it's a rhythm of tension and release, like a good piece of music.",
    ],
    questions: [
      {
        prompt: "What usually causes players to rage-quit due to difficulty?",
        options: [
          "Any game that has challenge at all",
          "A sudden, unfair spike in difficulty without enough practice or warning",
          "Games that are too easy",
          "Games with colorful graphics",
        ],
        answer: 1,
        explain:
          "It's not difficulty itself that frustrates players — it's an unfair, sudden spike that outpaces what they've had a chance to practice and learn.",
      },
      {
        prompt: "What's a smart way to teach a new mechanic to players?",
        options: [
          "A long wall of text before the level starts",
          "Design a safe situation where the natural, obvious move happens to use the new mechanic, so players learn by doing",
          "Never explain anything and let players figure out everything from scratch",
          "Only explain mechanics in the game's manual, never in-level",
        ],
        answer: 1,
        explain:
          "'Teaching through play' — designing the level so the mechanic is the natural solution — tends to stick better and feel more satisfying than reading instructions.",
      },
    ],
    creative: {
      prompt:
        "Design a 5-level difficulty curve for a simple game (like a maze or platformer) — describe what's genuinely new or harder about each level, and identify where you'd put a 'breather' moment.",
      checklist: [
        "5 levels described, each with a clear change in difficulty",
        "Difficulty increases gradually, not with a sudden unfair jump",
        "At least one 'breather'/easier moment placed intentionally",
        "Each level teaches or builds on something from the previous one",
      ],
    },
  },
  {
    id: "gd1-pixel-art",
    track: "game-design",
    tier: 1,
    minAgeMode: "junior",
    title: "Pixel Art Basics",
    tagline: "Big feelings, tiny squares",
    icon: "🎨",
    prereqs: ["gd1-difficulty"],
    xp: 60,
    brief:
      "Some of the most beloved game art ever made (think classic 8-bit and 16-bit games, and tons of modern indie hits) uses tiny grids of colored squares. That's **pixel art**, and it has real rules worth knowing.",
    lesson: [
      "**Pixel art** is art made of a visible grid of individual colored squares (pixels), usually at a deliberately low resolution, where every single pixel is a purposeful choice — nothing is 'automatically smoothed' by software.",
      "A **limited color palette** (often just a handful of colors per sprite) is a defining feature, not a limitation to fight against. Working within a small palette forces clearer silhouettes and stronger contrast, which is part of why pixel art often reads so clearly even at a tiny size.",
      "**Silhouette** matters enormously: a good character sprite should be recognizable just from its outline shape, even with zero detail filled in. This is why iconic game characters (mushroom-hat plumber, blocky miner) have such distinct, simple outlines — you recognize the SHAPE first, from across a screen, before any detail.",
      "A classic beginner mistake is over-detailing tiny sprites — cramming in too much detail on very few pixels actually reads as noisy mush. Simpler, bolder shapes with smart color choices usually beat cramming in more detail on a small canvas.",
    ],
    questions: [
      {
        prompt:
          "Why is a limited color palette often a strength in pixel art, not just a limitation?",
        options: [
          "It has no real effect on the final look",
          "It forces clearer silhouettes and stronger contrast, making small art read clearly even at tiny sizes",
          "More colors are always objectively better in every art style",
          "Limited palettes are only used because of old hardware, with no ongoing artistic value",
        ],
        answer: 1,
        explain:
          "Working within fewer colors pushes artists toward clear contrast and strong shapes, which is exactly why so much pixel art still reads well and looks intentional even decades later, by choice, not just hardware limits.",
      },
      {
        prompt:
          "Why does silhouette matter so much for a game character sprite?",
        options: [
          "Silhouette is irrelevant if the colors are nice",
          "A recognizable outline shape lets players identify a character instantly, even from far away or with minimal detail",
          "Games never actually use silhouettes for character design",
          "Only villains need strong silhouettes",
        ],
        answer: 1,
        explain:
          "Players often glance at characters quickly or from a distance — a strong, distinct outline shape ensures instant recognition, which is why iconic game characters are so shape-driven.",
      },
    ],
    creative: {
      prompt:
        "On grid paper (or graph paper, or a simple digital pixel tool), design a small character sprite (16x16 or 8x8 squares) using no more than 4 colors. Focus on making the silhouette recognizable even if you covered up all the interior detail.",
      checklist: [
        "Used a grid, not freehand drawing",
        "4 colors or fewer used total",
        "Silhouette/outline is distinct and recognizable on its own",
        "You'd recognize this character even shrunk down small",
      ],
    },
  },

  // ── GAME DESIGN · TIER 2 ───────────────────────────────────────────────────
  {
    id: "gd2-mechanics-dynamics",
    track: "game-design",
    tier: 2,
    minAgeMode: "junior",
    title: "Mechanics vs Dynamics",
    tagline: "Rules create behavior nobody wrote down",
    icon: "🌊",
    prereqs: ["gd1-pixel-art"],
    xp: 100,
    brief:
      "No designer ever wrote 'players will camp in the corner' as a rule — but simple mechanics can create that exact behavior anyway. Welcome to the gap between **mechanics** and **dynamics**.",
    lesson: [
      "**Mechanics** are the rules you actually design and code — 'players can build walls,' 'ranged attacks do more damage from further away.' **Dynamics** are the emergent PATTERNS OF PLAY that show up once real players interact with those mechanics — like everyone building defensive forts, or camping at a safe distance, even though no rule literally said 'camp here.'",
      "This mechanics-to-dynamics jump is often surprising to new designers: you write simple, reasonable-sounding rules, and players discover behaviors and strategies you never explicitly planned for — sometimes delightful, sometimes a problem (like an 'exploit' or overly dominant strategy).",
      "A related layer is **aesthetics** — the actual FEELINGS players have (tension, triumph, curiosity) that emerge from the dynamics. This three-layer chain — **Mechanics → Dynamics → Aesthetics** (sometimes called the **MDA framework**) — is one of the most useful mental tools in real game design: you design mechanics directly, but you're really aiming for the feelings at the end of the chain.",
      "Practical takeaway: when playtesting your own game, watch for dynamics you didn't expect. If everyone finds the exact same 'best strategy' and just repeats it, that's a dynamic telling you a mechanic needs rebalancing.",
    ],
    questions: [
      {
        prompt: "What's the difference between a mechanic and a dynamic?",
        options: [
          "They're the same thing with different names",
          "A mechanic is a designed rule; a dynamic is the emergent pattern of play that shows up when real players use that rule",
          "Dynamics are always bugs that need fixing",
          "Mechanics only apply to multiplayer games",
        ],
        answer: 1,
        explain:
          "Mechanics are what you directly design (the rules); dynamics are what actually happens when players engage with those rules — often including behaviors the designer never explicitly planned.",
      },
      {
        prompt:
          "In the MDA framework, what comes after Mechanics and Dynamics?",
        options: [
          "Art",
          "Aesthetics — the actual feelings and experience players have",
          "Achievements",
          "Advertising",
        ],
        answer: 1,
        explain:
          "MDA stands for Mechanics → Dynamics → Aesthetics — the framework's whole point is that designers directly control mechanics, but are really aiming to produce specific player FEELINGS (aesthetics) at the end of that chain.",
      },
    ],
    creative: {
      prompt:
        "Pick a game you know well and identify one mechanic, the dynamic (pattern of play) it tends to create among real players, and the aesthetic/feeling that dynamic produces. Then suggest one small mechanic tweak that might change the dynamic.",
      checklist: [
        "Named a real, specific mechanic from a real game",
        "Described an actual observed or plausible player dynamic from that mechanic",
        "Connected it to a feeling/aesthetic outcome",
        "Proposed one concrete mechanic change and predicted its effect on the dynamic",
      ],
    },
  },
  {
    id: "gd2-level-design",
    track: "game-design",
    tier: 2,
    minAgeMode: "junior",
    title: "Level Design Lab",
    tagline: "Guiding players without a single arrow",
    icon: "🗺️",
    prereqs: ["gd2-mechanics-dynamics"],
    xp: 100,
    badge: {
      id: "badge-level-architect",
      label: "Level Architect",
      icon: "🗺️",
    },
    brief:
      "Great levels quietly teach you where to go without a single 'GO THIS WAY' sign. That invisible guidance is one of the coolest tricks in **level design**.",
    lesson: [
      "**Level design** is the craft of arranging space, obstacles, and rewards to guide the player's experience — where they go, what they learn, and when they feel challenged versus safe. It's part architecture, part psychology.",
      "**Environmental guidance** uses visual cues instead of text: brighter lighting down the correct path, a coin trail leading toward the way forward, an obviously different-looking wall hinting 'this one breaks.' Good level design makes the right path feel like the player's own discovery, not a forced instruction.",
      "**Pacing** in a level mixes combat/challenge sections with quieter exploration or story moments — nonstop intensity exhausts players just like nonstop calm bores them. Good levels breathe.",
      "A classic professional technique: **teach a mechanic in a safe 'demonstration' area first**, then immediately test it in a slightly harder version, then combine it with something else later. This 'introduce → test → combine' pattern shows up in level after level across countless well-regarded games.",
    ],
    questions: [
      {
        prompt:
          "What's an example of 'environmental guidance' in level design?",
        options: [
          "A pop-up text box explaining every single turn",
          "A coin trail or lighting difference that visually hints at the correct path without explicit text",
          "Making every path look completely identical",
          "Removing all visual detail from the level",
        ],
        answer: 1,
        explain:
          "Environmental guidance uses visual design itself (lighting, item placement, distinct textures) to steer players, letting the correct path feel discovered rather than dictated by text.",
      },
      {
        prompt:
          "What's the 'introduce → test → combine' pattern in level design?",
        options: [
          "A random level generation algorithm",
          "Teaching a mechanic safely first, testing it in a slightly harder version, then later combining it with other mechanics",
          "A way to make every level exactly the same difficulty",
          "A rule that says levels must always get easier over time",
        ],
        answer: 1,
        explain:
          "This pacing pattern is a common, effective structure: safely introduce a new mechanic, then challenge the player with it alone, then later combine it with previously learned mechanics for deeper challenges.",
      },
    ],
    creative: {
      prompt:
        "Sketch (on paper) a simple top-down level layout for a game of your choice. Mark where you'd place: the mechanic-teaching safe zone, at least one piece of environmental guidance (not text), a pacing 'breather' spot, and the level's exit/goal.",
      checklist: [
        "A clear layout sketch exists, even if simple",
        "A safe 'teach the mechanic' zone is marked",
        "At least one non-text environmental guidance element is marked",
        "A pacing breather AND the goal/exit are both marked",
      ],
    },
  },
  {
    id: "gd2-juice",
    track: "game-design",
    tier: 2,
    minAgeMode: "builder",
    title: "Game Feel & Juice",
    tagline: "Why a simple jump can feel AMAZING",
    icon: "✨",
    prereqs: ["gd2-level-design"],
    xp: 100,
    brief:
      "Two games can have the literal exact same jump mechanic — same height, same speed — and one feels flat while the other feels incredible. That extra sparkle is what designers call **juice**.",
    lesson: [
      "**Juice** (also called **game feel**) is all the extra sensory feedback layered on top of a mechanic that makes it satisfying: screen shake on impact, a little squash-and-stretch on landing, a satisfying sound effect, a burst of particles, a tiny pause on a big hit. None of it changes the actual GAME LOGIC — the jump height is identical — but it changes how the moment FEELS.",
      "**Squash and stretch** is a classic animation trick: a character squishes slightly on landing and stretches slightly while jumping. It's not realistic, but it reads as weighty and alive, way more than a rigid, unchanging sprite.",
      "**Feedback on every meaningful action** matters: pressing a button should feel like something actually happened, immediately — an instant sound, a flash, a wiggle. Games that feel 'unresponsive' or 'mushy' are usually missing this immediate feedback, even if the underlying mechanic is technically working correctly.",
      "Juice is genuinely one of the highest-value-per-effort additions you can make to a game. A tiny screen shake and particle burst on an explosion, added AFTER the core mechanic already works, can transform a good mechanic into a great-feeling one, cheaply.",
    ],
    questions: [
      {
        prompt: "What does 'juice' add to a game?",
        options: [
          "New core mechanics and rules",
          "Extra sensory feedback (screen shake, particles, sound, squash-and-stretch) that makes existing mechanics feel more satisfying, without changing the underlying logic",
          "Harder difficulty levels",
          "Better hitboxes for collision detection",
        ],
        answer: 1,
        explain:
          "Juice is purely about FEEL and feedback layered on top of mechanics that already work — the actual rules and numbers stay the same, but the moment-to-moment experience feels far more satisfying.",
      },
      {
        prompt:
          "Why does 'squash and stretch' on a jumping character work, even though it's not realistic?",
        options: [
          "It makes the jump physically higher",
          "It reads as weighty and alive, giving the animation more expressive punch than a rigid unchanging sprite, even without being physically accurate",
          "It's required by all game engines automatically",
          "It only works in 3D games, never 2D",
        ],
        answer: 1,
        explain:
          "Squash and stretch is a classic, deliberately exaggerated animation principle — it's not about physical accuracy, it's about selling weight and life to the player's eye.",
      },
    ],
    creative: {
      prompt:
        "Pick one simple action in a game (jump, hit an enemy, collect a coin) and design 4 different 'juice' effects you'd add to it (like a sound, a particle burst, a screen shake, a squash-stretch) — describe exactly what each one looks/sounds like and why it helps.",
      checklist: [
        "4 distinct juice effects designed for one specific action",
        "Each effect described concretely (not just 'make it feel good')",
        "You explain WHY each effect adds to the feeling, not just what it is",
        "None of the effects change the actual game rules/logic — only the feel",
      ],
    },
  },
  {
    id: "gd2-playtesting",
    track: "game-design",
    tier: 2,
    minAgeMode: "builder",
    title: "Playtest or Perish",
    tagline: "You are not your player",
    icon: "🧪",
    prereqs: ["gd2-juice"],
    xp: 100,
    brief:
      "You already know exactly how your own game works — which means you're the WORST person to judge if it's actually fun or confusing. That's why every real game gets **playtested** by other people, constantly.",
    lesson: [
      "**Playtesting** means having real people (not the designer) play your game while you watch closely and gather honest feedback. It's essential because the designer already knows every secret, every control, every intended solution — so they physically cannot experience the game the way a first-time player does.",
      "The single most valuable playtesting rule: **watch what players DO, more than what they SAY.** A player might say 'this level was fine' while visibly struggling and confused for two minutes at one spot — the struggle is the real, more honest signal.",
      "**Ask open questions, not leading ones.** 'Did you like the jump?' nudges people toward saying yes to be nice. 'Walk me through what you were thinking during that part' gets you real, unfiltered insight into confusion or frustration you might've missed.",
      "A great playtest habit: **stay quiet and don't help.** It's incredibly tempting to jump in and explain when a player is stuck — but that moment of confusion IS the data. If you rescue them immediately, you never learn that your game needed a better hint there.",
    ],
    questions: [
      {
        prompt:
          "Why is the designer usually the worst person to judge whether their own game is confusing?",
        options: [
          "Designers have bad taste in games",
          "The designer already knows every secret, control, and solution, so they can't experience the confusion a first-time player would",
          "Designers aren't allowed to playtest their own games by rule",
          "It's actually fine for designers to judge their own games perfectly",
        ],
        answer: 1,
        explain:
          "Having built the game, the designer's brain already 'knows' the answers, so they literally cannot experience the same confusion or discovery a fresh player does — hence the need for outside playtesters.",
      },
      {
        prompt:
          "During a playtest, why watch what players DO more than what they SAY?",
        options: [
          "What people say is always false",
          "Players often say polite or uncertain things, but their actual struggle, hesitation, or confusion during play is a more honest, direct signal",
          "Watching is easier than listening",
          "Talking during playtests is against the rules",
        ],
        answer: 1,
        explain:
          "People frequently soften feedback to be nice or aren't even consciously aware of their own confusion — but visible hesitation, repeated failed attempts, or getting lost tells you the truth regardless of what they say afterward.",
      },
    ],
    creative: {
      prompt:
        "Have someone (sibling, friend, parent) play any simple game or level you've made or designed on paper. Watch silently for 2 minutes without helping, taking notes on anything they seemed confused about or repeated. Then ask one open-ended question about their experience.",
      checklist: [
        "Actually observed a real person playing/attempting something, without jumping in to help",
        "Took specific notes on moments of confusion or struggle, not just overall impressions",
        "Asked at least one genuinely open-ended (not leading) question afterward",
        "Identified one concrete change you'd make based on what you observed",
      ],
    },
  },

  // ── GAME DESIGN · TIER 3 ───────────────────────────────────────────────────
  {
    id: "gd3-procedural",
    track: "game-design",
    tier: 3,
    minAgeMode: "legend",
    title: "Procedural Generation",
    tagline: "Infinite worlds from a few smart rules",
    icon: "🌐",
    prereqs: ["gd2-playtesting"],
    xp: 150,
    badge: {
      id: "badge-world-generator",
      label: "World Generator",
      icon: "🌐",
    },
    brief:
      "Minecraft's worlds are practically infinite, and no human hand-placed every block. That's **procedural generation** — using algorithms and math to generate huge amounts of content from a small set of rules.",
    lesson: [
      "**Procedural generation (PCG)** creates game content — levels, terrain, items, even quests — algorithmically, using rules and (often) randomness, instead of a human hand-placing every single piece. Minecraft's terrain, randomly generated dungeon layouts, and randomized loot tables are all real examples.",
      "A common core tool is **noise functions** (like Perlin noise) — mathematical functions that generate smooth, natural-looking randomness instead of pure chaotic static. This is exactly why procedurally generated terrain looks like rolling hills and valleys instead of random spiky noise — the underlying math is specifically designed to be smooth and continuous.",
      "A **seed** is a starting number fed into the generation algorithm; the SAME seed with the SAME algorithm produces the EXACT same world every time. This is why you can share a Minecraft seed with a friend and get the identical map — 'random' generation is actually fully deterministic once you fix the seed.",
      "The real design challenge with PCG isn't just 'generate SOMETHING' — it's generating content that's reliably fun, fair, and coherent. Purely random generation can easily create unbeatable or nonsensical results, so real systems usually combine randomness with careful rules and constraints ('always place at least one exit,' 'never generate an unreachable treasure') to keep things playable.",
    ],
    questions: [
      {
        prompt: "What does a 'seed' control in procedural generation?",
        options: [
          "The graphics quality of the generated content",
          "The exact starting input that determines the (otherwise identical) output of the generation algorithm every time",
          "How fast the game runs",
          "The game's difficulty setting",
        ],
        answer: 1,
        explain:
          "A seed is the deterministic starting point — the same seed run through the same algorithm always produces the exact same result, which is why sharing a seed lets someone else generate an identical world.",
      },
      {
        prompt:
          "Why do procedural generation systems often use noise functions like Perlin noise instead of pure random numbers?",
        options: [
          "Pure randomness is faster to compute",
          "Noise functions produce smooth, natural-looking variation (like rolling hills) instead of chaotic, spiky randomness",
          "Noise functions are required by every game engine",
          "There's no real difference between the two approaches",
        ],
        answer: 1,
        explain:
          "Pure random numbers per point would create jarring, spiky, unnatural-looking terrain. Noise functions are specifically designed to vary smoothly across space, producing much more natural, coherent results.",
      },
      {
        prompt:
          "What's the real design challenge in a good procedural generation system?",
        options: [
          "Making sure everything generated is completely random with zero rules",
          "Combining randomness with careful constraints (like guaranteeing an exit exists) so the output stays fun, fair, and playable, not just varied",
          "Generating content as slowly as possible",
          "Avoiding all use of math or algorithms",
        ],
        answer: 1,
        explain:
          "Pure unconstrained randomness can easily produce unfair or broken results (unreachable items, unsolvable layouts) — good PCG systems layer rules and constraints on top of randomness to guarantee playability.",
      },
    ],
    creative: {
      prompt:
        "Design a simple procedural generation rule set (on paper) for generating small dungeon rooms — describe what elements get randomized (size, enemy count, treasure), and write at least 2 constraints that guarantee every generated room stays fair and playable.",
      checklist: [
        "Described at least 3 randomized elements",
        "Explained roughly how randomization would work for each (a range, a chance, a table)",
        "At least 2 explicit fairness/playability constraints included",
        "You can explain why pure unconstrained randomness would risk unfair results here",
      ],
    },
  },
  {
    id: "gd3-balance",
    track: "game-design",
    tier: 3,
    minAgeMode: "legend",
    title: "Balancing Act",
    tagline: "The invisible math behind 'fair'",
    icon: "⚖️",
    prereqs: ["gd3-procedural"],
    xp: 150,
    brief:
      "Why does one weapon in a game feel 'obviously the best' while another feels useless? That's a **balance** problem — and fixing it is real applied math hiding behind fun.",
    lesson: [
      "**Game balance** is the practice of tuning numbers (damage, cost, speed, drop rates) so that different choices — weapons, characters, strategies — feel meaningfully different but roughly equally viable, rather than one dominant 'obviously correct' choice making everything else pointless.",
      "A **dominant strategy** is a choice so much better than the alternatives that skilled players always pick it, and the other options become effectively decorative. Finding and fixing dominant strategies (usually by adjusting numbers, or adding a meaningful tradeoff/weakness) is a core, constant balancing job.",
      "**Risk vs. reward** is a classic balancing lever: a weapon with huge damage but very slow attack speed, or high risk of missing, can feel balanced against a weaker-but-safer weapon — because the numbers trade off against each other rather than one option simply winning on every axis.",
      "Real balance work is iterative and data-driven: designers track win rates, pick rates, and playtester feedback, then nudge specific numbers (not redesign everything) and test again. It's less 'genius intuition' and more patient, repeated small adjustments guided by real evidence.",
    ],
    questions: [
      {
        prompt: "What is a 'dominant strategy' in game balance?",
        options: [
          "Any strategy a player enjoys using",
          "A choice so clearly superior to the alternatives that skilled players always pick it, making other options pointless",
          "The strategy the game's story recommends",
          "A strategy that only works in multiplayer games",
        ],
        answer: 1,
        explain:
          "A dominant strategy breaks meaningful choice — if one option is simply best with no real tradeoff, players stop considering alternatives, which usually signals a balance problem to fix.",
      },
      {
        prompt:
          "How does 'risk vs. reward' help balance two different weapon choices?",
        options: [
          "By making both weapons identical in every stat",
          "By giving each weapon tradeoffs (like high damage but slow speed vs. lower damage but safer/faster) so neither one simply wins on every axis",
          "By removing all weapons except one",
          "Risk vs reward is unrelated to weapon balance",
        ],
        answer: 1,
        explain:
          "When each option has genuine tradeoffs — strong here, weaker there — no single choice dominates every situation, which keeps meaningful decision-making alive for the player.",
      },
    ],
    creative: {
      prompt:
        "Design 3 weapons or abilities for a game, each with different stats (damage, speed, cost, range — pick what fits). Make sure none of the 3 is simply better than the others in every category — identify the specific tradeoff for each.",
      checklist: [
        "3 weapons/abilities with actual numeric or clear comparative stats",
        "No single option wins on every stat compared to the others",
        "Each option's specific tradeoff (strength + weakness) is clearly stated",
        "You'd genuinely have a hard time picking a single 'best' one",
      ],
    },
  },
  {
    id: "gd3-systems-narrative",
    track: "game-design",
    tier: 3,
    minAgeMode: "legend",
    title: "Systemic Storytelling",
    tagline: "Stories that emerge, not just get told",
    icon: "📖",
    prereqs: ["gd3-balance"],
    xp: 150,
    brief:
      "Some of gaming's best stories were never written by anyone — they emerged from systems bumping into each other, like a wild raid story you tell your friends after the fact. That's **emergent** or **systemic** storytelling.",
    lesson: [
      "**Scripted narrative** is a story a writer directly wrote out — cutscenes, dialogue, a fixed plot. **Emergent narrative** is a 'story' that arises naturally from systems interacting, unplanned by any single writer — like a base-building game where your carefully built fortress gets wrecked by a random disaster, creating a genuinely unique personal story nobody scripted.",
      "Systemic storytelling relies on interacting systems (weather, AI behavior, physics, economy) that can combine in unpredictable, often surprising ways. The 'story' isn't in a script file — it's in the emergent interaction of independent systems, which is why two players' playthroughs can produce wildly different personal stories from the exact same rules.",
      "Many modern games deliberately blend both: a scripted main story provides structure and emotional beats, while systemic elements (open-world events, emergent AI behavior, physics chaos) provide personal, unrepeatable moments layered on top. Neither approach fully replaces the other — they solve different problems.",
      "Designing for emergent narrative means designing good SYSTEMS more than writing good SENTENCES: reliable AI behaviors, believable physics, systems that react logically to each other. If your systems are rich and consistent enough, players will generate their own stories from them, for free.",
    ],
    questions: [
      {
        prompt:
          "What's the key difference between scripted and emergent narrative?",
        options: [
          "Scripted narrative is always better quality",
          "Scripted narrative is directly written by a designer; emergent narrative arises unplanned from systems interacting during play",
          "Emergent narrative only exists in multiplayer games",
          "There's no meaningful difference between the two",
        ],
        answer: 1,
        explain:
          "Scripted narrative comes from deliberate authored content (cutscenes, dialogue); emergent narrative comes from independent systems (physics, AI, economy) interacting in ways no single writer specifically planned.",
      },
      {
        prompt: "What does designing FOR emergent narrative mostly require?",
        options: [
          "Writing more detailed dialogue and cutscenes",
          "Building rich, reliable, consistent systems (AI, physics, economy) that can interact in surprising but logical ways",
          "Removing all randomness from the game",
          "Avoiding any scripted content whatsoever",
        ],
        answer: 1,
        explain:
          "Emergent stories come from systems, not scripts — the design work is making underlying systems believable and interaction-rich enough that players naturally generate their own unique moments.",
      },
    ],
    creative: {
      prompt:
        "Describe a real or imagined moment where a game's SYSTEMS (not a scripted cutscene) created a genuinely memorable personal story for you or someone you know. Then design one new system rule for a game that could create similarly surprising emergent moments.",
      checklist: [
        "Described a real or plausible systemic (not scripted) story moment",
        "Clearly identified which systems interacted to create it",
        "Proposed one new, concrete system rule of your own",
        "Explained why your new rule could create unpredictable but logical emergent moments",
      ],
    },
  },
  {
    id: "gd3-shipping",
    track: "game-design",
    tier: 3,
    minAgeMode: "legend",
    title: "Ship It",
    tagline: "A finished small game beats a perfect unfinished one",
    icon: "🚢",
    prereqs: ["gd3-systems-narrative"],
    xp: 150,
    badge: { id: "badge-game-shipper", label: "Game Shipper", icon: "🚢" },
    brief:
      "Countless dream games never existed because their creator kept adding 'just one more feature' forever. The final, hardest skill in game design isn't a mechanic at all — it's actually **finishing** and **shipping**.",
    lesson: [
      "**Scope** is everything your game is trying to include — features, levels, mechanics, art. **Scope creep** is when that list keeps quietly growing ('what if I also added multiplayer... and a crafting system... and 20 more levels...') until the project becomes too big to ever finish. Nearly every abandoned game project died from scope creep, not lack of talent.",
      "An **MVP (Minimum Viable Product)** is the smallest version of your game that's actually complete and playable — one level, core mechanic working, a clear win/lose state. Shipping a genuinely finished MVP teaches you more, and feels better, than endlessly polishing an unfinished giant vision.",
      "**Cutting scope on purpose** is a real, respected design skill, not a failure. Professional teams constantly ask 'does this feature actually matter to the core fun, or are we just adding it because it seemed cool?' — and cut ruthlessly based on the honest answer.",
      "**Shipping** — actually finishing and sharing your game with real players — is where the real learning happens: real feedback, real bugs found by real people, real pride in something that actually exists. A tiny finished game you can show someone beats an infinite, ever-expanding game that only exists in your head.",
    ],
    questions: [
      {
        prompt: "What usually kills unfinished passion-project games?",
        options: [
          "Lack of any coding talent",
          "Scope creep — the feature list quietly growing until the project becomes impossible to ever finish",
          "Bad graphics",
          "Playing too many other games for inspiration",
        ],
        answer: 1,
        explain:
          "Scope creep — continuously adding 'just one more feature' — is one of the most common reasons ambitious game projects never get finished, regardless of the creator's actual skill.",
      },
      {
        prompt: "What is an MVP (Minimum Viable Product) in game design?",
        options: [
          "The most expensive version of a game",
          "The smallest version of the game that's genuinely complete and playable, with a working core mechanic and a clear win/lose state",
          "A multiplayer-only game mode",
          "A game with maximum graphics settings",
        ],
        answer: 1,
        explain:
          "An MVP deliberately cuts scope down to the smallest complete, playable version — proving the core idea works before (optionally) expanding, rather than chasing a huge vision that never finishes.",
      },
      {
        prompt:
          "Why is 'cutting scope on purpose' considered a real design skill, not a failure?",
        options: [
          "Cutting features is always a sign of running out of time with no strategy behind it",
          "Deliberately deciding what NOT to build, based on what actually matters to the core fun, is how real, professional games actually get finished",
          "Good games never need to cut any features",
          "Scope cutting is only something amateur developers do",
        ],
        answer: 1,
        explain:
          "Professional teams constantly and deliberately cut features that don't serve the core fun — it's a disciplined, intentional skill for finishing well, not a sign of failure or running out of time.",
      },
    ],
    creative: {
      prompt:
        "Take a big dream game idea you have (or make one up) and cut it down to a genuine MVP — describe the ONE core mechanic, the smallest amount of content needed to make it playable, and 3 features you're deliberately cutting for now (and why).",
      checklist: [
        "One clear core mechanic identified for the MVP",
        "Described the smallest playable content needed (levels, enemies, etc.)",
        "3 specific features deliberately cut, with a stated reason for each",
        "The resulting MVP genuinely sounds finishable and playable, not still huge",
      ],
    },
  },
  ...READINESS_LESSONS,
  ...TOGETHER_LESSONS,
];
