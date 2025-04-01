import { useState } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className={styles.navbarWrapper}>
      <nav className={styles.navbar}>
        <a href="/" className={styles.navLink}>Clinton Avery</a>

        <button className={styles.hamburger} onClick={toggleMenu}>
          ☰
        </button>

        <div className={`${styles.navLinks} ${isOpen ? styles.open : ""}`}>
          <a href="/projects" className={styles.navLink}>Projects</a>
          <a href="/writing" className={styles.navLink}>Writing</a>
          <a href="/reading" className={styles.navLink}>Reading</a>
          <a href="/gallery" className={styles.navLink}>Gallery</a>
          <a href="/fun" className={styles.navLink}>Fun</a>
          <a href="/tools" className={styles.navLink}>Tools</a>
          <a href="/support" className={styles.contributeLink}>Contribute</a>
          <a href="/about" className={styles.navLink}>About</a>
        </div>
      </nav>
    </div>
  );
}
