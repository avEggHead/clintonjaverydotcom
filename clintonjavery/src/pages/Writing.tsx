import styles from "../styles/layout.module.css"; 

export default function Writing() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.heading}>Writing</h1>
      <p className={styles.description}>
        A collection of my professional, personal, and philosophical writings.
      </p>
    </div>
  );
}
