import { useParams } from 'react-router-dom';

// `/projects/:slug` — placeholder for a single live-tool project (Epic 4).
export default function ProjectShowPlaceholder() {
  const { slug } = useParams();
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-16">
      <h1 className="font-display text-2xl text-ink sm:text-3xl">
        {slug ?? 'Project'}
      </h1>
      <p className="mt-4 font-body text-base text-on-surface-variant">
        The live-tool project page arrives in Epic 4.
      </p>
    </div>
  );
}