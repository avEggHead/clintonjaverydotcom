import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <div className={styles.navbarWrapper}>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.navLink}>Clinton J Avery</Link>
        <div className={styles.navLinks}>
          <Link to="/projects" className={styles.navLink}>Projects</Link>
          <Link to="/writing" className={styles.navLink}>Writing</Link>
          <Link to="/books" className={styles.navLink}>Books</Link>
          <Link to="/gallery" className={styles.navLink}>Gallery</Link>
          <Link to="/about" className={styles.navLink}>About</Link>
        </div>
      </nav>
    </div>
  );
}
