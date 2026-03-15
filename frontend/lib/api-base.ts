const LOCAL_API_BASE =
  process.env.NEXT_PUBLIC_API_URL_LOCAL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api/";

const normalizeApiBase = (value: string) => (value.endsWith("/") ? value : `${value}/`);

export function getApiBaseUrl() {
  return normalizeApiBase(LOCAL_API_BASE);
}
