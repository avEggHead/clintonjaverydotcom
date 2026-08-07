// Minimal site footer landmark (AC5). The support-pill (UX-DR-15) lands in 1.8.
export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-6 text-sm text-on-surface-variant">
        © {new Date().getFullYear()} Clinton J Avery
      </div>
    </footer>
  );
}