import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  OLD_MOVIE_ROOT_FOLDER,
  getMovieRootFolderForReleaseDate,
} from './movieRootFolder';

describe('getMovieRootFolderForReleaseDate', () => {
  it('selects the old movie folder for releases before the current year', () => {
    assert.equal(
      getMovieRootFolderForReleaseDate('2025-12-31', 2026),
      OLD_MOVIE_ROOT_FOLDER
    );
    assert.equal(
      getMovieRootFolderForReleaseDate('1999-01-01', 2026),
      OLD_MOVIE_ROOT_FOLDER
    );
  });

  it('keeps the configured Radarr default for the current year and future releases', () => {
    assert.equal(
      getMovieRootFolderForReleaseDate('2026-01-01', 2026),
      undefined
    );
    assert.equal(
      getMovieRootFolderForReleaseDate('2027-01-01', 2026),
      undefined
    );
  });

  it('keeps the configured Radarr default when the release date is unknown', () => {
    assert.equal(getMovieRootFolderForReleaseDate(undefined, 2026), undefined);
    assert.equal(
      getMovieRootFolderForReleaseDate('not-a-date', 2026),
      undefined
    );
  });

  it('automatically rolls the cutoff forward each year', () => {
    assert.equal(
      getMovieRootFolderForReleaseDate('2026-06-01', 2027),
      OLD_MOVIE_ROOT_FOLDER
    );
  });
});
