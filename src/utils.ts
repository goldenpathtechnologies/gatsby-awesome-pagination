export const getPreviousItem = <T>(items: Array<T>, index: number): T | undefined => {
  // If this is the first (or -1) element, there is no previous, so return
  // undefined
  if (index <= 0) {
    return undefined;
  }

  // Get the previous element
  return items[index - 1];
};

export const getNextItem = <T>(items: Array<T>, index: number): T | undefined => {
  // If this is the last element (or later), there is no previous, so return
  // undefined
  if (index >= items.length - 1) {
    return undefined;
  }

  // Get the previous element
  return items[index + 1];
};

type PathPrefixFunctionOptions = {
  pageNumber: number;
  numberOfPages: number;
};

type PathPrefixFunction = (options: PathPrefixFunctionOptions) => string;

export type PathPrefix = string | PathPrefixFunction;

export const paginatedPath = (
  pathPrefix: PathPrefix,
  pageNumber: number,
  numberOfPages: number,
): string => {
  // If this page is less than zero (-1 for example), then it  it does not
  // exist, return an empty string.
  if (pageNumber < 0) {
    return ``;
  }

  // If this page number (which is zero indexed) plus one is more than the total
  // number of pages, then this page does not exist, so return an empty string.
  if (pageNumber + 1 > numberOfPages) {
    return ``;
  }

  // Calculate a path prefix either by calling `pathPrefix()` if it's a function
  // or simply using `pathPrefix` if it is a string.
  const prefix = typeof pathPrefix === `function`
    ? pathPrefix({ pageNumber, numberOfPages })
    : pathPrefix;

  // If this is page 0, return only the pathPrefix
  if (pageNumber === 0) {
    return prefix;
  }

  // Otherwise, add a slash and the number + 1. We add 1 because `pageNumber` is
  // zero indexed, but for human consuption, we want 1 indexed numbers.
  return `${prefix !== `/` ? prefix : ``}/${pageNumber + 1}`;
  // NOTE: If `pathPrefix` is a single slash (the index page) then we do not
  // want to output two slashes, so we omit it.
};

export const calculateSkip = (
  pageNumber: number,
  firstPageCount: number,
  itemsPerPage: number,
): number => {
  if (pageNumber === 0) {
    return 0;
  }
  if (pageNumber === 1) {
    return firstPageCount;
  }

  return firstPageCount + itemsPerPage * (pageNumber - 1);
};
