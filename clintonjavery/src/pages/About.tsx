import { useState } from "react";
import styles from "../styles/layout.module.css";
import { FaGithub, FaLinkedin, FaFileAlt, FaEnvelope, FaClipboard } from "react-icons/fa";

export default function About() {
  const [showModal, setShowModal] = useState(false);
  const email = "clintonjavery@gmail.com";

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    alert("Email copied to clipboard!");
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageHeading}>About Me</h1>
      <p style={{ paddingRight: "2rem" }}>
        Hey, I’m Clinton Avery. This is my place to share my work, thoughts, and interests.
        I'm a husband, father, software engineer, problem solver, and builder of useful (and sometimes strange) things.
        I live in rural North Carolina on a homestead with my wife and kids, and a few chickens. When I'm not 
        programming computers for work, I'm reading books, drawing, lifting weights, trying to play the piano, 
        or helping my wife with the homestead.
      </p>

      <div style={{ marginTop: "40px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <a href="https://github.com/avEggHead" target="_blank" rel="noopener noreferrer" className={styles.buttonLink}>
          <FaGithub style={{ marginRight: "8px" }} />
          GitHub
        </a>

        <a href="https://www.linkedin.com/in/clinton-avery-593337160/" target="_blank" rel="noopener noreferrer" className={styles.buttonLink}>
          <FaLinkedin style={{ marginRight: "8px" }} />
          LinkedIn
        </a>

        <a 
          href="https://drive.google.com/file/d/1k1OKc1QGhM4KIJ770nHHB2OXDnMXs19-/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.buttonLink}
        >
          <FaFileAlt style={{ marginRight: "8px" }} />
          Résumé
        </a>


        <button className={styles.buttonLink} onClick={() => setShowModal(true)}>
          <FaEnvelope style={{ marginRight: "8px" }} />
          Email
        </button>
      </div>

      {showModal && (
  <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
      <button className={styles.closeButton} onClick={() => setShowModal(false)}>
        &times;
      </button>
      <p style={{color: "white"}}> .</p>
      <p className={styles.emailText}>Email: <strong>{email}</strong></p>
      <button className={styles.buttonLink} onClick={copyEmail}>
        <FaClipboard style={{ marginRight: "8px" }} />
        Copy to Clipboard
      </button>
    </div>
  </div>
)}

    </div>
  );
}
