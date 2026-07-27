import {
  BellAlertIcon,
  CheckCircleIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

const RELEASE_ID = '2026-07-user-experience';

const WhatsNew = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(
      window.localStorage.getItem('xmage-whats-new-seen') !== RELEASE_ID
    );
  }, []);

  const dismiss = () => {
    window.localStorage.setItem('xmage-whats-new-seen', RELEASE_ID);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative mb-4 rounded-xl border border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-950/25 to-purple-950/20 p-4">
      <button
        type="button"
        aria-label="Dismiss what's new"
        onClick={dismiss}
        className="absolute right-3 top-3 text-gray-400 hover:text-white"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2 font-bold text-white">
        <SparklesIcon className="h-5 w-5 text-fuchsia-300" />
        {'New on }{maGe'}
      </div>
      <div className="mt-3 grid gap-2 text-sm text-gray-300 sm:grid-cols-3">
        <div className="flex items-start gap-2">
          <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-300" />
          Clear request timelines and download progress
        </div>
        <div className="flex items-start gap-2">
          <BellAlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
          Easier ready notifications
        </div>
        <div className="flex items-start gap-2">
          <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-pink-300" />
          Help Me Choose and personal preferences
        </div>
      </div>
    </div>
  );
};

export default WhatsNew;
