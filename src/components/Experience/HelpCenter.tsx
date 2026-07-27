import PageTitle from '@app/components/Common/PageTitle';
import {
  BellAlertIcon,
  CheckCircleIcon,
  ClockIcon,
  FilmIcon,
  FolderIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  TvIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';

const steps = [
  {
    icon: FilmIcon,
    title: '1. Find something',
    text: 'Search for a movie or series, or use Help Me Choose when you are undecided.',
  },
  {
    icon: ClockIcon,
    title: '2. Request it once',
    text: 'The status page will keep updating. Re-requesting does not make it download faster.',
  },
  {
    icon: BellAlertIcon,
    title: '3. Turn on notifications',
    text: 'Web Push can tell you when your request becomes ready.',
  },
  {
    icon: CheckCircleIcon,
    title: '4. Watch it in Plex',
    text: 'The completed request will tell you which Plex library contains it.',
  },
];

const HelpCenter = () => (
  <>
    <PageTitle title="How It Works" />
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-gray-800 to-cyan-950/25 p-6">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
          <QuestionMarkCircleIcon className="h-8 w-8 text-cyan-300" />
          {'How }{maGe works'}
        </h1>
        <p className="mt-2 text-gray-300">
          Request here, let the server do the technical work, then watch in
          Plex.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-xl border border-gray-700 bg-gray-800/60 p-5"
          >
            <step.icon className="mb-3 h-6 w-6 text-purple-300" />
            <h2 className="font-bold text-white">{step.title}</h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">{step.text}</p>
          </div>
        ))}
      </div>

      <section className="mb-6 rounded-xl border border-gray-700 bg-gray-800/60 p-5">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <FolderIcon className="h-5 w-5 text-amber-300" />
          Where titles appear in Plex
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-900/60 p-4">
            <FilmIcon className="mb-2 h-5 w-5 text-cyan-300" />
            <strong className="text-white">New Movies</strong>
            <p className="mt-1 text-sm text-gray-400">
              Movies released during the current year.
            </p>
          </div>
          <div className="rounded-lg bg-gray-900/60 p-4">
            <FilmIcon className="mb-2 h-5 w-5 text-purple-300" />
            <strong className="text-white">Old Movies</strong>
            <p className="mt-1 text-sm text-gray-400">
              Movies released before the current year.
            </p>
          </div>
          <div className="rounded-lg bg-gray-900/60 p-4">
            <TvIcon className="mb-2 h-5 w-5 text-pink-300" />
            <strong className="text-white">TV Shows</strong>
            <p className="mt-1 text-sm text-gray-400">
              Requested series and their selected seasons.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-purple-500/25 bg-purple-950/15 p-5">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <LightBulbIcon className="h-5 w-5 text-yellow-300" />
          Have an idea or found something broken?
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Suggestions go directly to the site owner and help shape future
          improvements.
        </p>
        <Link
          href="/suggestions"
          className="mt-4 inline-flex rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-500"
        >
          Share an Idea
        </Link>
      </section>
    </div>
  </>
);

export default HelpCenter;
