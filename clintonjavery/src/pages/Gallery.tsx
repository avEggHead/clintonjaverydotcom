import { useState } from "react";
import styles from "../styles/layout.module.css";
import { galleryImages } from "../data/gallery";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<null | typeof galleryImages[0]>(null);

  const closeModal = () => setSelectedImage(null);

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageHeading}>Gallery</h1>

      <div className={styles.galleryGrid}>
        {galleryImages.map((image, index) => (
          <div key={index} className={styles.imageCard} onClick={() => setSelectedImage(image)}>
            <img src={image.src} alt={image.alt} className={styles.image} />
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.src} alt={selectedImage.alt} className={styles.fullImage} />
            <p>{selectedImage.alt}</p>
            <button onClick={closeModal} className={styles.closeButton}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}
