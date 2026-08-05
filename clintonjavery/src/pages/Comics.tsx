import styles from "../styles/layout.module.css"

export default function Comics() {
    return (
      <div className={styles.pageContainer}>
        <h1 className={styles.heading}>Comics</h1>
        <p className={styles.pageSubtext}>
          A collection of my comic strips and illustrations. Stay tuned for updates!
        </p>
      </div>
    );
}
