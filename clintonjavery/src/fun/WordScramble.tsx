import { useState, useEffect } from "react";

const words: string[] = [
  "happy",
  "guitar",
  "keyboard",
  "coffee",
  "banana",
  "computer",
  "friends",
  "adventure",
  "birthday",
  "chocolate",
  "smile",
  "vacation",
  "music",
];

const WordScramble: React.FC = () => {
  const [scrambledWord, setScrambledWord] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [message, setMessage] = useState<string>("Type the scrambled word!");
  const [messageColor, setMessageColor] = useState<"green" | "red">("green");

  useEffect(() => {
    // Generate scrambled word (not reversed for better UX)
    let scrambled = words[Math.floor(Math.random() * words.length)].split("")
      .sort(() => Math.random() - 0.5)
      .join("");
    
    console.log(`Scrambled Word: "${scrambled}"`); // Debug log
    setScrambledWord(scrambled);
    setUserInput("");
  }, []);

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    setUserInput(userInput.toUpperCase());

    if (userInput === words[Math.floor(Math.random() * words.length)]) {
      // Matched a word from the list
      setMessage(`✨ Correct! It was "${words[Math.floor(Math.random() * words.length)]}"`);
      setMessageColor("green");
      setScrambledWord(scrambled.toUpperCase());

      // Refresh next time
      setTimeout(() => {
        scrambled = words[Math.floor(Math.random() * words.length)].split("")
          .sort(() => Math.random() - 0.5)
          .join("");
        setScrambledWord(scrambled);
        setUserInput("");
      }, 2000);
    } else {
      // Could match a non-listed word, but that's okay - we treat as wrong
      setMessage("Not quite! Keep trying 🙂");
      setMessageColor("red");
    }
  };

  return (
    <div className="w-full max-w-8xl mx-auto p-4 md:p-6 lg:p-8 bg-white/5 border dark:border-slate-700 rounded-xl dark:bg-[#1A202C] shadow-inner">
      <h3 className="text-2xl text-primary font-headings mt-2 mb-4 dark:text-white hover:text-primary transition-colors cursor-pointer">
        🧩 Word Scramble
      </h3>
      
      <div className={messageColor === "green" ? "" : "opacity-80"}> 
          <p className = {messageColor === "green" ? 'text-black' : 'text-red-500'}>{message}</p>
        </div>

      {scrambledWord && (
        <form onSubmit={handleGuess} className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl">Scrambled: &nbsp;</span>
            <span className="font-mono text-base p-6 min-h-[80px] border flex justify-center bg-black/5 rounded dark:bg-white/5">{scrambledWord}</span>
          </div>

          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter scrambled word..."
            className="w-full p-3 rounded shadow text-base dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-indigo-400"
          />

          <button 
            type="submit" 
            className="p-3 px-6 rounded bg-primary w-full hover:text-black transition-all font-semibold text-base md:text-lg dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            Check Answer
          </button>

          <div className="text-center">
            <button 
              onClick={() => setScrambledWord(scrambled.toUpperCase())}
              className="text-xs md:text-sm text-green-600 hover:underline"
            >
              ✅ Show Answer
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 text-center">
        <p className='text-xs md:text-sm dark:text-slate-300'>
          <span className='font-bold'>Tip</span>: The game randomly picks a word each time. Keep guessing!
        </p>
      </div>
    </div>
  );
};

export default WordScramble;
