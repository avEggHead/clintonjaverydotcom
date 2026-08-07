// `/projects` — placeholder for the Projects surface (Epic 4: entries + live demos).
export default function ProjectsPlaceholder() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-16">
      <h1 className="font-display text-2xl text-ink sm:text-3xl">Projects</h1>
      <p className="mt-4 max-w-prose font-body text-base leading-relaxed text-on-surface-variant">
        The projects index &mdash; entries with live demos, source, and tech
        stack &mdash; arrives in Epic 4.
      </p>
    </div>
  );
}