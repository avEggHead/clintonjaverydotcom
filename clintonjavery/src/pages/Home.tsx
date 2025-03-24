import styles from "../styles/layout.module.css"; 

export default function Home() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.heading}>Welcome to My Site</h1>
      <p className={styles.subtext}>
        A personal site to showcase my work, thoughts, and projects.
      </p>
    </div>
  );
}
