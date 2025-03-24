import styles from "../styles/layout.module.css";

export default function Projects() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageHeading}>Projects</h1>
      <p className={styles.pageSubtext}>Here are a few of the things I've built:</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        <div>
          <h2>
            <a href="https://www.theorhetorical.com" target="_blank" rel="noopener noreferrer">
              Theorhetorical.com
            </a>
          </h2>
          <p>
            A digital garden of speculative science — exploring unconventional theories blending imagination and rational structure.
          </p>
          <p><strong>Tech Stack:</strong> HTML, CSS, JavaScript, Azure Storage, Static Website</p>
        </div>

        <div>
          <h2>
            <a href="https://www.fitmetr.com" target="_blank" rel="noopener noreferrer">
              Fitmetr.com
            </a>
          </h2>
          <p>
            A fitness accountability tool with a social challenge system and live progress tracking. (Currently offline / archival only.)
          </p>
          <p><strong>Tech Stack:</strong> ASP.NET, RazorPages, AWS hosting</p>
        </div>

        <div>
          <h2>
            <a href="https://www.scrumsay.com" target="_blank" rel="noopener noreferrer">
              Scrumsay.com
            </a>
          </h2>
          <p>
            A productivity and team communication tool built around fast, structured daily check-ins. Originally inspired by agile standups.
          </p>
          <p><strong>Tech Stack:</strong> HTML, JavaScript, SignalR, Azure hosting</p>
        </div>
      </div>
    </div>
  );
}
