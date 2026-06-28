import { useEffect, useRef, useState } from "react";
import styles from "../styles/layout.module.css";
import gameStyles from "../styles/game.module.css"

const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function getRandomButtonColor(current: string): string {
  const remainingColors = COLORS.filter(color => color !== current);
  
  if (remainingColors.length === 0) {
    // Fall back to random if somehow all colors are used (shouldn't happen with proper logic)
    return getRandomColor();
  }
  
  const randomIndex = Math.floor(Math.random() * remainingColors.length);
  return remainingColors[randomIndex];
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
        transition: "transform 0.2s ease",
      }}
    ></div>
  );
}

export default function BalloonPopGameV2() {
  const [targetColor, setTargetColor] = useState(getRandomColor);
  const [balloons, setBalloons] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // Change target color only at start (when score is 0)
  useEffect(() => {
    if (targetColor().value === "") {
      // Initial render - pick the first color as target
      setTargetColor(getRandomButtonColor("");
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [score]);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handlePop = (color: string, index: number) => {
    
    if (color === targetColor()) {
      
      score + 1;
      
    } else {
      setScore((s) => Math.max(0, s - 3));
    }
  };

  const changeTarget = () => {
    setTargetColor(getRandomButtonColor(targetColor().value));
  };

  let currentButtonColor = "";

  useEffect(() => {
    if (balloons.length === 0) {
      currentButtonColor = getRandomButtonColor("");
      
      setScore((s) => s + 1);
    }
  
  

  

  

  

  

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