export function getApiBaseUrl() {
  return "/api/proxy/";
}

export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>> = []) {
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((value) => {
          const normalized = value == null ? "" : String(value);
          return `"${normalized.replaceAll('"', '""')}"`;
        })
        .join(",")
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function uploadCsv(endpoint: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(endpoint, {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail || "Upload failed.";
    throw new Error(detail);
  }

  return data;
}
