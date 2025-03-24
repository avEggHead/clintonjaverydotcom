import styles from "../styles/layout.module.css"; 

export default function About() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.heading}>About Me</h1>
      <p className={styles.bio}>s
        Hey, I’m Clinton Avery. This is my place to share my work, thoughts, and interests.
        I'm a husband, father, and software engineer.  I live in rural North Carolina on a homestead with
        my wife and kids, and a few chickens.  When I'm not programming computers for work, I'm reading books, 
        lifting weights, trying to play the piano, or helping my wife with the homestead.
      </p>
    </div>
  );
}
