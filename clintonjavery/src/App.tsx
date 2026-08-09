import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import SiteFooter from './components/SiteFooter';
import SkipLink from './components/SkipLink';
import ScrollToTop from './components/ScrollToTop';
import Landing from './pages/Landing';
import Feed from './pages/Feed';
import PostPage from './pages/PostPage';
import Projects from './pages/Projects';
import ProjectShowPlaceholder from './pages/ProjectShowPlaceholder';
import NotFoundPage from './pages/NotFoundPage';

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
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <SkipLink />
        <TopNav />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/p" element={<Feed />} />
            <Route path="/p/:slug" element={<PostPage />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectShowPlaceholder />} />
            {/* Catch-all — unmatched paths render the on-brand NotFound (Story 2.3)
                with a noindex <head>, instead of a blank page (RR7 has no built-in 404). */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}

export default App;