import { useState } from "react";
import styles from "../styles/layout.module.css"; // or your custom tools.module.css

export default function WordCharCounter() {
  const [text, setText] = useState("");

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, "").length;
  const whiteSpaceCount = charCount - charCountNoSpaces;
  const lineCount = text.split(/\n/).length;
  const punctuationCount = (text.match(/[.,/#!$%^&*;:{}=\-_`~()"'?]/g) || []).length;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.heading}>📝 Text Analyzer</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        cols={80}
        placeholder="Type or paste your text here..."
        className={styles.textArea}
      />

      <div className={styles.resultBox}>
        <p><strong>Words:</strong> {wordCount}</p>
        <p><strong>Characters (including spaces):</strong> {charCount}</p>
        <p><strong>Characters (excluding spaces):</strong> {charCountNoSpaces}</p>
        <p><strong>Spaces:</strong> {whiteSpaceCount}</p>
        <p><strong>Lines:</strong> {lineCount}</p>
        <p><strong>Punctuation:</strong> {punctuationCount}</p>
      </div>
    </div>
  );
}
