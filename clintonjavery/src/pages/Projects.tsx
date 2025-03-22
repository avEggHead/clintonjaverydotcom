import styles from "../styles/layout.module.css"; 

export default function Projects() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.heading}>Projects</h1>
      <p className={styles.description}>A list of my current and past projects.</p>
    </div>
  );
}
