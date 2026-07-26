import Button from '@app/components/Common/Button';
import Header from '@app/components/Common/Header';
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
} from '@heroicons/react/24/solid';
import type { SortOptions as TMDBSortOptions } from '@server/api/themoviedb';
import type { MovieResult } from '@server/models/Search';
import { useRouter } from 'next/router';
import { useState } from 'react';
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

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  const title = intl.formatMessage(messages.discovermovies);

  return (
    <>
      <PageTitle title={title} />
      <div className="mb-4 flex flex-col justify-between lg:flex-row lg:items-end">
        <Header>{title}</Header>
        <div className="mt-2 flex flex-grow flex-col gap-2 sm:flex-row lg:flex-grow-0">
          <div className="flex flex-grow lg:flex-grow-0">
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
          <div className="mb-2 flex flex-grow sm:mb-0 sm:mr-2 lg:flex-grow-0">
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
          <div className="mb-2 flex flex-grow sm:mb-0 lg:flex-grow-0">
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
      <ListView
        items={titles}
        isEmpty={isEmpty}
        isLoading={
          isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
        }
        isReachingEnd={isReachingEnd}
        onScrollBottom={fetchMore}
      />
    </>
  );
};

export default DiscoverMovies;
