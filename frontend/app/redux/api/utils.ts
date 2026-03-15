export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type ResultsOnlyResponse<T> = {
  results: T[];
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
