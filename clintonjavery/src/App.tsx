import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import SiteFooter from './components/SiteFooter';
import SkipLink from './components/SkipLink';
import LandingPlaceholder from './pages/LandingPlaceholder';
import Feed from './pages/Feed';
import PostPage from './pages/PostPage';
import ProjectsPlaceholder from './pages/ProjectsPlaceholder';
import ProjectShowPlaceholder from './pages/ProjectShowPlaceholder';

// Route shell (ARCHITECTURE-SPINE AD-5 / AC1). Fixed routes: `/`, `/p`,
// `/projects`, `/projects/:slug`; dynamic `/p/:slug` is content-derived (the
// component looks the slug up in the content-index — no hand-registered route).
// All in-app nav uses RR <Link>/<NavLink> (FR-14 / AC2). Tailwind v4 + @theme
// tokens only (AD-6) — no CSS Modules, no inline hex.
//
// TopNav renders its own <header> (the sticky + landmark element). Do NOT wrap
// it in another <header> — a wrapper exactly nav-height makes `sticky top-0`
// scroll away once you pass that height (the containing block is too short).

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <SkipLink />
        <TopNav />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <Routes>
            <Route path="/" element={<LandingPlaceholder />} />
            <Route path="/p" element={<Feed />} />
            <Route path="/p/:slug" element={<PostPage />} />
            <Route path="/projects" element={<ProjectsPlaceholder />} />
            <Route path="/projects/:slug" element={<ProjectShowPlaceholder />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}

export default App;