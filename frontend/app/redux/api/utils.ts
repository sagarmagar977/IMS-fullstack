export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type ResultsOnlyResponse<T> = {
  results: T[];
};

export type ListResult<T> = {
  items: T[];
  totalItems: number;
  next: string | null;
  previous: string | null;
};

export const unwrapListResponse = <T>(
  response: T[] | PaginatedResponse<T> | ResultsOnlyResponse<T>
): T[] => {
  if (Array.isArray(response)) {
    return response;
  }
  if (
    response &&
    typeof response === "object" &&
    "results" in response &&
    Array.isArray((response as PaginatedResponse<T>).results)
  ) {
    return (response as PaginatedResponse<T>).results;
  }
  return [];
};

export const normalizeListResponse = <T>(
  response: T[] | PaginatedResponse<T> | ResultsOnlyResponse<T>
): ListResult<T> => {
  if (Array.isArray(response)) {
    return {
      items: response,
      totalItems: response.length,
      next: null,
      previous: null,
    };
  }
  if (
    response &&
    typeof response === "object" &&
    "results" in response &&
    Array.isArray((response as PaginatedResponse<T>).results)
  ) {
    const paginated = response as PaginatedResponse<T>;
    return {
      items: paginated.results,
      totalItems: typeof paginated.count === "number" ? paginated.count : paginated.results.length,
      next: "next" in paginated ? paginated.next : null,
      previous: "previous" in paginated ? paginated.previous : null,
    };
  }
  return {
    items: [],
    totalItems: 0,
    next: null,
    previous: null,
  };
};
