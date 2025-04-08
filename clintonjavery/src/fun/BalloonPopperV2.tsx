import { useEffect, useRef, useState } from "react";
import styles from "../styles/layout.module.css";
import gameStyles from "../styles/game.module.css";

const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"];
let currentButtonColor = "";

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function getRandomButtonColor() {
  const colorsWithoutCurrent = COLORS.filter(color => color !== currentButtonColor);
  currentButtonColor = colorsWithoutCurrent[Math.floor(Math.random() * (COLORS.length - 1))];
  return currentButtonColor;
}

function Balloon({ color, onClick }: { color: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: color,
        width: "60px",
        height: "80px",
        borderRadius: "50%",
        margin: "10px",
        display: "inline-block",
        cursor: "pointer",
      }}
    ></div>
  );
}

export default function BalloonPopGameV2() {
  const [targetColor, setTargetColor] = useState(getRandomColor());
  const [balloons, setBalloons] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [poppedBalloons, setPoppedBalloons] = useState(0); // Track the number of popped balloons
  const intervalRef = useRef<number | null>(null);

  const maxBalloonLevel = 100; // Fixed max balloons before game over
  const initialSpawnRate = 3000; // Start with 1 balloon every 3 seconds (3000 ms)
  const minSpawnRate = 250; // Minimum spawn rate of 0.5 seconds
  const spawnRateDecreaseInterval = 3; // Every 10 popped balloons, decrease spawn rate

  // Calculate spawn rate based on number of popped balloons
  const spawnRate = Math.max(
    initialSpawnRate - Math.floor(poppedBalloons / spawnRateDecreaseInterval) * 250,
    minSpawnRate
  );

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setBalloons((prev) => [...prev, getRandomColor()]);
    }, spawnRate);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [spawnRate]); // Re-run effect whenever spawnRate changes

  const handlePop = (color: string, index: number) => {
    setBalloons((prev) => prev.filter((_, i) => i !== index));
    if (color === targetColor) {
      setScore((s) => s + 1);
    } else {
      setScore((s) => Math.max(0, s - 3));
    }
    setPoppedBalloons((prev) => prev + 1); // Increment the popped balloons counter
  };

  const changeTarget = () => {
    setTargetColor(getRandomButtonColor());
  };

  // Check for game-over condition if number of balloons exceeds maxBalloonLevel
  if (balloons.length > maxBalloonLevel) {
    return (
      <div className={styles.pageContainer}>
        <h1 className={styles.heading}>🎈 Game Over 🎈</h1>
        <p>Final Score: {score}</p>
        <button onClick={() => window.location.reload()} className={gameStyles.gameButton}>
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.heading}>🎈 Balloon Pop</h1>
      {/* Balloon count indicator */}
      <p>Balloon Count: {balloons.length} / {maxBalloonLevel}</p>
      <p>Score: {score}</p>
      <p>Popped Balloons: {poppedBalloons}</p> {/* Display popped balloons */}
      <p>Spawn Rate: {spawnRate / 1000} seconds per balloon</p> {/* Display spawn rate */}
      <button onClick={changeTarget} className={gameStyles.gameButton} style={{ backgroundColor: targetColor }}>
        Change Target Color
      </button>
      <div style={{ marginTop: "20px" }}>
        {balloons.map((color, index) => (
          <Balloon key={index} color={color} onClick={() => handlePop(color, index)} />
        ))}
      </div>
    </div>
  );
}
