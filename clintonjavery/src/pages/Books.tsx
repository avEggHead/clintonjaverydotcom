import styles from "../styles/layout.module.css";

type Book = {
  title: string;
  author: string;
  status: "reading" | "finished";
  blurb: string;
  date: string;
};

const books: Book[] = [
  {
    title: "The Peripheral",
    author: "William Gibson",
    status: "finished",
    date: "2016",
    blurb: "A fascinating blend of time travel and digital realism. Felt both dense and eerily plausible. Made me think differently about how tech reshapes identity.",
  },
  {
    title: "Legion",
    author: "Brandon Sanderson",
    status: "finished",
    date: "February 2024",
    blurb: "Short, sharp, clever. Loved the psychological twist on multiple personalities. Easy to read but left a lingering impression.",
  },
  {
    title: "The Garden of Eden",
    author: "Ernest Hemingway",
    status: "finished",
    date: "March 2025",
    blurb: "A strange book about the",
  },
];

export default function Books() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageHeading}>Bookshelf</h1>
      <p className={styles.pageSubtext}>
        A record of what I’ve been reading and what I’ve taken away from it.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        {books.map((book, idx) => (
          <div key={idx}>
            <h2>{book.title}</h2>
            <p><em>by {book.author}</em> — <strong>{book.status}</strong> <span style={{ color: "#888" }}>({book.date})</span></p>
            <p>{book.blurb}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
