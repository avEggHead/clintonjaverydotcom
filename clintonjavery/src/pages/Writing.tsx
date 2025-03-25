import { posts } from "../data/posts";
import styles from "../styles/layout.module.css";
import { Link } from "react-router-dom";

export default function Writing() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageHeading}>Writing</h1>
      <p style={{ paddingRight: "2rem" }}>Essays, reflections, and thoughts in progress.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        {posts.map((post) => (
          <div key={post.slug}>
            <h2>
              <Link to={`/writing/${post.slug}`}>{post.title}</Link>
            </h2>
            <p style={{ color: "#888" }}>{post.date}</p>
            <p style={{ paddingRight: "2rem" }}>{post.preview}</p>
            <Link to={`/writing/${post.slug}`} style={{ color: "#0066cc"}}>
              Read more →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
