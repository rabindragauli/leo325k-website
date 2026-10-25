// Approved clubs (design/source/public/Clubs.dc.html). Region, type, charter year, sponsor, email
// and logo are not supplied yet: null, shown as open placeholders (docs/08).
import type { Club, Region } from "./types";

export const regions: Region[] = []; // region names: open placeholder

function club(name: string, city: string): Club {
  const slug = name
    .replace(/^Leo Club of /, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  return {
    id: `club-${slug}`,
    name,
    slug,
    regionId: null,
    city,
    type: null,
    charterYear: null,
    sponsor: null,
    email: null,
    logo: null,
    listedInDirectory: true,
  };
}

/**
 * A home club that is not in the public directory (here: the Lions' clubs from the design data).
 * Ids/slugs match what migration 20261025180000_sprint5a created from the old free-text field.
 */
function unlistedClub(name: string): Club {
  const key = name.toLowerCase().replace(/ /g, "-");
  return {
    id: `club-unlisted-${key}`,
    name,
    slug: `unlisted-${key}`,
    regionId: null,
    city: null,
    type: null,
    charterYear: null,
    sponsor: null,
    email: null,
    logo: null,
    listedInDirectory: false,
  };
}

export const clubs: Club[] = [
  club("Leo Club of Kathmandu Machhapokhari", "Kathmandu"),
  club("Leo Club of Kathmandu Rainbow City", "Kathmandu"),
  club("Leo Club of Pokhara Silver Mountains", "Pokhara"),
  club("Leo Club of Baglung Kaligandaki", "Baglung"),
  unlistedClub("LC Pokhara Peace Chautari"),
  unlistedClub("LC Kathmandu Manamaiju"),
  unlistedClub("LC Kathmandu Metro City"),
  unlistedClub("LC Kathmandu Dirghajeevi"),
];
