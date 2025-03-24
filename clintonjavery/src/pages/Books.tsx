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
    title: "Blackwater",
    author: "Jeremy Scahill",
    status: "reading",
    date: "2024",
    blurb: "A no holds barred exposition of a defense contracting company that gained notoriety (and infamy) during the Iraq War.",
  },
  {
    title: "Antifragile",
    author: "Nassim Nicholas Taleb",
    status: "reading",
    date: "2024",
    blurb: "The central idea being explored here is that there is a category of things that get better from disorder.",
  },
  {
    title: "The Peripheral",
    author: "William Gibson",
    status: "finished",
    date: "2016",
    blurb: "Strap in for an excellent sci-fi thriller in a post/pre-apocalyptic setting.  The action sequences keep you on the edge of your comfy reading couch, and the premise is a truly unique blend of time travel and uploaded consciouness.  It's Back to the Future meets The Matrix.",
  },
  {
    title: "Legion",
    author: "Brandon Sanderson",
    status: "finished",
    date: "February 2024",
    blurb: "Wonderful sci-fi exploration of what constitutes mental illness.  The tension between the longing for normalcy and the desire for power is artfully dealt with by Sanderson.",
  },
  {
    title: "The Garden of Eden",
    author: "Ernest Hemingway",
    status: "finished",
    date: "March 2025",
    blurb: "A strange book about the collapse of a relationship when the bonds of tradition and culture are difficult to navigate for a couple seemingly on a permanent vacation in a foreign paradise.",
  },
  {
    title: "Code Complete",
    author: "Steve McConnell",
    status: "reading",
    date: "2023",
    blurb: "A comprehensive guide that, though somewhat dated, still has much to offer to programmers who are interested in constructing high quality software.",
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
