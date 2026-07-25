import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  OLD_MOVIE_ROOT_FOLDER,
  getMovieRootFolderForReleaseDate,
} from './movieRootFolder';

describe('getMovieRootFolderForReleaseDate', () => {
  it('selects the old movie folder for movies released in 2025 or earlier', () => {
    assert.equal(
      getMovieRootFolderForReleaseDate('2025-12-31'),
      OLD_MOVIE_ROOT_FOLDER
    );
    assert.equal(
      getMovieRootFolderForReleaseDate('1999-01-01'),
      OLD_MOVIE_ROOT_FOLDER
    );
  });

  it('keeps the configured Radarr default for movies after 2025', () => {
    assert.equal(getMovieRootFolderForReleaseDate('2026-01-01'), undefined);
  });

  it('keeps the configured Radarr default when the release date is unknown', () => {
    assert.equal(getMovieRootFolderForReleaseDate(), undefined);
    assert.equal(getMovieRootFolderForReleaseDate('not-a-date'), undefined);
  });
});
