import styles from "../styles/layout.module.css";
import { FaGithub, FaLinkedin, FaFileAlt } from "react-icons/fa";

export default function About() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageHeading}>About Me</h1>
      <p className={styles.pageSubtext}>
      Hey, I’m Clinton Avery. This is my place to share my work, thoughts, and interests.
        I'm a husband, father, and software engineer, problem solver and builder of useful (and sometimes strange) things.
        I live in rural North Carolina on a homestead with my wife and kids, and a few chickens.  When I'm not 
        programming computers for work, I'm reading books, drawing, lifting weights, trying to play the piano, 
        or helping my wife with the homestead.      </p>

      <div style={{ marginTop: "40px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <a
          href="https://github.com/clintonavery"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.buttonLink}
        >
          <FaGithub style={{ marginRight: "8px" }} />
          GitHub
        </a>

        <a
          href="https://www.linkedin.com/in/clintonavery"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.buttonLink}
        >
          <FaLinkedin style={{ marginRight: "8px" }} />
          LinkedIn
        </a>

        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.buttonLink}
        >
          <FaFileAlt style={{ marginRight: "8px" }} />
          Résumé
        </a>
      </div>
    </div>
  );
}
