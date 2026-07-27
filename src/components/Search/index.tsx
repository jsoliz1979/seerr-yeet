import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import PageTitle from '@app/components/Common/PageTitle';
import useDiscover from '@app/hooks/useDiscover';
import ErrorPage from '@app/pages/_error';
import defineMessages from '@app/utils/defineMessages';
import { MediaStatus } from '@server/constants/media';
import type {
  MovieResult,
  PersonResult,
  TvResult,
} from '@server/models/Search';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

const messages = defineMessages('components.Search', {
  search: 'Search',
  searchresults: 'Search Results',
});

const Search = () => {
  const intl = useIntl();
  const router = useRouter();
  const [resultType, setResultType] = useState<
    'all' | 'movie' | 'tv' | 'available'
  >('all');

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<MovieResult | TvResult | PersonResult>(
    `/api/v1/search`,
    {
      query: router.query.query,
    },
    { hideAvailable: false, hideBlocklisted: false }
  );

  const query = String(router.query.query ?? '')
    .trim()
    .toLowerCase();
  const sortedTitles = useMemo(() => {
    const titleText = (item: MovieResult | TvResult | PersonResult) =>
      item.mediaType === 'movie'
        ? item.title
        : item.mediaType === 'tv'
          ? item.name
          : item.name;

    return [...(titles ?? [])]
      .filter((item) => {
        if (resultType === 'all') return true;
        if (resultType === 'available') {
          return (
            item.mediaType !== 'person' &&
            item.mediaInfo?.status === MediaStatus.AVAILABLE
          );
        }
        return item.mediaType === resultType;
      })
      .sort((left, right) => {
        const leftExact = titleText(left).toLowerCase() === query ? 1 : 0;
        const rightExact = titleText(right).toLowerCase() === query ? 1 : 0;
        if (leftExact !== rightExact) return rightExact - leftExact;

        const leftAvailable =
          left.mediaType !== 'person' &&
          left.mediaInfo?.status === MediaStatus.AVAILABLE
            ? 1
            : 0;
        const rightAvailable =
          right.mediaType !== 'person' &&
          right.mediaInfo?.status === MediaStatus.AVAILABLE
            ? 1
            : 0;
        return rightAvailable - leftAvailable;
      });
  }, [query, resultType, titles]);

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.search)} />
      <div className="mb-5 mt-1">
        <Header>{intl.formatMessage(messages.searchresults)}</Header>
        <p className="mt-2 text-sm text-gray-400">
          Exact matches and titles already available in Plex appear first.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ['all', 'Everything'],
              ['movie', 'Movies'],
              ['tv', 'Series'],
              ['available', 'Watch in Plex'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setResultType(value)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                resultType === value
                  ? 'border-purple-400 bg-purple-600 text-white'
                  : 'border-gray-600 bg-gray-800 text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ListView
        items={sortedTitles}
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

export default Search;
