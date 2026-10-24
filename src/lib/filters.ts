// Client-side filtering for the club directory and resource library (pure, unit-tested).

export const ALL = "all";

const normalise = (text: string) => text.toLocaleLowerCase("en").replace(/\s+/g, " ").trim();

/** Every word of the query must appear somewhere in the text ("pokhara silver" matches). */
export function matchesQuery(text: string, query: string): boolean {
  const words = normalise(query).split(" ").filter(Boolean);
  const haystack = normalise(text);
  return words.every((word) => haystack.includes(word));
}

export type ClubFilter = { query: string; region: string; city: string };

export function filterClubs<T extends { name: string; city: string; region: string | null }>(
  clubs: T[],
  { query, region, city }: ClubFilter,
): T[] {
  return clubs.filter(
    (club) =>
      (city === ALL || club.city === city) &&
      (region === ALL || club.region === region) &&
      matchesQuery(club.name, query),
  );
}

/** Distinct values in first-seen order (cities, regions). */
export function distinct(values: (string | null)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v))];
}

export type ResourceFilter = { query: string; category: string };

type Searchable = { title: string; description: string; category: string };

export function filterResources<T extends Searchable>(items: T[], { query, category }: ResourceFilter): T[] {
  return items.filter(
    (item) =>
      (category === ALL || item.category === category) &&
      matchesQuery(`${item.title} ${item.description}`, query),
  );
}

/** Matches per category for the current query (category list counts), plus the "all" total. */
export function countByCategory<T extends Searchable>(items: T[], categories: string[], query: string) {
  const matching = filterResources(items, { query, category: ALL });
  const counts: Record<string, number> = { [ALL]: matching.length };
  for (const category of categories) counts[category] = matching.filter((i) => i.category === category).length;
  return counts;
}
