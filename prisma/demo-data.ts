import {
  addDays,
  startOfDay,
  type Channel,
  type Status,
} from "../lib/followup";

export type DemoTouch = {
  daysAgo: number;
  channel: Channel;
  note: string;
};

export type DemoContact = {
  name: string;
  company: string;
  email: string;
  url: string;
  channel: Channel;
  status: Status;
  tags: string;
  notes: string;
  followUpInDays: number | null;
  lastTouchDaysAgo: number | null;
  touches: DemoTouch[];
};

export const DEMO_CONTACTS: DemoContact[] = [
  {
    name: "Maya Chen",
    company: "Lattice",
    email: "maya.chen@lattice.example",
    url: "https://www.linkedin.com/in/mayachen",
    channel: "LINKEDIN",
    status: "CONTACTED",
    tags: "warm, saas, referral",
    notes:
      "Jordan intro. They're evaluating a design-system audit for Q1 and asked for a one-pager on how I run the engagement.",
    followUpInDays: -3,
    lastTouchDaysAgo: 6,
    touches: [
      {
        daysAgo: 12,
        channel: "LINKEDIN",
        note: "Warm intro from Jordan. She accepted and asked what a systems audit looks like.",
      },
      {
        daysAgo: 6,
        channel: "EMAIL",
        note: "Sent the one-pager and two relevant case studies. No reply yet.",
      },
    ],
  },
  {
    name: "Owen Blake",
    company: "Northwind Labs",
    email: "owen@northwindlabs.example",
    url: "https://northwindlabs.example",
    channel: "EMAIL",
    status: "CONTACTED",
    tags: "inbound, product",
    notes:
      "Downloaded the pricing page from the site. Wants a 30-minute architecture chat about a marketing-site rebuild.",
    followUpInDays: 0,
    lastTouchDaysAgo: 3,
    touches: [
      {
        daysAgo: 8,
        channel: "FORM",
        note: "Inbound form: 'Need a partner for a Next.js marketing rebuild this quarter.'",
      },
      {
        daysAgo: 3,
        channel: "EMAIL",
        note: "Sent a short Loom walking through a similar rebuild. Offered Tuesday or Thursday.",
      },
    ],
  },
  {
    name: "Ravi Mehta",
    company: "Stackyard",
    email: "ravi@stackyard.example",
    url: "https://www.linkedin.com/in/ravimehta",
    channel: "LINKEDIN",
    status: "CONTACTED",
    tags: "cold, agency",
    notes:
      "Agency partner lead. They farm out overflow brand and web work. Connection accepted, first note unanswered.",
    followUpInDays: 0,
    lastTouchDaysAgo: 7,
    touches: [
      {
        daysAgo: 7,
        channel: "LINKEDIN",
        note: "Connection accepted. Sent a short note about overflow design systems work.",
      },
    ],
  },
  {
    name: "Chris Adeyemi",
    company: "Quietline",
    email: "chris@quietline.example",
    url: "https://quietline.example",
    channel: "EMAIL",
    status: "CONTACTED",
    tags: "referral, saas",
    notes:
      "Nina referred Chris after their last launch. Sent the intro deck. He said he'd look on Monday.",
    followUpInDays: -1,
    lastTouchDaysAgo: 5,
    touches: [
      {
        daysAgo: 5,
        channel: "EMAIL",
        note: "Intro via Nina. Sent deck and a proposed 3-sprint plan.",
      },
    ],
  },
  {
    name: "Theo Marin",
    company: "Brightline Health",
    email: "theo.marin@brightline.example",
    url: "https://brightline.example",
    channel: "PHONE",
    status: "CONTACTED",
    tags: "inbound, healthcare",
    notes:
      "Great first call. He was going to loop in the VP of marketing. Radio silence since.",
    followUpInDays: -8,
    lastTouchDaysAgo: 14,
    touches: [
      {
        daysAgo: 21,
        channel: "FORM",
        note: "Inbound from the healthcare landing page.",
      },
      {
        daysAgo: 14,
        channel: "PHONE",
        note: "45-minute call. Pain is a stale patient-facing site. Budget exists for Q1.",
      },
    ],
  },
  {
    name: "Priya Shah",
    company: "Harbor & Co",
    email: "priya@harborco.example",
    url: "https://harborco.example",
    channel: "FORM",
    status: "REPLIED",
    tags: "inbound, warm",
    notes:
      "Replied to the proposal. Wants a Thursday call to walk through scope and timeline.",
    followUpInDays: 2,
    lastTouchDaysAgo: 1,
    touches: [
      {
        daysAgo: 10,
        channel: "FORM",
        note: "Requested a proposal for a 6-page brochure site plus a case-study template.",
      },
      {
        daysAgo: 4,
        channel: "EMAIL",
        note: "Sent proposal: 4-week sprint, $9.8k.",
      },
      {
        daysAgo: 1,
        channel: "EMAIL",
        note: "She replied: 'This looks right. Can we talk Thursday?'",
      },
    ],
  },
  {
    name: "Nina Solis",
    company: "Paperweight",
    email: "nina@paperweight.example",
    url: "https://paperweight.example",
    channel: "FORM",
    status: "REPLIED",
    tags: "newsletter, inbound",
    notes:
      "Liked the teardown in the newsletter. Asked for availability next week for a homepage refresh.",
    followUpInDays: 5,
    lastTouchDaysAgo: 2,
    touches: [
      {
        daysAgo: 2,
        channel: "EMAIL",
        note: "Replied to the teardown: 'We need this for our homepage. When are you free next week?'",
      },
    ],
  },
  {
    name: "Aisha Rahman",
    company: "Lumen School",
    email: "aisha@lumenschool.example",
    url: "https://lumenschool.example",
    channel: "FORM",
    status: "REPLIED",
    tags: "nonprofit, inbound",
    notes:
      "Board meeting this week. Asked to ping Friday after they review the three homepage directions.",
    followUpInDays: 1,
    lastTouchDaysAgo: 2,
    touches: [
      {
        daysAgo: 9,
        channel: "FORM",
        note: "Nonprofit inquiry: admissions landing page + donation flow.",
      },
      {
        daysAgo: 2,
        channel: "EMAIL",
        note: "Sent three direction frames. She'll share with the board on Thursday.",
      },
    ],
  },
  {
    name: "Jules Park",
    company: "Meridian Health",
    email: "jules.park@meridian.example",
    url: "https://meridian.example",
    channel: "EMAIL",
    status: "NEW",
    tags: "cold, healthcare",
    notes:
      "Researching compliance-heavy marketing sites. First outreach scheduled — not sent yet.",
    followUpInDays: 7,
    lastTouchDaysAgo: null,
    touches: [],
  },
  {
    name: "Hanna Berg",
    company: "Fjord Digital",
    email: "hanna@fjorddigital.example",
    url: "https://fjorddigital.example",
    channel: "LINKEDIN",
    status: "CONTACTED",
    tags: "agency, partnership",
    notes:
      "Exploring a subcontracting partnership for overflow product-design work.",
    followUpInDays: 10,
    lastTouchDaysAgo: 4,
    touches: [
      {
        daysAgo: 4,
        channel: "LINKEDIN",
        note: "Shared how I run overflow sprints. She wants to introduce me to their PM after a launch.",
      },
    ],
  },
  {
    name: "Ben Ito",
    company: "Copperline",
    email: "ben@copperline.example",
    url: "https://copperline.example",
    channel: "EMAIL",
    status: "CONTACTED",
    tags: "warm, saas",
    notes:
      "Met at a founder meetup. He wanted a follow-up with the seed-stage deck and a sample landing page.",
    followUpInDays: -4,
    lastTouchDaysAgo: 9,
    touches: [
      {
        daysAgo: 9,
        channel: "EMAIL",
        note: "Sent the seed deck and a passworded preview of a similar launch page.",
      },
    ],
  },
  {
    name: "Lucía Ortega",
    company: "Casa Norte",
    email: "lucia@casanorte.example",
    url: "https://casanorte.example",
    channel: "PHONE",
    status: "NEW",
    tags: "inbound",
    notes:
      "Left a voicemail from the contact page about a hospitality brand refresh. No follow-up date set yet.",
    followUpInDays: null,
    lastTouchDaysAgo: null,
    touches: [],
  },
  {
    name: "Elena Voss",
    company: "Kite Studio",
    email: "elena@kitestudio.example",
    url: "https://kitestudio.example",
    channel: "EMAIL",
    status: "WON",
    tags: "referral, studio",
    notes: "Closed a $12k brand sprint. Kickoff is on the calendar. No follow-up needed.",
    followUpInDays: null,
    lastTouchDaysAgo: 3,
    touches: [
      {
        daysAgo: 18,
        channel: "EMAIL",
        note: "Intro from a former client. Sent a sprint outline.",
      },
      {
        daysAgo: 3,
        channel: "EMAIL",
        note: "Signed. Sent kickoff questionnaire and invoice.",
      },
    ],
  },
  {
    name: "Sam Okonkwo",
    company: "Folio Club",
    email: "sam@folioclub.example",
    url: "https://folioclub.example",
    channel: "LINKEDIN",
    status: "LOST",
    tags: "cold",
    notes: "Went with an in-house hire. Stay friendly — they may need overflow later.",
    followUpInDays: null,
    lastTouchDaysAgo: 20,
    touches: [
      {
        daysAgo: 30,
        channel: "LINKEDIN",
        note: "Cold outreach about a membership-site redesign.",
      },
      {
        daysAgo: 20,
        channel: "EMAIL",
        note: "They chose to hire in-house. Wished them luck.",
      },
    ],
  },
];

export function materializeDemoContact(
  contact: DemoContact,
  now = new Date(),
) {
  const today = startOfDay(now);
  return {
    name: contact.name,
    company: contact.company,
    email: contact.email,
    url: contact.url,
    channel: contact.channel,
    status: contact.status,
    tags: contact.tags,
    notes: contact.notes,
    nextFollowUpAt:
      contact.followUpInDays === null
        ? null
        : addDays(today, contact.followUpInDays),
    lastTouchedAt:
      contact.lastTouchDaysAgo === null
        ? null
        : addDays(today, -contact.lastTouchDaysAgo),
    touches: contact.touches.map((touch) => ({
      date: addDays(today, -touch.daysAgo),
      channel: touch.channel,
      note: touch.note,
    })),
  };
}
