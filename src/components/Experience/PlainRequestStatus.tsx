import { MediaRequestStatus, MediaStatus } from '@server/constants/media';
import type { DownloadingItem } from '@server/lib/downloadtracker';

interface PlainRequestStatusProps {
  requestStatus: MediaRequestStatus;
  mediaStatus?: MediaStatus;
  downloads?: DownloadingItem[];
  releaseDate?: string;
  compact?: boolean;
}

const getDownloadProgress = (downloads: DownloadingItem[]) => {
  const size = downloads.reduce((total, item) => total + item.size, 0);
  const left = downloads.reduce((total, item) => total + item.sizeLeft, 0);
  return size > 0
    ? Math.max(0, Math.min(100, Math.round(((size - left) / size) * 100)))
    : 0;
};

const PlainRequestStatus = ({
  requestStatus,
  mediaStatus,
  downloads = [],
  releaseDate,
  compact = false,
}: PlainRequestStatusProps) => {
  const futureRelease =
    releaseDate && new Date(`${releaseDate}T12:00:00`).getTime() > Date.now();
  const progress = getDownloadProgress(downloads);

  let title = 'Searching for a download';
  let explanation =
    'Your request is active. You do not need to request it again.';
  let color = 'text-cyan-200';

  if (requestStatus === MediaRequestStatus.PENDING) {
    title = 'Waiting for approval';
    explanation = 'The site owner will review this request.';
    color = 'text-amber-200';
  } else if (requestStatus === MediaRequestStatus.FAILED) {
    title = 'Needs owner attention';
    explanation =
      'Something prevented this request from being added. You do not need to request it again.';
    color = 'text-red-200';
  } else if (
    requestStatus === MediaRequestStatus.COMPLETED ||
    mediaStatus === MediaStatus.AVAILABLE
  ) {
    title = 'Ready to watch';
    explanation = 'This title is available in Plex.';
    color = 'text-green-200';
  } else if (downloads.length > 0) {
    title = `Downloading — ${progress}%`;
    explanation =
      downloads[0]?.timeLeft && downloads[0].timeLeft !== '00:00:00'
        ? `Estimated time remaining: ${downloads[0].timeLeft}`
        : 'The download is actively progressing.';
  } else if (futureRelease) {
    title = 'Waiting for release';
    explanation = `This title is scheduled for ${new Date(
      `${releaseDate}T12:00:00`
    ).toLocaleDateString()}. Seerr will keep looking after it is released.`;
    color = 'text-purple-200';
  } else if (
    mediaStatus === MediaStatus.PROCESSING ||
    mediaStatus === MediaStatus.PARTIALLY_AVAILABLE
  ) {
    title = 'Processing';
    explanation =
      'The title is being downloaded or prepared for the Plex library.';
  }

  return (
    <div
      className={
        compact ? '' : 'rounded-lg border border-gray-700 bg-gray-900/50 p-3'
      }
    >
      <div className={`text-sm font-semibold ${color}`}>{title}</div>
      {!compact && (
        <div className="mt-1 text-xs text-gray-400">{explanation}</div>
      )}
      {downloads.length > 0 && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default PlainRequestStatus;
