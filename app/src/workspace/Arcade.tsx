import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Notice, Tabs } from "./ui";
import LabSave from "./LabSave";
import { labDocument } from "./labDocument";
const situations = [
  {
    question: "The goalie moves left. Which rule aims at the open side?",
    options: [
      "If goalie is left, kick left",
      "If goalie is left, kick right",
      "Always kick left",
    ],
    answer: 1,
    explain:
      "The condition checks the goalie’s position. The action uses the open space on the opposite side.",
  },
  {
    question:
      "You can only kick when the ball is close AND the timer is running. Which expression matches?",
    options: [
      "ballClose || timerRunning",
      "ballClose && timerRunning",
      "!ballClose",
    ],
    answer: 1,
    explain:
      "AND requires both conditions. OR would allow a kick when only one condition is true.",
  },
  {
    question: "The timer reaches zero. What should happen first?",
    options: [
      "Add one goal",
      "Wait for another kick",
      "Stop accepting kicks, then show the score",
    ],
    answer: 2,
    explain:
      "Order matters: stop input first, then calculate and display the final result.",
  },
];
function LogicLab() {
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const q = situations[round];
  return (
    <section className="panel">
      <h2>If-then soccer</h2>
      <p>
        Practice the logic behind a game. Challenge {round + 1} of{" "}
        {situations.length}.
      </p>
      <fieldset className="question">
        <legend>{q.question}</legend>
        {q.options.map((text, i) => (
          <label className="answer" key={text}>
            <input
              type="radio"
              name="logic"
              checked={answer === i}
              onChange={() => setAnswer(i)}
            />
            {text}
          </label>
        ))}
      </fieldset>
      {answer !== null && (
        <Notice error={answer !== q.answer}>
          {answer === q.answer ? "That works. " : "Try again. "}
          {q.explain}
        </Notice>
      )}
      <Button
        disabled={answer !== q.answer}
        onClick={() => {
          setRound((round + 1) % situations.length);
          setAnswer(null);
        }}
      >
        {round === situations.length - 1 ? "Practice again" : "Next challenge"}
      </Button>
      <LabSave
        name="My if-then experiment"
        code={() =>
          labDocument(
            "If-then experiment",
            '<p>Predict which side is open, then try both goalie positions.</p><button id="left">Goalie left</button><button id="right">Goalie right</button><p id="result" role="status"></p>',
            'function choose(goalie){const aim=goalie==="left"?"right":"left";document.getElementById("result").textContent="Kick "+aim;}document.getElementById("left").onclick=()=>choose("left");document.getElementById("right").onclick=()=>choose("right");',
          )
        }
      />
    </section>
  );
}
function RuleLab() {
  const [rows, setRows] = useState(5);
  const [gap, setGap] = useState(4);
  const seats = Array.from({ length: rows * 12 }, (_, i) => ({
    row: Math.floor(i / 12),
    col: i % 12,
    aisle: ((i % 12) + 1) % gap === 0,
  }));
  return (
    <section className="panel">
      <h2>Build a stadium with rules</h2>
      <p>
        A procedural layout is a set of instructions. Change one rule and
        inspect its effect.
      </p>
      <div className="form-grid">
        <label>
          Rows: {rows}
          <input
            type="range"
            min={2}
            max={8}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
          />
        </label>
        <label>
          Make every {gap}th column an aisle
          <input
            type="range"
            min={3}
            max={6}
            value={gap}
            onChange={(e) => setGap(Number(e.target.value))}
          />
        </label>
      </div>
      <div
        className="seat-map"
        aria-label={`${seats.filter((s) => !s.aisle).length} seats; white spaces are aisles`}
      >
        {seats.map((s, i) => (
          <span key={i} className={s.aisle ? "aisle" : ""} aria-hidden="true" />
        ))}
      </div>
      <p>
        <strong>{seats.filter((s) => !s.aisle).length} seats</strong> · 12
        columns · {rows} rows
      </p>
      <pre className="evidence">
        {
          "for each row:\n  for each column:\n    if column % aisleEvery === 0:\n      leave an aisle\n    else:\n      add a seat"
        }
      </pre>
      <p>
        Design question: How could you add a second rule to keep exits clear?
        More seats aren’t always the best design.
      </p>
      <LabSave
        name="My stadium rules"
        code={() =>
          labDocument(
            "Stadium rules",
            '<p>Edit the row and aisle rules in the code, then run again. Each empty space is an aisle.</p><div id="seats" style="display:grid;grid-template-columns:repeat(12,20px);gap:4px"></div><p id="count"></p>',
            `const rows=${rows}, aisleEvery=${gap};let count=0;for(let row=0;row<rows;row++){for(let col=1;col<=12;col++){const seat=document.createElement("div");seat.style.height="20px";if(col%aisleEvery!==0){seat.style.background="#006071";count++;}document.getElementById("seats").append(seat);}}document.getElementById("count").textContent=count+" seats. Check the exits before adding more.";`,
          )
        }
      />
    </section>
  );
}
function AnimationLab() {
  const [frames, setFrames] = useState(() =>
    Array.from({ length: 4 }, () => Array(64).fill(false) as boolean[]),
  );
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setFrame((n) => (n + 1) % 4), 350);
    return () => clearInterval(id);
  }, [playing]);
  return (
    <section className="panel">
      <h2>Make a four-frame animation</h2>
      <p>
        Draw a shape, then move it a little in the next frame. Play the sequence
        to see motion.
      </p>
      <div className="button-row">
        {frames.map((_, i) => (
          <Button
            key={i}
            variant={i === frame ? "primary" : "secondary"}
            disabled={playing}
            onClick={() => setFrame(i)}
          >
            Frame {i + 1}
          </Button>
        ))}
      </div>
      <div className="pixel-grid" aria-label={`Animation frame ${frame + 1}`}>
        {frames[frame].map((on, i) => (
          <button
            key={i}
            aria-label={`Pixel ${i + 1}`}
            aria-pressed={on}
            disabled={playing}
            className={on ? "painted" : ""}
            onClick={() =>
              setFrames((current) =>
                current.map((f, index) =>
                  index === frame
                    ? f.map((p, pixel) => (pixel === i ? !p : p))
                    : f,
                ),
              )
            }
          />
        ))}
      </div>
      <div className="button-row">
        <Button onClick={() => setPlaying(!playing)}>
          {playing ? "Stop animation" : "Play animation"}
        </Button>
        <Button
          variant="secondary"
          disabled={playing}
          onClick={() =>
            setFrames((current) =>
              current.map((f, i) =>
                i === (frame + 1) % 4 ? [...current[frame]] : f,
              ),
            )
          }
        >
          Copy to next frame
        </Button>
        <Button
          variant="quiet"
          disabled={playing}
          onClick={() =>
            setFrames((current) =>
              current.map((f, i) => (i === frame ? Array(64).fill(false) : f)),
            )
          }
        >
          Clear this frame
        </Button>
      </div>
      <LabSave
        name="My four-frame animation"
        code={() =>
          labDocument(
            "Four-frame animation",
            '<p>Your saved drawings are in the frames array. Change them to make the animation your own.</p><div id="grid" aria-label="Pixel animation"></div><button id="play">Play animation</button><button id="stop">Stop animation</button>',
            `const frames=${JSON.stringify(frames)};let frame=0,timer;function draw(){const grid=document.getElementById("grid");grid.replaceChildren();frames[frame].forEach(on=>{const square=document.createElement("div");square.className="pixel"+(on?" on":"");grid.append(square);});}document.getElementById("play").onclick=()=>{clearInterval(timer);timer=setInterval(()=>{frame=(frame+1)%frames.length;draw();},350);};document.getElementById("stop").onclick=()=>clearInterval(timer);draw();`,
          )
        }
      />
    </section>
  );
}
export default function Arcade() {
  const [lab, setLab] = useState("logic");
  return (
    <>
      <p className="muted">
        Short, local experiments rebuilt from the original camp games. They
        reset when you leave. Save lasting work in Project studio.
      </p>
      <Tabs
        options={[
          { id: "logic", label: "If-then soccer" },
          { id: "rules", label: "Stadium rules" },
          { id: "animation", label: "Pixel animation" },
        ]}
        value={lab}
        onChange={setLab}
      />
      {lab === "logic" ? (
        <LogicLab />
      ) : lab === "rules" ? (
        <RuleLab />
      ) : (
        <AnimationLab />
      )}
      <p className="notice">
        The old Prompt Power Shot now lives in{" "}
        <Link to="/dojo">AI practice</Link>, with transparent self-review
        instead of pretend AI scoring.
      </p>
    </>
  );
}
