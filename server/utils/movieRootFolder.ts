export const OLD_MOVIE_CUTOFF_YEAR = 2025;
export const OLD_MOVIE_ROOT_FOLDER = 'O:\\movies\\Old Movies';

export const getMovieRootFolderForReleaseDate = (
  releaseDate?: string
): string | undefined => {
  if (!releaseDate) {
    return undefined;
  }

  const releaseYear = Number(releaseDate.slice(0, 4));

  return Number.isInteger(releaseYear) &&
    releaseYear > 0 &&
    releaseYear <= OLD_MOVIE_CUTOFF_YEAR
    ? OLD_MOVIE_ROOT_FOLDER
    : undefined;
};
