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
import type { TvResult } from '@server/models/Search';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useIntl } from 'react-intl';

const messages = defineMessages('components.Discover.DiscoverTv', {
  discovertv: 'Series',
  activefilters:
    '{count, plural, one {# Active Filter} other {# Active Filters}}',
  sortPopularityAsc: 'Least Popular',
  sortPopularityDesc: 'Most Popular',
  sortFirstAirDateAsc: 'Oldest Series First',
  sortFirstAirDateDesc: 'Newest Series First',
  sortTmdbRatingAsc: 'Lowest Rated',
  sortTmdbRatingDesc: 'Highest Rated',
  sortTitleAsc: 'Title: A to Z',
  sortTitleDesc: 'Title: Z to A',
  allAirDates: 'All First Air Dates',
  thisYear: 'This Year ({year})',
  airedThisYear: 'Already Aired This Year',
  comingLaterThisYear: 'Coming Later This Year',
  lastYear: 'Last Year ({year})',
  customDateRange: 'Custom Date Range',
});

const SortOptions: Record<string, TMDBSortOptions> = {
  PopularityAsc: 'popularity.asc',
  PopularityDesc: 'popularity.desc',
  FirstAirDateAsc: 'first_air_date.asc',
  FirstAirDateDesc: 'first_air_date.desc',
  TmdbRatingAsc: 'vote_average.asc',
  TmdbRatingDesc: 'vote_average.desc',
  TitleAsc: 'original_title.asc',
  TitleDesc: 'original_title.desc',
} as const;

type AirPeriod =
  | 'all'
  | 'thisYear'
  | 'airedThisYear'
  | 'comingLaterThisYear'
  | 'lastYear'
  | 'custom';

const toDateString = (date: Date): string =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

const DiscoverTv = () => {
  const intl = useIntl();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const preparedFilters = prepareFilterValues(router.query);
  const updateQueryParams = useUpdateQueryParams({});
  const batchUpdateQueryParams = useBatchUpdateQueryParams({});
  const today = new Date();
  const currentYear = today.getFullYear();
  const lastYear = currentYear - 1;
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const airPeriods: Record<
    Exclude<AirPeriod, 'custom'>,
    { gte?: string; lte?: string }
  > = {
    all: {},
    thisYear: {
      gte: `${currentYear}-01-01`,
      lte: `${currentYear}-12-31`,
    },
    airedThisYear: {
      gte: `${currentYear}-01-01`,
      lte: toDateString(today),
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
  const selectedAirPeriod =
    (
      Object.entries(airPeriods) as [
        Exclude<AirPeriod, 'custom'>,
        { gte?: string; lte?: string },
      ][]
    ).find(
      ([, range]) =>
        range.gte === preparedFilters.firstAirDateGte &&
        range.lte === preparedFilters.firstAirDateLte
    )?.[0] ?? 'custom';

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<TvResult, never, FilterOptions>('/api/v1/discover/tv', {
    ...preparedFilters,
  });

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  const title = intl.formatMessage(messages.discovertv);

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
              id="airPeriod"
              name="airPeriod"
              aria-label="First air date"
              className="rounded-r-only"
              value={selectedAirPeriod}
              onChange={(event) => {
                const period = event.target.value as AirPeriod;
                if (period === 'custom') return;
                batchUpdateQueryParams({
                  firstAirDateGte: airPeriods[period].gte,
                  firstAirDateLte: airPeriods[period].lte,
                });
              }}
            >
              <option value="all">
                {intl.formatMessage(messages.allAirDates)}
              </option>
              <option value="thisYear">
                {intl.formatMessage(messages.thisYear, { year: currentYear })}
              </option>
              <option value="airedThisYear">
                {intl.formatMessage(messages.airedThisYear)}
              </option>
              <option value="comingLaterThisYear">
                {intl.formatMessage(messages.comingLaterThisYear)}
              </option>
              <option value="lastYear">
                {intl.formatMessage(messages.lastYear, { year: lastYear })}
              </option>
              {selectedAirPeriod === 'custom' && (
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
              <option value={SortOptions.FirstAirDateDesc}>
                {intl.formatMessage(messages.sortFirstAirDateDesc)}
              </option>
              <option value={SortOptions.FirstAirDateAsc}>
                {intl.formatMessage(messages.sortFirstAirDateAsc)}
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
            type="tv"
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
        isReachingEnd={isReachingEnd}
        isLoading={
          isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
        }
        onScrollBottom={fetchMore}
      />
    </>
  );
};

export default DiscoverTv;
