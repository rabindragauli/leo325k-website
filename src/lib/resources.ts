/** Badge label for a resource: "LINK" for external links, else the file type (PDF, DOCX, ZIP). */
export const resourceType = (item: { kind: "FILE" | "LINK"; fileType: string | null }) =>
  item.kind === "LINK" ? "LINK" : (item.fileType ?? "FILE");
