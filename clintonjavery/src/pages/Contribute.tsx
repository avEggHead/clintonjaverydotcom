import styles from "../styles/layout.module.css";

export default function Contribute() {
  return (
    <div className={styles.supportSection}>
      <p style={{ paddingRight: "2rem", paddingLeft: "2rem"}}>No ads, no paywalls, no algorithms.  Just the honor system.  Support what you value, and help keep this site going.</p>
      <a
        href="https://venmo.com/u/clintonjavery"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.venmoButton}
      >
        Contribute through Venmo
      </a>

      <div className={styles.qrContainer}>
        <img
          src="/assets/venmo_qr.png"
          alt="Venmo QR code"
          className={styles.qrImage}
        />
        <p className={styles.qrCaption}>Scan to contribute via Venmo</p>
      </div>
    </div>
  );
}
