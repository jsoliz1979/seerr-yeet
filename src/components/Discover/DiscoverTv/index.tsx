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
import type { TvResult } from '@server/models/Search';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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
  quickThisYear: 'New This Year',
  quickAired: 'Already Aired',
  quickComingSoon: 'Coming Soon',
  comfortable: 'Comfortable',
  compact: 'Compact',
  airDateFilter: 'First air date: {period}',
  clearFilter: 'Remove {filter} filter',
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

type CatalogDensity = 'comfortable' | 'compact';

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
  const [density, setDensity] = useState<CatalogDensity>('comfortable');
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

  useEffect(() => {
    const savedDensity = window.localStorage.getItem(
      'xmage-series-density'
    ) as CatalogDensity | null;
    if (savedDensity === 'comfortable' || savedDensity === 'compact') {
      setDensity(savedDensity);
    }
  }, []);

  const changeDensity = (nextDensity: CatalogDensity) => {
    setDensity(nextDensity);
    window.localStorage.setItem('xmage-series-density', nextDensity);
  };

  const airPeriodLabel =
    selectedAirPeriod === 'thisYear'
      ? intl.formatMessage(messages.thisYear, { year: currentYear })
      : selectedAirPeriod === 'airedThisYear'
        ? intl.formatMessage(messages.airedThisYear)
        : selectedAirPeriod === 'comingLaterThisYear'
          ? intl.formatMessage(messages.comingLaterThisYear)
          : selectedAirPeriod === 'lastYear'
            ? intl.formatMessage(messages.lastYear, { year: lastYear })
            : intl.formatMessage(messages.customDateRange);
  const additionalActiveFilters = Object.entries(preparedFilters).filter(
    ([key, value]) =>
      value &&
      key !== 'sortBy' &&
      key !== 'firstAirDateGte' &&
      key !== 'firstAirDateLte'
  );
  const formatFilterName = (key: string) =>
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (letter) => letter.toUpperCase());

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
              ['airedThisYear', messages.quickAired],
              ['comingLaterThisYear', messages.quickComingSoon],
            ] as const
          ).map(([period, label]) => (
            <button
              key={period}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                selectedAirPeriod === period
                  ? 'border-purple-400 bg-purple-600 text-white'
                  : 'border-gray-600 bg-gray-800 text-gray-200 hover:border-purple-400 hover:bg-gray-700'
              }`}
              onClick={() =>
                batchUpdateQueryParams({
                  firstAirDateGte: airPeriods[period].gte,
                  firstAirDateLte: airPeriods[period].lte,
                })
              }
            >
              {intl.formatMessage(label)}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <div className="flex min-w-56 flex-1 xl:flex-initial">
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

        {(selectedAirPeriod !== 'all' ||
          additionalActiveFilters.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedAirPeriod !== 'all' && (
              <button
                className="flex items-center gap-1 rounded-full border border-purple-500/60 bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-200 hover:bg-purple-500/25"
                aria-label={intl.formatMessage(messages.clearFilter, {
                  filter: airPeriodLabel,
                })}
                onClick={() =>
                  batchUpdateQueryParams({
                    firstAirDateGte: undefined,
                    firstAirDateLte: undefined,
                  })
                }
              >
                {intl.formatMessage(messages.airDateFilter, {
                  period: airPeriodLabel,
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
        isReachingEnd={isReachingEnd}
        isLoading={
          isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
        }
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

export default DiscoverTv;
