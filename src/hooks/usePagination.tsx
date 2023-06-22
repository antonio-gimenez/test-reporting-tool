import { useMemo } from "react";


interface rangeProps {
  start: number;
  end: number;
}

const range = ({ start, end }: rangeProps
) => {
  let length = end - start + 1;
  // Create an array of certain length and set the elements within it from start value to end value.
  return Array.from({ length }, (_, i) => i + start);
};

const DOTS = "...";

interface paginationProps {
  totalCount: number;
  pageSize: number;
  siblingCount?: number;
  currentPage: number;
}


const usePagination = ({ totalCount, pageSize, siblingCount = 1, currentPage }: paginationProps) => {

  const paginationRange = useMemo(() => {
    var totalPageCount = Math.ceil(totalCount / pageSize);
    // Check if we need to subtract 1 from the totalPageCount: If totalCount is not divisible by pageSize, we don't need to subtract 1  because Math.ceil() will automatically round up to the nearest whole number. 
    if (totalCount % pageSize !== 0) {
      totalPageCount = totalPageCount - 1;
    }
    // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingCount + 5;

    // Case 1: If the number of pages is less than the page numbers we want to show in our paginationComponent, we return the range [1..totalPageCount]

    if (totalPageNumbers >= totalPageCount) {
      return range({ start: 1, end: totalPageCount });
    }

    // Calculate left and right sibling index and make sure they are within range 1 and totalPageCount
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPageCount);

    // We do not show dots just when there is just one page number to be inserted between the extremes of sibling and the page limits i.e 1 and totalPageCount. Hence we are using leftSiblingIndex > 2 and rightSiblingIndex < totalPageCount - 2

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    // Case 2: No left dots to show, but rights dots to be shown

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range({ start: 1, end: leftItemCount });

      return [...leftRange, DOTS, totalPageCount];
    }

    // Case 3: No right dots to show, but left dots to be shown
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range({ start: totalPageCount - rightItemCount + 1, end: totalPageCount });
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Case 4: Both left and right dots to be shown
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range({ start: leftSiblingIndex, end: rightSiblingIndex });
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
  }, [totalCount, pageSize, siblingCount, currentPage]);
  if (!totalCount || totalCount <= 0) return null;
  return paginationRange;
};

export default usePagination;
