import { useParams } from "react-router-dom";
import { posts } from "../data/posts";
import styles from "../styles/layout.module.css";

export default function Post() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) return <div className={styles.pageContainer}>Post not found.</div>;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageHeading}>{post.title}</h1>
      <p style={{ color: "#888" }}>{post.date}</p>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
        {post.content}
      </div>
    </div>
  );
}
