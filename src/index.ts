import type { Page } from "gatsby";
import isString from "lodash/fp/isString";
import get from "lodash/fp/get";
import times from "lodash/fp/times";
import isInteger from "lodash/fp/isInteger";

import {
  paginatedPath,
  getPreviousItem,
  getNextItem,
  calculateSkip,
} from "./utils";

import type { PathPrefix } from "./utils";

type CreatePageFunction = (
  args: Page,
  plugin?: { name: string },
  option?: { [key: string]: unknown }
) => void;

type PaginateOpts<T> = {
  createPage: CreatePageFunction;
  items: Array<T>;
  itemsPerPage: number;
  itemsPerFirstPage?: number;
  pathPrefix: PathPrefix;
  component: string;
  context?: { [key: string]: unknown };
};
export const paginate = <T>(opts: PaginateOpts<T>): void => {
  const {
    createPage,
    items,
    itemsPerPage,
    itemsPerFirstPage,
    pathPrefix,
    component,
    context,
  } = opts;

  // How many items do we have in total? We use `items.length` here. In fact, we
  // could just accept an integer in the API as the actual contents of `items`
  // is never used.
  const totalItems = items.length;
  // If `itemsPerFirstPage` is specified, use that value for the first page,
  // otherwise use `itemsPerPage`.
  // $FlowExpectError
  const firstPageCount: number = isInteger(itemsPerFirstPage)
    ? itemsPerFirstPage
    : itemsPerPage;

  // How many page should we have?
  // If there are less than `firstPageCount` items, we'll only have 1 page
  const numberOfPages = totalItems <= firstPageCount
    ? 1
    : Math.ceil((totalItems - firstPageCount) / itemsPerPage) + 1;

  // Iterate as many times as we need pages
  times((pageNumber: number) => {
    // Create the path for this page
    const path = paginatedPath(pathPrefix, pageNumber, numberOfPages);

    // Calculate the path for the previous and next pages
    const previousPagePath = paginatedPath(
      pathPrefix,
      pageNumber - 1,
      numberOfPages,
    );
    const nextPagePath = paginatedPath(
      pathPrefix,
      pageNumber + 1,
      numberOfPages,
    );

    // Call `createPage()` for this paginated page
    createPage({
      path,
      component,
      // Clone the passed `context` and extend our new pagination context values
      // on top of it.
      context: {
        ...context,
        pageNumber,
        humanPageNumber: pageNumber + 1,
        skip: calculateSkip(pageNumber, firstPageCount, itemsPerPage),
        limit: pageNumber === 0 ? firstPageCount : itemsPerPage,
        numberOfPages,
        previousPagePath,
        nextPagePath,
      },
    });
  })(numberOfPages);
};

type CreatePagePerItemOpts<T> = {
  createPage: CreatePageFunction,
  items: Array<T>,
  itemToPath: string | ((item: T) => string),
  itemToId: string | ((item: T) => string),
  component: string
};
export const createPagePerItem = <T>(opts: CreatePagePerItemOpts<T>): void => {
  const {
    createPage,
    items,
    itemToPath,
    itemToId,
    component,
  } = opts;

  const getPath: (item: T) => string = isString(itemToPath)
    ? get(itemToPath)
    : itemToPath;
  const getId: (item: T) => string = isString(itemToId) ? get(itemToId) : itemToId;

  // We cannot use `forEach()` here because in the FP version of lodash, the
  // iteratee is capped to a single argument, the item itself. We cannot get the
  // item's index in the array. So instead we use `times()` and provide the
  // length of the array.
  times((index: number) => {
    const item = items[index];
    const path = getPath(item);
    const id = getId(item);

    // NOTE: If there is no previous / next item, we set an empty string as the
    // value for the next and previous path and ID. Gatsby ignores context
    // values which are undefined, so we need these to exist.
    const previousItem = getPreviousItem(items, index);
    const previousPath = getPath(previousItem) || ``;
    const nextItem = getNextItem(items, index);
    const nextPath = getPath(nextItem) || ``;

    // Does the item have a `context` field?
    const itemContext = get(`context`)(item) || {};
    const context = {
      ...itemContext,
      pageId: id,
      previousPagePath: previousPath,
      previousItem,
      previousPageId: getId(previousItem) || ``,
      nextPagePath: nextPath,
      nextItem,
      nextPageId: getId(nextItem) || ``,
    };

    // Call `createPage()` for this item
    createPage({
      path,
      component,
      context,
    });
  })(items.length);
};
