import { useEffect, useRef, useState } from 'react';

// Balloon Popper — re-skinned to Tailwind v4 + @theme tokens (Epic 4 / Story
// 4.2). Game behavior preserved from the v1 tool: a target color, one balloon
// spawns per second, popping a match scores +1 / a miss scores −1 (floored at
// 0), and a button swaps the target. The balloon COLORS are CSS named colours
// — they're GAME DATA (the target is a colour word the player matches), not
// design tokens, so they stay on an inline `style` (no hex; AD-6 is about the
// design system, not gameplay content). No CSS module, no own <h1>. AD-6.
import { buttonGhost } from '../site/buttons';

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function Balloon({ color, onClick }: { color: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Pop the ${color} balloon`}
      style={{ backgroundColor: color }}
      className="m-2.5 inline-block h-20 w-[60px] cursor-pointer rounded-full border border-black/10 shadow-sm transition-transform motion-safe:pointer-fine:hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    />
  );
}

export default function BalloonPopGame() {
  const [targetColor, setTargetColor] = useState(getRandomColor());
  const [balloons, setBalloons] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setBalloons((prev) => [...prev, getRandomColor()]);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handlePop = (color: string, index: number) => {
    setBalloons((prev) => prev.filter((_, i) => i !== index));
    if (color === targetColor) {
      setScore((s) => s + 1);
    } else {
      setScore((s) => Math.max(0, s - 1));
    }
  };

  const changeTarget = () => {
    setTargetColor(getRandomColor());
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="font-body text-body-md text-on-surface-variant">
        Pop the <strong className="text-ink">{targetColor}</strong> balloons!
      </p>
      <p className="font-body text-body-md text-ink">
        Score: <strong className="font-display text-headline-sm text-primary">{score}</strong>
      </p>
      <button type="button" onClick={changeTarget} className={buttonGhost}>
        Change target colour
      </button>
      <div className="mt-2 min-h-[100px] rounded-lg border border-outline-variant bg-surface-container-low p-3">
        {balloons.map((color, index) => (
          <Balloon key={index} color={color} onClick={() => handlePop(color, index)} />
        ))}
      </div>
    </div>
  );
}