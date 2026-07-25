export const OLD_MOVIE_ROOT_FOLDER = 'O:\\movies\\Old Movies';

export const getMovieRootFolderForReleaseDate = (
  releaseDate?: string,
  currentYear = new Date().getFullYear()
): string | undefined => {
  if (!releaseDate) {
    return undefined;
  }

  const releaseYear = Number(releaseDate.slice(0, 4));

  return Number.isInteger(releaseYear) &&
    releaseYear > 0 &&
    releaseYear < currentYear
    ? OLD_MOVIE_ROOT_FOLDER
    : undefined;
};
