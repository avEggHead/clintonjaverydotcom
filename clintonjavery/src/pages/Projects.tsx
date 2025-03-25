import styles from "../styles/layout.module.css";

export default function Projects() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageHeading}>Projects</h1>
      <p>Here are a few of the things I've built:</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        <div>
          <h2>
            <a href="https://www.theorhetorical.com" target="_blank" rel="noopener noreferrer">
              Theorhetorical.com
            </a>
          </h2>
          <p style={{ paddingRight: "2rem" }}>
            A digital garden of speculative science — exploring unconventional theories blending imagination and rational structure.
          </p>
          <p><strong>Tech Stack:</strong> HTML, CSS, JavaScript, Azure Storage, Static Website, Cloudflare</p>
        </div>

        <div>
          <h2>
            <a href="https://www.scrumsay.com" target="_blank" rel="noopener noreferrer">
              Scrumsay.com
            </a>
          </h2>
          <p style={{ paddingRight: "2rem" }}>
            An agile dev team tool built for effort estimation. Originally inspired by not being able to find a forever-free alternative.
          </p>
          <p><strong>Tech Stack:</strong> HTML, JavaScript, SignalR, Azure hosting</p>
        </div>
      </div>

      <div>
        <h2>Memorizer 5000</h2>
        <p style={{ paddingRight: "2rem" }}>
        A mobile app for memorizing passages of text through increasing fill-in-the-blank recall. Built using Unity and exported as an Android APK.
        </p>
        <p><strong>Tech Stack:</strong> Unity, C#</p>
        <a
          href="https://drive.usercontent.google.com/download?id=158zkcRdpwcsYAlOeIKOMcM_cgBdygt4j&export=download&authuser=0"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#0066cc", fontWeight: "bold" }}
        >
          Download APK via Google Drive
        </a>

        <div style={{ marginTop: "10px" }}>
          <p>Or scan to download:</p>
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://drive.usercontent.google.com/download?id=158zkcRdpwcsYAlOeIKOMcM_cgBdygt4j%26export=download%26authuser=0"
            alt="Download Memorizer 5000 APK"
            style={{ width: "150px", height: "150px" }}
          />
        </div>
      </div>

      <div>
          <h2>
            <a href="https://www.fitmetr.com" target="_blank" rel="noopener noreferrer">
              Fitmetr.com
            </a>
          </h2>
          <p style={{ paddingRight: "2rem" }}>
            A fitness accountability tool with live progress tracking. (Currently offline / archival only.)
          </p>
          <p><strong>Tech Stack:</strong> ASP.NET, RazorPages, AWS hosting</p>
        </div>


    </div>
  );
}
