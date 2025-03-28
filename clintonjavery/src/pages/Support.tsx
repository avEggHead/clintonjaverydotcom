import styles from "../styles/layout.module.css";

export default function Support() {
  return (
    <div className={styles.supportSection}>
      <p style={{ paddingRight: "2rem", paddingLeft: "2rem"}}>If you like what I'm up to, please support me with a coffee ☕</p>
      <a
        href="https://venmo.com/u/clintonjavery"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.venmoButton}
      >
        Buy Me a Coffee on Venmo
      </a>

      <div className={styles.qrContainer}>
        <img
          src="/assets/venmo_qr.png"
          alt="Venmo QR code"
          className={styles.qrImage}
        />
        <p className={styles.qrCaption}>Scan to support me on Venmo</p>
      </div>
    </div>
  );
}
