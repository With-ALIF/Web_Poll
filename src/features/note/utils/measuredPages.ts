interface PageGroup {
  elements: HTMLElement[];
}

export function partitionContentToPages(
  sourceContainer: HTMLElement,
  limitFirst: number,
  limitSubsequent: number
): PageGroup[] {
  const children = Array.from(sourceContainer.children) as HTMLElement[];
  const pageGroups: PageGroup[] = [];
  let currentPageElements: HTMLElement[] = [];
  let accumulatedHeight = 0;

  children.forEach((child) => {
    const height = child.getBoundingClientRect().height || child.scrollHeight || 36;
    const currentLimit = pageGroups.length === 0 ? limitFirst : limitSubsequent;

    if (accumulatedHeight + height > currentLimit && currentPageElements.length > 0) {
      pageGroups.push({ elements: currentPageElements });
      currentPageElements = [child];
      accumulatedHeight = height;
    } else {
      currentPageElements.push(child);
      accumulatedHeight += height;
    }
  });

  if (currentPageElements.length > 0) {
    pageGroups.push({ elements: currentPageElements });
  }

  return pageGroups;
}
