import styles from "../styles/layout.module.css"
import { Link } from "react-router-dom";
import WordScramble from "../fun/WordScramble";

export default function Fun() {
    return (
      <div className={styles.pageContainer}>
        <h1 className={styles.heading}>🎉 Fun Zone</h1>
        <p className={styles.pageSubtext}>
          Little games, puzzles, and experiments I made — mostly just because I could.
        </p>
  
        <div className={styles.toolsGrid}>
          <div className={styles.toolCard}>
            <h3>🧠 Balloon Pop</h3>
            <p>Pop the balloons and beat your best score!</p>
            <Link to="/fun/balloon-popper" className={styles.toolButton}>
              Play →
            </Link>
          </div>

          <div className={styles.toolCard}>
            <h3>🎈 Balloon Pop Version 2</h3>
            <p>Pop the balloons and beat your best score! I'm iterating but saving past versions; send feedback if there are changes you like, dislike, or want.</p>
            <Link to="/fun/balloon-popperv2" className={styles.toolButton}>
              Play →
            </Link>
          </div>

          <div className={styles.toolCard}>
            <h3>🧩 Word Scramble</h3>
            <p>Unscramble the letters before time runs out.</p>
            <WordScramble />
          </div>
        </div>
      </div>
    );
  }
