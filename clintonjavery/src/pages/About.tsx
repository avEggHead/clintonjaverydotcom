import styles from "../styles/layout.module.css"; 

export default function About() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.heading}>About Me</h1>
      <p className={styles.bio}>
        Hey, I’m Clinton Avery. This is my place to share my work, thoughts, and interests.
      </p>
    </div>
  );
}
