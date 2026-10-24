// Editable page content, one object per SiteSetting key (Sprint 3: JSON validated with Zod).
// Copy from design/source/public/*.dc.html renderVals() and markup. Text in [brackets] is an
// open placeholder (docs/08) and renders with <PlaceholderText>.

export const about = {
  heroLead:
    "Leo District Council 325 K brings together Leo clubs in our district — young volunteers who plan and run real service projects while building leadership skills for life.",
  heroPhoto: null as string | null, // [Photo: Leos from several clubs together]
  intro: [
    "Leo clubs are the youth program of Lions Clubs International. Every Leo club is sponsored by a Lions club, and Leos plan, lead and deliver their own service projects with Lion mentors beside them.",
    "The District Council coordinates clubs across our district: it sets the year’s service focus, trains club officers, organizes district-wide programs and recognizes outstanding Leos. [Add 1–2 sentences on the district’s history, to be confirmed by the council.]",
  ],
  facts: [
    { label: "Sponsored by", value: "Lions Clubs International District 325 K" },
    { label: "Part of", value: "Leo Multiple District 325, Nepal" },
    { label: "Leo Year", value: "July – June" },
    { label: "Member ages", value: "12 – 30" },
  ],
  pillars: [
    {
      letter: "L",
      title: "Leadership",
      text: "Leos run their own clubs and projects, learning to plan, lead teams and make decisions.",
    },
    {
      letter: "E",
      title: "Experience",
      text: "Hands-on service gives real experience in teamwork, organizing and working with communities.",
    },
    {
      letter: "O",
      title: "Opportunity",
      text: "Leos gain opportunities to grow, connect across Nepal and the world, and give back.",
    },
  ],
  mission: "[District mission statement — one or two sentences approved by the council.]",
  vision: "[District vision statement — where the district wants to be.]",
  focusAreas: [
    { title: "Blood donation", text: "District-wide drives coordinated with hospitals and blood banks." },
    { title: "Environment", text: "Tree plantation, clean-up campaigns and awareness programs." },
    { title: "Education", text: "Support for schools, students and learning materials." },
    { title: "Health & vision", text: "Health camps, eye screening and awareness programs." },
    { title: "Hunger relief", text: "Food distribution and support for families in need." },
    { title: "Youth leadership", text: "Trainings, seminars and leadership camps for Leos." },
  ],
  levels: [
    { title: "District Council", text: "Sets the year’s focus, coordinates programs and trains officers." },
    { title: "Regions", text: "Region coordinators support clubs in their area." },
    { title: "Leo clubs", text: "Each club elects its officers and runs its own service projects." },
    {
      title: "Lion sponsors",
      text: "Every Leo club is guided by a sponsoring Lions club and a Leo advisor.",
    },
  ],
  clubTypes: [
    {
      title: "Alpha Leo clubs",
      text: "For younger members, usually ages 12–18, focused on personal growth and community service.",
    },
    {
      title: "Omega Leo clubs",
      text: "For young adults, usually ages 18–30, focused on professional and leadership development through service.",
    },
  ],
};

export const privacy = {
  lastUpdated: "[date of launch]",
  replyTime: "[2 working days]",
  short: [
    {
      title: "We collect little",
      text: "Only what you type into the contact form, and the public profile details of district and club officers.",
    },
    {
      title: "We never sell or share it",
      text: "Your details are used only to reply to you. Messages about a club are forwarded to that club.",
    },
    {
      title: "You stay in control",
      text: "Ask us at any time to see, correct or delete your details.",
    },
  ],
  parts: [
    {
      title: "Who we are",
      text: "Leo District Council 325 K, Nepal is the youth program of Lions Clubs International District 325 K. We run this website and decide how the details collected through it are used.",
    },
    {
      title: "What we collect",
      // Officer-contact sentence reworded (phone/email public toggles): needs council approval, docs/08
      text: "Contact form: your name, email address, optional phone number, topic and message. Leadership and club pages: the name, title, photo and home club of officers, published only after the person agrees. Officers’ personal phone numbers and email addresses are shown only if the officer chooses to make them public. Membership IDs are kept for district records and are never shown on the website.",
    },
    {
      title: "Why we use it",
      text: "To reply to your message, to forward club enquiries to the right Leo club, and to show who leads the district and its clubs each Leo Year.",
    },
    {
      title: "How long we keep it",
      text: "Contact-form messages are deleted after 12 months. When an officer’s term ends, their private details are removed; the public archive keeps only name, title, photo and home club.",
    },
    {
      title: "Security and cookies",
      text: "The website uses HTTPS. Only signed-in district admins can see messages and private details. We use only the cookies needed for the site to work and Cloudflare Turnstile to block spam on the contact form. [If analytics is added at launch, name it here.]",
    },
    {
      title: "Your rights",
      text: "You can ask to see the details we hold about you, correct them, or have them deleted. We follow the spirit of Nepal’s Individual Privacy Act, 2075 (2018).",
    },
  ],
};

export const notFoundLinks = [
  { title: "Leadership", text: "The district team and our sponsoring Lions.", href: "/leadership" },
  { title: "Clubs", text: "Find a Leo club near you.", href: "/clubs" },
  { title: "Resources", text: "Forms, templates and logos.", href: "/resources" },
  { title: "About", text: "Who we are and how we serve.", href: "/about" },
];

export const home = {
  heroLead:
    "Young people across Nepal serving their communities through Leo clubs — blood drives, environment campaigns, education and leadership training, all in one district.",
  heroPhoto: null as string | null, // [Photo: district-wide service event, Leos in uniform]
  // Numbers band: council supplies the values (docs/08)
  stats: [
    { value: "[##]", label: "Leo clubs in District 325 K" },
    { value: "[###]", label: "Active Leo members" },
    { value: "[##]", label: "Service projects this Leo Year" },
    { value: "[#]", label: "Regions across the district" },
  ],
  explore: [
    {
      title: "Club directory",
      text: "Find approved Leo clubs by region and connect with one near you.",
      cta: "Browse clubs",
      href: "/clubs",
    },
    {
      title: "Resources",
      text: "Forms, templates, logos, guides and official district documents.",
      cta: "Open resources",
      href: "/resources",
    },
    {
      title: "Get in touch",
      text: "Questions, partnerships or starting a new club? The district office is here to help.",
      cta: "Contact the district",
      href: "/contact",
    },
  ],
};

export const clubsPage = {
  startSteps: [
    {
      title: "Gather interested youth",
      text: "Bring together a group of young people who want to serve their community.",
    },
    {
      title: "Find a sponsoring Lions club",
      text: "Every Leo club needs a Lions club sponsor. The district can connect you with one nearby.",
    },
    {
      title: "Charter your club",
      text: "Elect officers, complete the charter paperwork and join the district family.",
    },
  ],
};

export const resourcesPage = {
  // "See brand guidelines →" target: not supplied yet (docs/08); the link is hidden while null
  brandGuidelinesUrl: null as string | null,
};
