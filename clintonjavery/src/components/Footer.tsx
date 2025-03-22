import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <p>&copy; {new Date().getFullYear()} Clinton Avery. All rights reserved.</p>
      </div>
    </footer>
  );
}
