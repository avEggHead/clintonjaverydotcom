import { useEffect, useRef, useState } from "react";
import styles from "../styles/layout.module.css";
import gameStyles from "../styles/game.module.css"

const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"];
let currentButtonColor = "";

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * (COLORS.length ))];
}

function getRandomButtonColor() {
  const colorsWithoutCurrent = COLORS.filter(color => color != currentButtonColor);
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
      setScore((s) => Math.max(0, s - 3));
    }
  };

  const changeTarget = () => {
    setTargetColor(getRandomButtonColor());
  };

  const maxBalloonLevel = 8; // You can change this number as needed
  // check for game-over condition
  if (balloons.length > maxBalloonLevel) {
    return (
      <div className={styles.pageContainer}>
        <h1 className={styles.heading}>🎈 Game Over 🎈</h1>
        <p>Final Score: {score}</p>
        <p>Final Level: </p>
        <button onClick={() => window.location.reload()} className={gameStyles.gameButton}>
          Play Again
        </button>
      </div>
    );
  }


  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.heading}>🎈 Balloon Pop</h1>
      <p>Score: {score}</p> <p>Level: </p>
      <button onClick={changeTarget} className={gameStyles.gameButton} style={{backgroundColor: targetColor}}>Change Target Color</button>
      <div style={{ marginTop: "20px" }}>
        
        {balloons.map((color, index) => (
          <Balloon key={index} color={color} onClick={() => handlePop(color, index)} />
        ))}
      </div>
    </div>
  );
}
