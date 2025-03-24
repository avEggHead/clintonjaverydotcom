import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Post from "./pages/Post";
import Books from "./pages/Books";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import styles from "./styles/layout.module.css";
import Writing from "./pages/Writing";

function App() {
  return (
    <Router>
      {/* ✅ Full-width background */}
      <Navbar />

      {/* ✅ Constrained content container */}
      <div className={styles.appContainer}>
        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/writing" element={<Writing />}/>
            <Route path="/writing/:slug" element={<Post />} />
            <Route path="/books" element={<Books />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
