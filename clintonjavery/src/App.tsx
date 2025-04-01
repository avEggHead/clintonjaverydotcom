import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Post from "./pages/Post";
import Reading from "./pages/Reading";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import styles from "./styles/layout.module.css";
import Writing from "./pages/Writing";
import Contribute from "./pages/Contribute";
import Tools from "./pages/Tools";
import TimeZoneConverter from "./tools/TimeZoneConverter";
import TextAnalyzer from "./tools/TextAnalyzer";

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
            <Route path="/reading" element={<Reading />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/tools/timezone" element={<TimeZoneConverter />} />  // placeholder
            <Route path="/tools/textanalyzer" element={<TextAnalyzer/>} />
            <Route path="/support" element={<Contribute />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
