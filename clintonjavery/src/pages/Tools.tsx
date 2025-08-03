import styles from "../styles/layout.module.css";
import { Link } from "react-router-dom";

export default function Tools() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.heading}>Tools</h1>
      <p className={styles.pageSubtext}>
        A growing collection of helpful dev utilities, all built with care and no backend.
      </p>

      <div className={styles.toolsGrid}>
        <div className={styles.toolCard}>
          <h3>🕰️ Time Zone Converter</h3>
          <p>Convert time between zones in a single click.</p>
          <Link to="/tools/timezone" className={styles.toolButton}>
            Try it →
          </Link>
        </div>

        <div className={styles.toolCard}>
          <h3>📝 Text Analyzer</h3>
          <p>Get real-time counts for your writing.</p>
          <Link to="/tools/textanalyzer" className={styles.toolButton}>
            Try it →
          </Link>
        </div>

        <div className={styles.toolCard}>
          <h3>📝 Effort Estimator</h3>
          <p>Help yourself consider the effort of a work item.</p>
          <Link to="/tools/effortestimator" className={styles.toolButton}>
            Try it →
          </Link>
        </div>
        {/* More tools coming soon */}
      </div>
    </div>
  );
}
