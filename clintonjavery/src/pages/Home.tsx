import styles from "../styles/layout.module.css";

export default function Home() {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroOverlay}>
        <h1 className={styles.heroHeading}>Welcome</h1>
        <p className={styles.heroSubtext}>
          I make tools, write thoughts, and build fun things.
        </p>
        <a href="/projects" className={styles.heroButton}>
          Explore Projects →
        </a>
      </div>
    </div>
  );
}
