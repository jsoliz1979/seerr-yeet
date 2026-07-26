import Slider from '@app/components/Slider';
import TmdbTitleCard from '@app/components/TitleCard/TmdbTitleCard';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import useSWR from 'swr';

interface RecentPlexLibrariesResponse {
  libraries: {
    id: string;
    name: string;
    items: {
      tmdbId: number;
      ratingKey: string;
      addedAt: number;
    }[];
  }[];
}

const PlexLibraryRows = () => {
  const { data, error } = useSWR<RecentPlexLibrariesResponse>(
    '/api/v1/service/plex/recent-libraries',
    { revalidateOnMount: true, errorRetryCount: 2 }
  );

  if (error) {
    return null;
  }

  if (data && data.libraries.every((library) => !library.items.length)) {
    return null;
  }

  if (!data) {
    return (
      <div className="mb-6 rounded-xl border border-gray-700/70 bg-gray-800/40 px-4 py-3 text-sm text-gray-400">
        Loading your New Movies and Old Movies libraries…
      </div>
    );
  }

  return (
    <>
      {data.libraries.map((library) =>
        library.items.length ? (
          <section key={library.id} className="mb-7">
            <div className="slider-header">
              <div className="slider-title">
                <span>Recently Added to {library.name}</span>
                <ArrowRightCircleIcon />
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  /old/i.test(library.name)
                    ? 'bg-amber-500/15 text-amber-200'
                    : 'bg-cyan-500/15 text-cyan-200'
                }`}
              >
                {library.name}
              </span>
            </div>
            <Slider
              sliderKey={`plex-library-${library.id}`}
              isLoading={false}
              items={library.items.map((item) => (
                <TmdbTitleCard
                  key={`${library.id}-${item.ratingKey}`}
                  id={item.tmdbId}
                  tmdbId={item.tmdbId}
                  type="movie"
                />
              ))}
            />
          </section>
        ) : null
      )}
    </>
  );
};

export default PlexLibraryRows;
