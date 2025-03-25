import styles from "../styles/layout.module.css"; 

export default function Home() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageHeading}>Welcome</h1>
      <p style={{ paddingRight: "2rem" }}>
        A personal site to showcase my work, thoughts, and projects.
      </p>
    </div>
  );
}
