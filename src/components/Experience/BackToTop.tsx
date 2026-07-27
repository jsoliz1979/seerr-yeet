import { ArrowUpIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 700);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/40 bg-gray-800/95 text-cyan-200 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300 hover:text-white sm:bottom-6 sm:right-6"
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
};

export default BackToTop;
