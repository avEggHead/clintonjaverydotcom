import { posts } from "../data/posts";
import styles from "../styles/layout.module.css";
import { Link } from "react-router-dom";
import { useState } from 'react';

export default function Writing() {

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf()
  );
  const PAGE_SIZE = 5;                  // how many posts per “page”
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(sortedPosts.length / PAGE_SIZE);
  const startIdx   = (currentPage - 1) * PAGE_SIZE;
  const displayedPosts = sortedPosts.slice(startIdx, startIdx + PAGE_SIZE);

  return (
  <div className={styles.pageContainer}>
    <h1 className={styles.pageHeading}>Writing</h1>
    <p style={{ paddingRight: '2rem' }}>
      Essays, reflections, and thoughts in progress.
    </p>
<div className={styles.pagination}>
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
      >
        ← Previous
      </button>

      <span className={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
      >
        Next →
      </button>
    </div>
    {/* --- Posts list ------------------------------------------------- */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {displayedPosts.map((post) => (
        <div key={post.slug}>
          <h2>
            <Link to={`/writing/${post.slug}`}>{post.title}</Link>
          </h2>
          <p style={{ color: '#888' }}>{post.date}</p>
          <p style={{ paddingRight: '2rem' }}>{post.preview}</p>
          <Link
            to={`/writing/${post.slug}`}
            style={{ color: '#0066cc' }}
          >
            Read more →
          </Link>
        </div>
      ))}
    </div>
      <div>
        <br></br><br></br>
      </div>
    {/* --- Pagination controls ---------------------------------------- */}
    
  </div>
);
}
