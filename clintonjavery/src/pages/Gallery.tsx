import styles from "../styles/layout.module.css"; 

export default function Gallery() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.heading}>Gallery</h1>
      <div className={styles.galleryGrid}>
        <div className={styles.imageCard}>
          <img src="https://via.placeholder.com/200" alt="Artwork 1" className={styles.image} />
        </div>
      </div>
    </div>
  );
}
