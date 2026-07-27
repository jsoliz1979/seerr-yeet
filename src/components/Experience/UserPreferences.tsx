import Button from '@app/components/Common/Button';
import PageTitle from '@app/components/Common/PageTitle';
import useXmagePreferences, {
  type XmagePreferences,
} from '@app/hooks/useXmagePreferences';
import {
  CheckCircleIcon,
  HeartIcon,
  NoSymbolIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

const genres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
];

const toggleId = (items: number[], id: number) =>
  items.includes(id) ? items.filter((item) => item !== id) : [...items, id];

const UserPreferences = () => {
  const { preferences, setPreferences, loaded } = useXmagePreferences();
  const [draft, setDraft] = useState<XmagePreferences>(preferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (loaded) setDraft(preferences);
  }, [loaded, preferences]);

  const save = () => {
    setPreferences(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <PageTitle title="Discovery Preferences" />
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-2xl border border-purple-500/25 bg-gradient-to-br from-gray-800 to-purple-950/30 p-6">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
            <SparklesIcon className="h-8 w-8 text-purple-300" />
            Make discovery feel like yours
          </h1>
          <p className="mt-2 max-w-3xl text-gray-300">
            These choices shape Help Me Choose and personalized recommendations
            on this device. They never change what other users see.
          </p>
        </div>

        <section className="mb-5 rounded-xl border border-gray-700 bg-gray-800/60 p-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <HeartIcon className="h-5 w-5 text-pink-300" />
            Show me more of these
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={`favorite-${genre.id}`}
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    favoriteGenres: toggleId(draft.favoriteGenres, genre.id),
                    hiddenGenres: draft.hiddenGenres.filter(
                      (id) => id !== genre.id
                    ),
                  })
                }
                className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                  draft.favoriteGenres.includes(genre.id)
                    ? 'border-pink-400 bg-pink-500/20 text-pink-100'
                    : 'border-gray-600 bg-gray-900/60 text-gray-300 hover:border-pink-400'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-5 rounded-xl border border-gray-700 bg-gray-800/60 p-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <NoSymbolIcon className="h-5 w-5 text-red-300" />
            Show me less of these
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={`hidden-${genre.id}`}
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    hiddenGenres: toggleId(draft.hiddenGenres, genre.id),
                    favoriteGenres: draft.favoriteGenres.filter(
                      (id) => id !== genre.id
                    ),
                  })
                }
                className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                  draft.hiddenGenres.includes(genre.id)
                    ? 'border-red-400 bg-red-500/20 text-red-100'
                    : 'border-gray-600 bg-gray-900/60 text-gray-300 hover:border-red-400'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </section>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <label className="rounded-xl border border-gray-700 bg-gray-800/60 p-5">
            <span className="block font-bold text-white">Anime</span>
            <span className="mb-3 mt-1 block text-sm text-gray-400">
              Choose how anime appears in personalized suggestions.
            </span>
            <select
              value={draft.animePreference}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  animePreference: event.target
                    .value as XmagePreferences['animePreference'],
                })
              }
            >
              <option value="normal">Show normally</option>
              <option value="more">Show me more anime</option>
              <option value="hide">Hide anime suggestions</option>
            </select>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-700 bg-gray-800/60 p-5">
            <input
              type="checkbox"
              aria-label="Favor family-friendly suggestions"
              checked={draft.familyFriendly}
              onChange={(event) =>
                setDraft({ ...draft, familyFriendly: event.target.checked })
              }
              className="mt-1 h-5 w-5"
            />
            <span>
              <span className="block font-bold text-white">
                Family-friendly suggestions
              </span>
              <span className="mt-1 block text-sm text-gray-400">
                Favor family and animation choices in Help Me Choose.
              </span>
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button buttonType="primary" onClick={save}>
            <CheckCircleIcon />
            Save Preferences
          </Button>
          {saved && <span className="text-sm text-green-300">Saved!</span>}
        </div>
      </div>
    </>
  );
};

export default UserPreferences;
