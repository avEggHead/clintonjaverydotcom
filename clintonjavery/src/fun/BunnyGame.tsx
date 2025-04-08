import { useState, useEffect } from 'react';

export default function BunnyGame() {
  // State to track bunny's position, score, and game status
  const [bunnyPosition, setBunnyPosition] = useState<number>(200); // Vertical position
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [isDucking, setIsDucking] = useState<boolean>(false);

  // Basic jumping logic (increasing/decreasing position)
  useEffect(() => {
    let jumpTimer: number | null = null;
    if (isJumping) {
      jumpTimer = window.setInterval(() => {
        setBunnyPosition((prevPosition) => {
          if (prevPosition < 300) { // Jump upwards until max height
            return prevPosition + 20;
          }
          return prevPosition;
        });
      }, 50);

      // Reset jump after 250ms
      setTimeout(() => {
        setIsJumping(false);
      }, 250);
    } else {
      jumpTimer = window.setInterval(() => {
        setBunnyPosition((prevPosition) => {
          if (prevPosition > 200) { // Come down to normal position
            return prevPosition - 20;
          }
          return prevPosition;
        });
      }, 50);
    }

    // Clean up interval
    return () => {
      if (jumpTimer) {
        window.clearInterval(jumpTimer);
      }
    };
  }, [isJumping]);

  // Handle jump and duck button clicks
  const handleJump = () => {
    if (!isJumping) {
      setIsJumping(true);
      console.log('Jump button clicked');
    }
  };

  const handleDuck = () => {
    setIsDucking(true);
    console.log('Duck button clicked');
  };

  const handleDuckRelease = () => {
    setIsDucking(false);
    console.log('Duck button released');
  };

  // Game Over logic
  useEffect(() => {
    if (bunnyPosition < 50) {
      setGameOver(true);
    }
  }, [bunnyPosition]);

  return (
    <div className="game-container">
      <div className="score">Score: </div>
      <div
        className={`bunny ${isJumping ? 'jumping' : ''} ${isDucking ? 'ducking' : ''}`}
        style={{ bottom: `${bunnyPosition}px` }}
      >
        🐰
      </div>
      {gameOver && <div className="game-over">Game Over!</div>}

      {/* Jump and Duck Buttons */}
      <div className="buttons">
        <button
          className="jump-button"
          onClick={handleJump}
          style={{ position: 'absolute', left: '10%', bottom: '10px', padding: '20px 40px', fontSize: '20px' }}
        >
          Jump
        </button>
        <button
          className="duck-button"
          onMouseDown={handleDuck}
          onMouseUp={handleDuckRelease}
          style={{ position: 'absolute', right: '10%', bottom: '10px', padding: '20px 40px', fontSize: '20px' }}
        >
          Duck
        </button>
      </div>
    </div>
  );
}
