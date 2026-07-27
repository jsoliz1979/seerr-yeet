import Button from '@app/components/Common/Button';
import ListView from '@app/components/Common/ListView';
import PageTitle from '@app/components/Common/PageTitle';
import useXmagePreferences from '@app/hooks/useXmagePreferences';
import {
  ArrowPathIcon,
  FaceSmileIcon,
  FilmIcon,
  SparklesIcon,
  TvIcon,
} from '@heroicons/react/24/solid';
import type { MovieResult, TvResult } from '@server/models/Search';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

interface DiscoverResponse {
  results: (MovieResult | TvResult)[];
}

type Mood = 'funny' | 'action' | 'scary' | 'relaxing' | 'surprise';
type Age = 'new' | 'classic' | 'either';
type MediaKind = 'movie' | 'tv';

const moodGenres: Record<Mood, { movie: number; tv: number }> = {
  funny: { movie: 35, tv: 35 },
  action: { movie: 28, tv: 10759 },
  scary: { movie: 27, tv: 9648 },
  relaxing: { movie: 10751, tv: 18 },
  surprise: { movie: 0, tv: 0 },
};

const HelpMeChoose = () => {
  const { preferences } = useXmagePreferences();
  const [mediaKind, setMediaKind] = useState<MediaKind>('movie');
  const [mood, setMood] = useState<Mood>('funny');
  const [age, setAge] = useState<Age>('either');
  const [shortOnly, setShortOnly] = useState(false);
  const [seed, setSeed] = useState(0);
  const [started, setStarted] = useState(false);

  const queryUrl = useMemo(() => {
    if (!started) return null;

    const now = new Date();
    const currentYear = now.getFullYear();
    const params = new URLSearchParams({
      page: String((seed % 4) + 1),
      sortBy: seed % 2 ? 'vote_average.desc' : 'popularity.desc',
      voteCountGte: '75',
    });

    let genre = moodGenres[mood][mediaKind];
    if (mood === 'surprise' && preferences.favoriteGenres.length > 0) {
      genre =
        preferences.favoriteGenres[seed % preferences.favoriteGenres.length];
    }
    if (preferences.familyFriendly) genre = 10751;
    if (preferences.animePreference === 'more') genre = 16;
    if (genre) params.set('genre', String(genre));
    if (shortOnly)
      params.set('withRuntimeLte', mediaKind === 'movie' ? '120' : '50');

    if (age === 'new') {
      const field =
        mediaKind === 'movie' ? 'primaryReleaseDateGte' : 'firstAirDateGte';
      params.set(field, `${currentYear - 2}-01-01`);
    } else if (age === 'classic') {
      const field =
        mediaKind === 'movie' ? 'primaryReleaseDateLte' : 'firstAirDateLte';
      params.set(field, `${currentYear - 10}-12-31`);
    }

    return `/api/v1/discover/${mediaKind === 'movie' ? 'movies' : 'tv'}?${params}`;
  }, [age, mediaKind, mood, preferences, seed, shortOnly, started]);

  const { data, isLoading } = useSWR<DiscoverResponse>(queryUrl);
  const suggestions = (data?.results ?? [])
    .filter((title) => {
      const genreIds = 'genreIds' in title ? (title.genreIds ?? []) : [];
      return !genreIds.some((id) => preferences.hiddenGenres.includes(id));
    })
    .slice(0, 5);

  const choose = () => {
    setStarted(true);
    setSeed((current) => current + 1);
  };

  return (
    <>
      <PageTitle title="Help Me Choose" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl border border-pink-500/25 bg-gradient-to-br from-purple-950/40 via-gray-800 to-cyan-950/30 p-6">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
            <SparklesIcon className="h-8 w-8 text-pink-300" />
            Help Me Choose
          </h1>
          <p className="mt-2 text-gray-300">
            Answer four quick questions and get five ideas instead of scrolling
            through hundreds of posters.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <fieldset className="rounded-xl border border-gray-700 bg-gray-800/60 p-5">
            <legend className="font-bold text-white">What do you want?</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { value: 'movie', label: 'Movie', Icon: FilmIcon },
                { value: 'tv', label: 'Series', Icon: TvIcon },
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMediaKind(value as MediaKind)}
                  className={`flex items-center justify-center gap-2 rounded-lg border p-3 font-semibold ${
                    mediaKind === value
                      ? 'border-purple-400 bg-purple-500/20 text-white'
                      : 'border-gray-600 text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-gray-700 bg-gray-800/60 p-5">
            <legend className="font-bold text-white">What mood?</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ['funny', 'Funny'],
                  ['action', 'Action'],
                  ['scary', 'Scary'],
                  ['relaxing', 'Relaxing'],
                  ['surprise', 'Surprise me'],
                ] as [Mood, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMood(value)}
                  className={`rounded-full border px-3 py-2 text-sm font-medium ${
                    mood === value
                      ? 'border-pink-400 bg-pink-500/20 text-white'
                      : 'border-gray-600 text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-gray-700 bg-gray-800/60 p-5">
            <legend className="font-bold text-white">New or classic?</legend>
            <div className="mt-3 flex gap-2">
              {(
                [
                  ['new', 'Newer'],
                  ['classic', 'Classic'],
                  ['either', 'Either'],
                ] as [Age, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAge(value)}
                  className={`flex-1 rounded-lg border p-2 text-sm font-medium ${
                    age === value
                      ? 'border-cyan-400 bg-cyan-500/20 text-white'
                      : 'border-gray-600 text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-700 bg-gray-800/60 p-5">
            <input
              type="checkbox"
              aria-label="Keep suggestions reasonably short"
              checked={shortOnly}
              onChange={(event) => setShortOnly(event.target.checked)}
              className="h-5 w-5"
            />
            <span>
              <span className="block font-bold text-white">
                Keep it reasonably short
              </span>
              <span className="text-sm text-gray-400">
                Under two hours for movies or about 50 minutes per episode.
              </span>
            </span>
          </label>
        </div>

        <Button buttonType="primary" onClick={choose}>
          {started ? <ArrowPathIcon /> : <FaceSmileIcon />}
          {started ? 'Give Me Five Different Ideas' : 'Find Five Ideas'}
        </Button>

        {started && (
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Your five picks
            </h2>
            <ListView
              items={suggestions}
              isEmpty={!isLoading && suggestions.length === 0}
              isLoading={isLoading}
              isReachingEnd
              onScrollBottom={() => undefined}
              className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(10rem,1fr))]"
              showStaticMetadata
            />
          </div>
        )}
      </div>
    </>
  );
};

export default HelpMeChoose;
