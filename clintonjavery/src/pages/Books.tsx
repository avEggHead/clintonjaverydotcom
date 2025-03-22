import styles from "../styles/layout.module.css"; 

export default function Books() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.heading}>Books & Media</h1>
      <div className={styles.bookList}>
        <div className={styles.book}>
          <h2 className={styles.bookTitle}>The Peripheral - William Gibson</h2>
          <p>A cyberpunk novel exploring time travel and alternate realities.</p>
        </div>
      </div>
    </div>
  );
}
