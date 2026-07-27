import PlainRequestStatus from '@app/components/Experience/PlainRequestStatus';
import WhatsNew from '@app/components/Experience/WhatsNew';
import useSettings from '@app/hooks/useSettings';
import type { User } from '@app/hooks/useUser';
import { Permission, useUser } from '@app/hooks/useUser';
import {
  AdjustmentsHorizontalIcon,
  ArrowTopRightOnSquareIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FilmIcon,
  LightBulbIcon,
  PlayCircleIcon,
  PlusCircleIcon,
  QuestionMarkCircleIcon,
  SignalIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';
import { MediaRequestStatus, MediaStatus } from '@server/constants/media';
import type { UserPushSubscription } from '@server/entity/UserPushSubscription';
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

interface RequestCounts {
  pending: number;
  processing: number;
  failed: number;
  available: number;
  completed: number;
}

interface MediaDetails {
  title?: string;
  name?: string;
  releaseDate?: string;
  firstAirDate?: string;
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

const getTimelineStep = (
  request: RequestResultsResponse['results'][number]
) => {
  const mediaStatus = request.is4k
    ? request.media?.status4k
    : request.media?.status;
  const downloads = request.is4k
    ? request.media?.downloadStatus4k
    : request.media?.downloadStatus;

  if (request.status === MediaRequestStatus.FAILED) return -1;
  if (request.status === MediaRequestStatus.PENDING) return 0;
  if (
    request.status === MediaRequestStatus.COMPLETED ||
    mediaStatus === MediaStatus.AVAILABLE
  ) {
    return 3;
  }
  if (
    (downloads?.length ?? 0) > 0 ||
    mediaStatus === MediaStatus.PROCESSING ||
    mediaStatus === MediaStatus.PARTIALLY_AVAILABLE
  ) {
    return 2;
  }
  return 1;
};

const RequestSummary = ({
  request,
  ready = false,
}: {
  request: RequestResultsResponse['results'][number];
  ready?: boolean;
}) => {
  const status = getRequestStatus(request.status);
  const mediaType = request.media?.mediaType === 'tv' ? 'Series' : 'Movie';
  const detailsEndpoint =
    request.media?.mediaType === 'tv'
      ? `/api/v1/tv/${request.media.tmdbId}`
      : `/api/v1/movie/${request.media?.tmdbId}`;
  const { data: details } = useSWR<MediaDetails>(
    request.media?.tmdbId ? detailsEndpoint : null
  );
  const title =
    details?.title ?? details?.name ?? `${mediaType} #${request.id}`;
  const releaseYear = Number(
    (details?.releaseDate ?? details?.firstAirDate)?.slice(0, 4)
  );
  const plexLibrary =
    request.media?.mediaType === 'tv'
      ? 'TV Shows'
      : Number.isFinite(releaseYear) && releaseYear < new Date().getFullYear()
        ? 'Old Movies'
        : 'New Movies';
  const currentStep = getTimelineStep(request);
  const downloads =
    (request.is4k
      ? request.media?.downloadStatus4k
      : request.media?.downloadStatus) ?? [];
  const mediaStatus = request.is4k
    ? request.media?.status4k
    : request.media?.status;
  const steps = ['Requested', 'Approved', 'Downloading', 'Available'];

  return (
    <Link
      href={
        request.media?.mediaType === 'tv'
          ? `/tv/${request.media.tmdbId}`
          : `/movie/${request.media?.tmdbId}`
      }
      className={`block rounded-lg border p-3 transition hover:bg-gray-800 ${
        ready
          ? 'border-green-500/30 bg-green-950/15 hover:border-green-400/60'
          : 'border-gray-700/80 bg-gray-900/55 hover:border-purple-500/60'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-gray-800 p-2">
          {ready ? (
            <CheckCircleIcon className="h-5 w-5 text-green-300" />
          ) : (
            <FilmIcon className="h-5 w-5 text-purple-300" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-gray-100">
            {title}
          </div>
          {ready ? (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-green-300">
              <status.Icon className="h-3.5 w-3.5" />
              Ready in Plex • {plexLibrary}
            </div>
          ) : (
            <PlainRequestStatus
              compact
              requestStatus={request.status}
              mediaStatus={mediaStatus}
              downloads={downloads}
              releaseDate={details?.releaseDate ?? details?.firstAirDate}
            />
          )}
        </div>
        <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-500" />
      </div>
      {!ready && (
        <div className="mt-3 grid grid-cols-4 gap-1">
          {steps.map((step, index) => (
            <div key={step} className="min-w-0">
              <div
                className={`mb-1 h-1 rounded-full ${
                  currentStep === -1
                    ? 'bg-red-500/60'
                    : index <= currentStep
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-500'
                      : 'bg-gray-700'
                }`}
              />
              <div
                className={`truncate text-[9px] ${
                  index <= currentStep ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {currentStep === -1 && index === 0 ? 'Failed' : step}
              </div>
            </div>
          ))}
        </div>
      )}
      {!ready && downloads.length > 0 && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
            style={{
              width: `${Math.round(
                ((downloads.reduce((sum, item) => sum + item.size, 0) -
                  downloads.reduce((sum, item) => sum + item.sizeLeft, 0)) /
                  Math.max(
                    1,
                    downloads.reduce((sum, item) => sum + item.size, 0)
                  )) *
                  100
              )}%`,
            }}
          />
        </div>
      )}
    </Link>
  );
};

const MediaDashboard = ({ user }: { user?: User }) => {
  const { hasPermission } = useUser();
  const { currentSettings } = useSettings();
  const isOwner = hasPermission(Permission.ADMIN);
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 18
        ? 'Good afternoon'
        : 'Good evening';
  const { data: requests } = useSWR<RequestResultsResponse>(
    user
      ? `/api/v1/request?filter=all&take=3&sort=added&skip=0&requestedBy=${user.id}`
      : null
  );
  const { data: readyRequests } = useSWR<RequestResultsResponse>(
    user
      ? `/api/v1/request?filter=available&take=3&sort=modified&skip=0&requestedBy=${user.id}`
      : null
  );
  const { data: pushSubscriptions } = useSWR<UserPushSubscription[]>(
    user ? `/api/v1/user/${user.id}/pushSubscriptions` : null
  );
  const { data: requestCounts } = useSWR<RequestCounts>(
    isOwner ? '/api/v1/request/count' : null,
    { refreshInterval: 30000 }
  );
  const { data: failedRequests } = useSWR<RequestResultsResponse>(
    isOwner ? '/api/v1/request?filter=failed&take=3&sort=modified&skip=0' : null
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
              {greeting}
              {user?.displayName ? `, ${user.displayName}` : ''}
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

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Link
          href="/discover/choose"
          className="rounded-xl border border-pink-500/30 bg-gradient-to-br from-pink-950/25 to-gray-800/60 p-4 transition hover:border-pink-400/60"
        >
          <QuestionMarkCircleIcon className="h-6 w-6 text-pink-300" />
          <div className="mt-2 font-bold text-white">Help Me Choose</div>
          <div className="mt-1 text-sm text-gray-400">
            Get five picks based on your mood.
          </div>
        </Link>
        <Link
          href="/preferences"
          className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-950/25 to-gray-800/60 p-4 transition hover:border-purple-400/60"
        >
          <AdjustmentsHorizontalIcon className="h-6 w-6 text-purple-300" />
          <div className="mt-2 font-bold text-white">My Preferences</div>
          <div className="mt-1 text-sm text-gray-400">
            Tune genres, anime, and family suggestions.
          </div>
        </Link>
        <Link
          href="/help"
          className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/25 to-gray-800/60 p-4 transition hover:border-cyan-400/60"
        >
          <LightBulbIcon className="h-6 w-6 text-cyan-300" />
          <div className="mt-2 font-bold text-white">How It Works</div>
          <div className="mt-1 text-sm text-gray-400">
            Requests, notifications, and Plex libraries explained.
          </div>
        </Link>
      </div>

      <WhatsNew />

      {readyRequests && readyRequests.results.length > 0 && (
        <div className="mb-4 rounded-xl border border-green-500/25 bg-gradient-to-r from-green-950/25 to-cyan-950/15 p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <SparklesIcon className="h-5 w-5 text-green-300" />
                Recently Ready for You
              </h2>
              <p className="text-xs text-gray-400">
                Your completed requests are ready to watch in Plex
              </p>
            </div>
            <a
              href="https://app.plex.tv/desktop/"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-green-300 hover:text-green-200"
            >
              Open Plex
            </a>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {readyRequests.results.map((request) => (
              <RequestSummary key={request.id} request={request} ready />
            ))}
          </div>
        </div>
      )}

      {pushSubscriptions &&
        pushSubscriptions.length === 0 &&
        (currentSettings.enablePushRegistration || isOwner) && (
          <Link
            href={
              currentSettings.enablePushRegistration
                ? '/profile/settings/notifications/webpush'
                : '/settings/notifications/webpush'
            }
            className="mb-4 flex flex-col justify-between gap-3 rounded-xl border border-cyan-400/35 bg-gradient-to-r from-cyan-950/35 via-blue-950/30 to-purple-950/35 p-4 shadow-lg transition hover:border-cyan-300/60 sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-cyan-400/15 p-2.5">
                <BellAlertIcon className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <div className="font-bold text-white">
                  Get notified when your requests are ready
                </div>
                <div className="mt-1 text-sm text-gray-300">
                  {currentSettings.enablePushRegistration
                    ? 'Turn on free browser notifications for this device.'
                    : 'Web Push needs to be enabled by the site owner first.'}
                </div>
              </div>
            </div>
            <span className="self-start rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-gray-950 sm:self-auto">
              {currentSettings.enablePushRegistration
                ? 'Set Up Notifications'
                : 'Enable Web Push'}
            </span>
          </Link>
        )}

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

      {isOwner && (
        <div className="mt-4 rounded-xl border border-amber-500/25 bg-gray-800/55 p-4 shadow-lg">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-300" />
                Request Pipeline & Attention
              </h2>
              <p className="text-xs text-gray-400">
                Owner-only overview of requests moving through the system
              </p>
            </div>
            <span className="self-start rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-200">
              Owner only
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              {
                label: 'Awaiting approval',
                value: requestCounts?.pending,
                color: 'text-amber-300',
              },
              {
                label: 'Processing',
                value: requestCounts?.processing,
                color: 'text-cyan-300',
              },
              {
                label: 'Failed',
                value: requestCounts?.failed,
                color: 'text-red-300',
              },
              {
                label: 'Available',
                value: requestCounts?.completed,
                color: 'text-green-300',
              },
            ].map((item) => (
              <Link
                key={item.label}
                href="/requests"
                className="rounded-lg border border-gray-700/80 bg-gray-900/55 p-3 transition hover:border-purple-500/50"
              >
                <div className={`text-2xl font-black ${item.color}`}>
                  {item.value ?? '—'}
                </div>
                <div className="mt-1 text-xs text-gray-400">{item.label}</div>
              </Link>
            ))}
          </div>

          <div className="mt-4">
            <div className="mb-2 text-sm font-semibold text-gray-200">
              Needs attention
            </div>
            {failedRequests && failedRequests.results.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-3">
                {failedRequests.results.map((request) => (
                  <RequestSummary key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-green-500/25 bg-green-950/10 p-4 text-center text-sm text-green-200">
                No failed requests. Everything looks healthy.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default MediaDashboard;
