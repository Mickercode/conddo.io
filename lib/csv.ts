// CSV export helpers. Convert a list of rows + column definitions into a CSV
// string and trigger a browser download via blob URL. Excel-friendly: CRLF
// line endings + UTF-8 BOM so Naira symbols and Yoruba accents render in
// Excel on Windows.
//
// Usage:
//   downloadCsv("customers", customers, [
//     { header: "Name", accessor: c => c.name },
//     { header: "Phone", accessor: c => c.phone ?? "" },
//     { header: "Total spent (₦)", accessor: c => c.totalSpent },
//   ]);

export type CsvColumn<T> = {
  header: string;
  accessor: (row: T) => string | number | null | undefined;
};

/** Escape a single cell: wrap in quotes if it contains commas / quotes / newlines.
 *  Doubles up internal quotes per RFC 4180. */
function escapeCell(raw: unknown): string {
  if (raw == null) return "";
  const s = String(raw);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Build the CSV string from rows + columns. No download — caller handles. */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const headerLine = columns.map((c) => escapeCell(c.header)).join(",");
  const bodyLines = rows.map((row) =>
    columns.map((c) => escapeCell(c.accessor(row))).join(","),
  );
  // CRLF + trailing newline — Excel-friendly.
  return [headerLine, ...bodyLines].join("\r\n") + "\r\n";
}

/** Format a filename like "customers-2026-06-05.csv" using today's date.
 *  Caller can pass an explicit date; otherwise we stamp client-side. */
export function timestampedName(base: string, when: Date = new Date()): string {
  const y = when.getFullYear();
  const m = String(when.getMonth() + 1).padStart(2, "0");
  const d = String(when.getDate()).padStart(2, "0");
  return `${base}-${y}-${m}-${d}.csv`;
}

/** Trigger a browser download of the given rows as a CSV file. */
export function downloadCsv<T>(
  filenameBase: string,
  rows: T[],
  columns: CsvColumn<T>[],
): void {
  const csv = toCsv(rows, columns);
  // UTF-8 BOM (﻿) so Excel auto-detects encoding for non-ASCII chars
  // (Naira ₦, accented letters, Yoruba). Most other parsers ignore it.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = timestampedName(filenameBase);
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
