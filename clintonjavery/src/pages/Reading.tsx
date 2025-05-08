import styles from "../styles/layout.module.css";

type Book = {
  title: string;
  author: string;
  status: "reading" | "finished" | "want to read";
  blurb: string;
  date: string;
};

const books: Book[] = [
  {
    title: "To Kill A Mockingbird",
    author: "Harper Lee",
    status: "finished",
    date: "2025",
    blurb: "A story that is at once tragic, harrowing, and hopeful.  Narrated by a young girl in the south in the 1930's you get what feels like a real description of a life, a small town, its people and its problems.  I can't even describe how well written this book is.",
  },
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
    title: "An Indigenous Peoples History of the United States",
    author: "Roxanne Dunbar-Ortiz",
    status: "finished",
    date: "2025",
    blurb: "An important and often overlooked perspective on the history of the United States.  The emphasis here is placed on the dreadful impact that colonialism had on the native population of the American Continents.",
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
    blurb: "A strange book about the collapse of a relationship when the bonds of tradition and culture are difficult to navigate for a couple seemingly on a permanent vacation in a foreign paradise.  I can't say that I liked this book, but after reading it I can see why people say Hemingway is a great writer.",
  },
  {
    title: "Code Complete",
    author: "Steve McConnell",
    status: "reading",
    date: "2023",
    blurb: "A comprehensive guide that, though somewhat dated, still has much to offer to programmers who are interested in constructing high quality software.",
  },
  {
    title: "Things Fall Apart",
    author: "Chinua Achebe",
    status: "finished",
    date: "2025",
    blurb: "A story about a man who's life is changed by forces beyond his control.  In many ways an unsympathetic character, in other ways highly relatable; a very human story.",
  },
  {
    title: "Childhood's End",
    author: "Arthur C. Clarke",
    status: "want to read",
    date: "--",
    blurb: "A colleague mentioned that I might like this one after I said offhand that I welcome our Robot Overlords.",
  },
];

export default function Reading() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageHeading}>Bookshelf</h1>
      <p style={{ paddingRight: "2rem" }}>
        A record of what I’ve been reading and what I’ve taken away from it.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        {books.map((book, idx) => (
          <div key={idx}>
            <h2>{book.title}</h2>
            <p><em>by {book.author}</em> — <strong>{book.status}</strong> <span style={{ color: "#888" }}>({book.date})</span></p>
            <p style={{ paddingRight: "2rem" }}>{book.blurb}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
