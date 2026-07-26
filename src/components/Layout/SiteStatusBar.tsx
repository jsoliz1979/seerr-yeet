import defineMessages from '@app/utils/defineMessages';
import { CircleStackIcon, UsersIcon } from '@heroicons/react/24/solid';
import { useIntl } from 'react-intl';
import useSWR from 'swr';

interface SiteStatus {
  onlineUsers: number;
  storage: {
    path: string;
    freeSpace: number;
    totalSpace: number | null;
  } | null;
}

const messages = defineMessages('components.Layout.SiteStatusBar', {
  movieStorage: '{drive}movie storage',
  free: '{free} free',
  freeOfTotal: '{free} free of {total}',
  online: '{count, plural, one {# user online} other {# users online}}',
});

const formatBytes = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit++;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unit]}`;
};

const SiteStatusBar = () => {
  const intl = useIntl();
  const { data } = useSWR<SiteStatus>('/api/v1/service/status', {
    refreshInterval: 30000,
  });

  if (!data) return null;

  const usedPercent = data.storage?.totalSpace
    ? Math.min(
        100,
        Math.max(
          0,
          ((data.storage.totalSpace - data.storage.freeSpace) /
            data.storage.totalSpace) *
            100
        )
      )
    : 0;
  const driveLabel = data.storage?.path.match(/^([a-zA-Z]:)/)?.[1];

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-500/20 bg-gray-800/70 px-4 py-2.5 text-sm shadow-lg backdrop-blur">
      {data.storage && (
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <CircleStackIcon className="h-5 w-5 shrink-0 text-cyan-300" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate font-medium text-gray-100">
                {intl.formatMessage(messages.movieStorage, {
                  drive: driveLabel ? `${driveLabel} ` : '',
                })}
              </span>
              <span className="shrink-0 font-semibold text-cyan-200">
                {data.storage.totalSpace
                  ? intl.formatMessage(messages.freeOfTotal, {
                      free: formatBytes(data.storage.freeSpace),
                      total: formatBytes(data.storage.totalSpace),
                    })
                  : intl.formatMessage(messages.free, {
                      free: formatBytes(data.storage.freeSpace),
                    })}
              </span>
            </div>
            {data.storage.totalSpace && (
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-700">
                <div
                  className={`h-full rounded-full ${
                    usedPercent >= 90
                      ? 'bg-red-500'
                      : usedPercent >= 75
                        ? 'bg-amber-400'
                        : 'bg-gradient-to-r from-cyan-400 to-purple-500'
                  }`}
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex shrink-0 items-center gap-2 rounded-full bg-gray-900/70 px-3 py-1.5 font-medium text-gray-100">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
        </span>
        <UsersIcon className="h-4 w-4 text-green-300" />
        {intl.formatMessage(messages.online, { count: data.onlineUsers })}
      </div>
    </div>
  );
};

export default SiteStatusBar;
