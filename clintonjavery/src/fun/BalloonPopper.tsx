import { useEffect, useRef, useState } from "react";
import styles from "../styles/layout.module.css";

const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
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
    <div className={styles.pageContainer}>
      <h1 className={styles.heading}>🎈 Balloon Pop</h1>
      <p className={styles.pageSubtext}>
        Pop the <strong>{targetColor}</strong> balloons!
      </p>
      <p>Score: {score}</p>
      <button onClick={changeTarget} className={styles.toolButton}>Change Target Color</button>
      <div style={{ marginTop: "20px" }}>
        {balloons.map((color, index) => (
          <Balloon key={index} color={color} onClick={() => handlePop(color, index)} />
        ))}
      </div>
    </div>
  );
}
