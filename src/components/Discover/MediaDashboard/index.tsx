import type { User } from '@app/hooks/useUser';
import { Permission, useUser } from '@app/hooks/useUser';
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  FilmIcon,
  LightBulbIcon,
  PlayCircleIcon,
  PlusCircleIcon,
  SignalIcon,
} from '@heroicons/react/24/solid';
import { MediaRequestStatus } from '@server/constants/media';
import type { RequestResultsResponse } from '@server/interfaces/api/requestInterfaces';
import Link from 'next/link';
import useSWR from 'swr';

interface PlexSession {
  id: string;
  user: string;
  player: string;
  state: string;
  title: string;
  subtitle?: string;
  progress: number;
  playback: 'Direct Play' | 'Direct Stream' | 'Transcoding';
}

interface PlexSessionsResponse {
  sessions: PlexSession[];
  connected: boolean;
}

const getRequestStatus = (status: number) => {
  switch (status) {
    case MediaRequestStatus.COMPLETED:
      return {
        label: 'Available',
        color: 'text-green-300',
        Icon: CheckCircleIcon,
      };
    case MediaRequestStatus.APPROVED:
      return { label: 'Processing', color: 'text-cyan-300', Icon: ClockIcon };
    case MediaRequestStatus.PENDING:
      return {
        label: 'Awaiting approval',
        color: 'text-amber-300',
        Icon: ClockIcon,
      };
    case MediaRequestStatus.FAILED:
      return {
        label: 'Needs attention',
        color: 'text-red-300',
        Icon: ClockIcon,
      };
    default:
      return { label: 'Updated', color: 'text-gray-300', Icon: ClockIcon };
  }
};

const RequestSummary = ({
  request,
}: {
  request: RequestResultsResponse['results'][number];
}) => {
  const status = getRequestStatus(request.status);
  const mediaType = request.media?.mediaType === 'tv' ? 'Series' : 'Movie';

  return (
    <Link
      href="/requests"
      className="flex items-center gap-3 rounded-lg border border-gray-700/80 bg-gray-900/55 p-3 transition hover:border-purple-500/60 hover:bg-gray-800"
    >
      <div className="rounded-lg bg-gray-800 p-2">
        <FilmIcon className="h-5 w-5 text-purple-300" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-gray-100">
          {mediaType} request #{request.id}
        </div>
        <div
          className={`mt-0.5 flex items-center gap-1 text-xs ${status.color}`}
        >
          <status.Icon className="h-3.5 w-3.5" />
          {status.label}
        </div>
      </div>
      <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-500" />
    </Link>
  );
};

const MediaDashboard = ({ user }: { user?: User }) => {
  const { hasPermission } = useUser();
  const isOwner = hasPermission(Permission.ADMIN);
  const { data: requests } = useSWR<RequestResultsResponse>(
    '/api/v1/request?filter=all&take=3&sort=added&skip=0'
  );
  const { data: plexSessions, error: plexSessionsError } =
    useSWR<PlexSessionsResponse>(
      isOwner ? '/api/v1/service/plex/sessions' : null,
      { refreshInterval: 15000, errorRetryCount: 2 }
    );

  return (
    <section className="mb-8">
      <div className="mb-5 overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-purple-950/40 p-5 shadow-xl sm:p-7">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <SignalIcon className="h-4 w-4" />
              Your media dashboard
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Welcome back{user?.displayName ? `, ${user.displayName}` : ''}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
              Discover something new, follow your requests, and jump straight
              into Plex—all from one place.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[34rem]">
            <Link
              href="/discover/movies"
              className="flex items-center justify-between rounded-xl border border-pink-400/40 bg-gradient-to-r from-pink-600 to-fuchsia-600 px-4 py-3 font-semibold text-white shadow-lg shadow-pink-900/20 transition hover:scale-[1.02]"
            >
              <span className="flex items-center gap-2">
                <PlusCircleIcon className="h-5 w-5" />
                Request a Movie
              </span>
            </Link>
            <a
              href="https://app.plex.tv/desktop/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-700 to-blue-700 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-900/20 transition hover:scale-[1.02]"
            >
              <span className="flex items-center gap-2">
                <PlayCircleIcon className="h-5 w-5" />
                Open Plex
              </span>
            </a>
            <Link
              href="/suggestions"
              className="flex items-center justify-between rounded-xl border border-purple-400/40 bg-gradient-to-r from-purple-700 to-violet-700 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:scale-[1.02]"
            >
              <span className="flex items-center gap-2">
                <LightBulbIcon className="h-5 w-5" />
                Share an Idea
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${isOwner ? 'xl:grid-cols-2' : ''}`}>
        <div className="rounded-xl border border-gray-700/80 bg-gray-800/55 p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">My Requests</h2>
              <p className="text-xs text-gray-400">
                Your latest requests and their current status
              </p>
            </div>
            <Link
              href="/requests"
              className="text-sm font-medium text-purple-300 hover:text-purple-200"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {(requests?.results ?? []).map((request) => (
              <RequestSummary key={request.id} request={request} />
            ))}
            {requests && requests.results.length === 0 && (
              <div className="col-span-full rounded-lg border border-dashed border-gray-600 p-5 text-center text-sm text-gray-400">
                No requests yet. Find a movie or series you would love to watch!
              </div>
            )}
            {!requests &&
              [0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[4.5rem] animate-pulse rounded-lg bg-gray-700/60"
                />
              ))}
          </div>
        </div>

        {isOwner && (
          <div className="rounded-xl border border-purple-500/30 bg-gray-800/55 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <SignalIcon className="h-5 w-5 text-pink-400" />
                  Now Playing
                </h2>
                <p className="text-xs text-gray-400">
                  Owner-only live activity from Plex
                </p>
              </div>
              <span className="rounded-full bg-purple-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-purple-200">
                Owner only
              </span>
            </div>
            <div className="space-y-2">
              {(plexSessions?.sessions ?? []).slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="rounded-lg border border-gray-700/80 bg-gray-900/55 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">
                        {session.user} - {session.title}
                      </div>
                      <div className="truncate text-xs text-gray-400">
                        {session.subtitle || session.player}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold ${
                        session.playback === 'Transcoding'
                          ? 'text-amber-300'
                          : 'text-green-300'
                      }`}
                    >
                      {session.playback}
                    </span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                      style={{ width: `${session.progress}%` }}
                    />
                  </div>
                </div>
              ))}
              {plexSessions && plexSessions.sessions.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-600 p-5 text-center text-sm text-gray-400">
                  {plexSessions.connected
                    ? 'Nothing is being played right now.'
                    : 'Plex activity is temporarily unavailable.'}
                </div>
              )}
              {!plexSessions && !plexSessionsError && (
                <div className="rounded-lg border border-gray-700/80 bg-gray-900/40 p-5 text-center text-sm text-gray-400">
                  Checking Plex activity…
                </div>
              )}
              {plexSessionsError && (
                <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-5 text-center text-sm text-red-200">
                  Plex activity could not be loaded. The dashboard will retry
                  automatically.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MediaDashboard;
