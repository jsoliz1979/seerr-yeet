import Button from '@app/components/Common/Button';
import ListView from '@app/components/Common/ListView';
import PageTitle from '@app/components/Common/PageTitle';
import type { FilterOptions } from '@app/components/Discover/constants';
import {
  countActiveFilters,
  prepareFilterValues,
} from '@app/components/Discover/constants';
import FilterSlideover from '@app/components/Discover/FilterSlideover';
import useDiscover from '@app/hooks/useDiscover';
import {
  useBatchUpdateQueryParams,
  useUpdateQueryParams,
} from '@app/hooks/useUpdateQueryParams';
import ErrorPage from '@app/pages/_error';
import defineMessages from '@app/utils/defineMessages';
import {
  BarsArrowDownIcon,
  CalendarDaysIcon,
  FunnelIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import type { SortOptions as TMDBSortOptions } from '@server/api/themoviedb';
import type { MovieResult } from '@server/models/Search';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

const messages = defineMessages('components.Discover.DiscoverMovies', {
  discovermovies: 'Movies',
  activefilters:
    '{count, plural, one {# Active Filter} other {# Active Filters}}',
  sortPopularityAsc: 'Least Popular',
  sortPopularityDesc: 'Most Popular',
  sortReleaseDateAsc: 'Oldest Releases First',
  sortReleaseDateDesc: 'Newest Releases First',
  sortTmdbRatingAsc: 'Lowest Rated',
  sortTmdbRatingDesc: 'Highest Rated',
  sortTitleAsc: 'Title: A to Z',
  sortTitleDesc: 'Title: Z to A',
  allReleaseDates: 'All Release Dates',
  thisYear: 'This Year ({year})',
  releasedThisYear: 'Released This Year',
  comingLaterThisYear: 'Coming Later This Year',
  lastYear: 'Last Year ({year})',
  customDateRange: 'Custom Date Range',
  quickThisYear: 'New This Year',
  quickReleased: 'Already Released',
  quickComingSoon: 'Coming Soon',
  comfortable: 'Comfortable',
  compact: 'Compact',
  releaseFilter: 'Release: {period}',
  clearFilter: 'Remove {filter} filter',
});

const SortOptions: Record<string, TMDBSortOptions> = {
  PopularityAsc: 'popularity.asc',
  PopularityDesc: 'popularity.desc',
  ReleaseDateAsc: 'release_date.asc',
  ReleaseDateDesc: 'release_date.desc',
  TmdbRatingAsc: 'vote_average.asc',
  TmdbRatingDesc: 'vote_average.desc',
  TitleAsc: 'original_title.asc',
  TitleDesc: 'original_title.desc',
} as const;

type ReleasePeriod =
  | 'all'
  | 'thisYear'
  | 'releasedThisYear'
  | 'comingLaterThisYear'
  | 'lastYear'
  | 'custom';

type CatalogDensity = 'comfortable' | 'compact';

const toDateString = (date: Date): string =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

const DiscoverMovies = () => {
  const intl = useIntl();
  const router = useRouter();
  const updateQueryParams = useUpdateQueryParams({});
  const batchUpdateQueryParams = useBatchUpdateQueryParams({});

  const preparedFilters = prepareFilterValues(router.query);
  const today = new Date();
  const currentYear = today.getFullYear();
  const lastYear = currentYear - 1;
  const todayString = toDateString(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const releasePeriods: Record<
    Exclude<ReleasePeriod, 'custom'>,
    { gte?: string; lte?: string }
  > = {
    all: {},
    thisYear: {
      gte: `${currentYear}-01-01`,
      lte: `${currentYear}-12-31`,
    },
    releasedThisYear: {
      gte: `${currentYear}-01-01`,
      lte: todayString,
    },
    comingLaterThisYear: {
      gte: toDateString(tomorrow),
      lte: `${currentYear}-12-31`,
    },
    lastYear: {
      gte: `${lastYear}-01-01`,
      lte: `${lastYear}-12-31`,
    },
  };
  const selectedReleasePeriod =
    (
      Object.entries(releasePeriods) as [
        Exclude<ReleasePeriod, 'custom'>,
        { gte?: string; lte?: string },
      ][]
    ).find(
      ([, range]) =>
        range.gte === preparedFilters.primaryReleaseDateGte &&
        range.lte === preparedFilters.primaryReleaseDateLte
    )?.[0] ?? 'custom';

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<MovieResult, unknown, FilterOptions>(
    '/api/v1/discover/movies',
    preparedFilters
  );
  const [showFilters, setShowFilters] = useState(false);
  const [density, setDensity] = useState<CatalogDensity>('comfortable');

  useEffect(() => {
    const savedDensity = window.localStorage.getItem(
      'xmage-movie-density'
    ) as CatalogDensity | null;
    if (savedDensity === 'comfortable' || savedDensity === 'compact') {
      setDensity(savedDensity);
    }
  }, []);

  const changeDensity = (nextDensity: CatalogDensity) => {
    setDensity(nextDensity);
    window.localStorage.setItem('xmage-movie-density', nextDensity);
  };

  const releasePeriodLabel =
    selectedReleasePeriod === 'thisYear'
      ? intl.formatMessage(messages.thisYear, { year: currentYear })
      : selectedReleasePeriod === 'releasedThisYear'
        ? intl.formatMessage(messages.releasedThisYear)
        : selectedReleasePeriod === 'comingLaterThisYear'
          ? intl.formatMessage(messages.comingLaterThisYear)
          : selectedReleasePeriod === 'lastYear'
            ? intl.formatMessage(messages.lastYear, { year: lastYear })
            : intl.formatMessage(messages.customDateRange);
  const additionalActiveFilters = Object.entries(preparedFilters).filter(
    ([key, value]) =>
      value &&
      key !== 'sortBy' &&
      key !== 'primaryReleaseDateGte' &&
      key !== 'primaryReleaseDateLte'
  );
  const formatFilterName = (key: string) =>
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (letter) => letter.toUpperCase());

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  const title = intl.formatMessage(messages.discovermovies);

  return (
    <>
      <PageTitle title={title} />
      <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-gray-700/70 bg-gray-900/95 px-4 pb-4 pt-3 shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-overseerr text-3xl font-bold sm:text-4xl">
            {title}
          </h1>
          <div className="flex rounded-lg border border-gray-600 bg-gray-800 p-1">
            <button
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                density === 'comfortable'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => changeDensity('comfortable')}
            >
              <Squares2X2Icon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {intl.formatMessage(messages.comfortable)}
              </span>
            </button>
            <button
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                density === 'compact'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => changeDensity('compact')}
            >
              <ViewColumnsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {intl.formatMessage(messages.compact)}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ['thisYear', messages.quickThisYear],
              ['releasedThisYear', messages.quickReleased],
              ['comingLaterThisYear', messages.quickComingSoon],
            ] as const
          ).map(([period, label]) => (
            <button
              key={period}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                selectedReleasePeriod === period
                  ? 'border-purple-400 bg-purple-600 text-white'
                  : 'border-gray-600 bg-gray-800 text-gray-200 hover:border-purple-400 hover:bg-gray-700'
              }`}
              onClick={() =>
                batchUpdateQueryParams({
                  primaryReleaseDateGte: releasePeriods[period].gte,
                  primaryReleaseDateLte: releasePeriods[period].lte,
                })
              }
            >
              {intl.formatMessage(label)}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2 xl:flex-row xl:items-center">
          <div className="flex flex-1 flex-wrap gap-2">
            <div className="flex min-w-56 flex-1 xl:flex-initial">
              <span className="inline-flex cursor-default items-center rounded-l-md border border-r-0 border-gray-500 bg-gray-800 px-3 text-gray-100 sm:text-sm">
                <CalendarDaysIcon className="h-6 w-6" />
              </span>
              <select
                id="releasePeriod"
                name="releasePeriod"
                aria-label="Release period"
                className="rounded-r-only"
                value={selectedReleasePeriod}
                onChange={(e) => {
                  const period = e.target.value as ReleasePeriod;

                  if (period === 'custom') {
                    return;
                  }

                  batchUpdateQueryParams({
                    primaryReleaseDateGte: releasePeriods[period].gte,
                    primaryReleaseDateLte: releasePeriods[period].lte,
                  });
                }}
              >
                <option value="all">
                  {intl.formatMessage(messages.allReleaseDates)}
                </option>
                <option value="thisYear">
                  {intl.formatMessage(messages.thisYear, { year: currentYear })}
                </option>
                <option value="releasedThisYear">
                  {intl.formatMessage(messages.releasedThisYear)}
                </option>
                <option value="comingLaterThisYear">
                  {intl.formatMessage(messages.comingLaterThisYear)}
                </option>
                <option value="lastYear">
                  {intl.formatMessage(messages.lastYear, { year: lastYear })}
                </option>
                {selectedReleasePeriod === 'custom' && (
                  <option value="custom">
                    {intl.formatMessage(messages.customDateRange)}
                  </option>
                )}
              </select>
            </div>
            <div className="flex min-w-56 flex-1 xl:flex-initial">
              <span className="inline-flex cursor-default items-center rounded-l-md border border-r-0 border-gray-500 bg-gray-800 px-3 text-gray-100 sm:text-sm">
                <BarsArrowDownIcon className="h-6 w-6" />
              </span>
              <select
                id="sortBy"
                name="sortBy"
                className="rounded-r-only"
                value={preparedFilters.sortBy || SortOptions.PopularityDesc}
                onChange={(e) => updateQueryParams('sortBy', e.target.value)}
              >
                <option value={SortOptions.PopularityDesc}>
                  {intl.formatMessage(messages.sortPopularityDesc)}
                </option>
                <option value={SortOptions.PopularityAsc}>
                  {intl.formatMessage(messages.sortPopularityAsc)}
                </option>
                <option value={SortOptions.ReleaseDateDesc}>
                  {intl.formatMessage(messages.sortReleaseDateDesc)}
                </option>
                <option value={SortOptions.ReleaseDateAsc}>
                  {intl.formatMessage(messages.sortReleaseDateAsc)}
                </option>
                <option value={SortOptions.TmdbRatingDesc}>
                  {intl.formatMessage(messages.sortTmdbRatingDesc)}
                </option>
                <option value={SortOptions.TmdbRatingAsc}>
                  {intl.formatMessage(messages.sortTmdbRatingAsc)}
                </option>
                <option value={SortOptions.TitleAsc}>
                  {intl.formatMessage(messages.sortTitleAsc)}
                </option>
                <option value={SortOptions.TitleDesc}>
                  {intl.formatMessage(messages.sortTitleDesc)}
                </option>
              </select>
            </div>
            <FilterSlideover
              type="movie"
              currentFilters={preparedFilters}
              onClose={() => setShowFilters(false)}
              show={showFilters}
            />
            <div className="flex min-w-44 flex-1 xl:flex-initial">
              <Button onClick={() => setShowFilters(true)} className="w-full">
                <FunnelIcon />
                <span>
                  {intl.formatMessage(messages.activefilters, {
                    count: countActiveFilters(preparedFilters),
                  })}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {(selectedReleasePeriod !== 'all' ||
          additionalActiveFilters.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedReleasePeriod !== 'all' && (
              <button
                className="flex items-center gap-1 rounded-full border border-purple-500/60 bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-200 hover:bg-purple-500/25"
                aria-label={intl.formatMessage(messages.clearFilter, {
                  filter: releasePeriodLabel,
                })}
                onClick={() =>
                  batchUpdateQueryParams({
                    primaryReleaseDateGte: undefined,
                    primaryReleaseDateLte: undefined,
                  })
                }
              >
                {intl.formatMessage(messages.releaseFilter, {
                  period: releasePeriodLabel,
                })}
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
            {additionalActiveFilters.map(([key, value]) => (
              <button
                key={key}
                className="flex max-w-full items-center gap-1 rounded-full border border-cyan-500/50 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-100 hover:bg-cyan-500/20"
                aria-label={intl.formatMessage(messages.clearFilter, {
                  filter: formatFilterName(key),
                })}
                onClick={() => updateQueryParams(key, undefined)}
              >
                <span className="truncate">
                  {formatFilterName(key)}: {String(value)}
                </span>
                <XMarkIcon className="h-3.5 w-3.5 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
      <ListView
        items={titles}
        isEmpty={isEmpty}
        isLoading={
          isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
        }
        isReachingEnd={isReachingEnd}
        onScrollBottom={fetchMore}
        className={`grid ${
          density === 'comfortable'
            ? 'gap-x-5 gap-y-7 [grid-template-columns:repeat(auto-fill,minmax(11.5rem,1fr))]'
            : 'gap-3 [grid-template-columns:repeat(auto-fill,minmax(9.375rem,1fr))]'
        }`}
        showMediaTypeBadge={false}
        showStaticMetadata
      />
    </>
  );
};

export default DiscoverMovies;
