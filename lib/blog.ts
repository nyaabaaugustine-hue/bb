import { IMG } from "./data";

export type ArticleSection = {
  heading: string;
  paragraphs: readonly string[];
  points?: readonly string[];
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  sections: readonly ArticleSection[];
};

export const articles: readonly Article[] = [
  {
    slug: "verify-land-before-you-buy",
    title: "Buying land in Ghana: what to verify before you pay",
    excerpt: "A practical checklist for checking the seller, the site, and the paperwork before making a land commitment.",
    category: "Buying land",
    readTime: "5 min read",
    image: IMG.land1,
    sections: [
      {
        heading: "Start with the person selling",
        paragraphs: [
          "Ask who owns the land and what authority the seller has to offer it. If someone is acting for an owner or family, ask to see the documents that show their authority and get independent advice on what those documents mean.",
          "Names and details should be consistent across the documents you are given. A mismatch is a reason to pause and get it checked, not to rely on a verbal explanation.",
        ],
      },
      {
        heading: "Check the documents independently",
        paragraphs: [
          "Ask for copies and references for the land records, then have a qualified property lawyer help verify them through the appropriate official channels. A copy by itself does not confirm that a transaction is safe or that the land is free from competing claims.",
          "The checks you need can depend on the land, its location, and how it is held. Do not treat a checklist from a website as a substitute for advice on the specific plot.",
        ],
      },
      {
        heading: "Visit the actual site",
        paragraphs: [
          "Visit with someone who can help identify the boundaries on the ground. Compare the location and dimensions you are shown with the information in the documents, and ask about access roads, utilities, drainage, and nearby development.",
          "If possible, speak with people who know the area and arrange an independent survey where appropriate. A site visit helps you understand the property, but it does not replace document checks.",
        ],
      },
      {
        heading: "Put the agreement and payment trail in writing",
        paragraphs: [
          "Before paying, understand the full price, what the payment covers, the conditions, and what happens next. Have the agreement reviewed independently and use traceable payment methods where possible.",
          "Keep signed copies, receipts, and records of every conversation and payment. If you feel rushed or are asked to pay before you can verify key details, pause the process.",
        ],
      },
      {
        heading: "Get advice for the specific plot",
        paragraphs: [
          "Land transactions can have legal and practical details that vary from one site to another. Use an independent lawyer and other qualified professionals to review the particular plot before you commit.",
          "B B Homes encourages buyers to verify documents independently before payment. This guide is general information, not legal or financial advice.",
        ],
      },
    ],
  },
  {
    slug: "plan-your-home-buying-budget",
    title: "Plan a home budget beyond the asking price",
    excerpt: "Look at the full cost of moving, buying, or building so the numbers and timeline are clearer before you commit.",
    category: "Planning",
    readTime: "4 min read",
    image: IMG.home2,
    sections: [
      {
        heading: "Separate upfront costs from monthly costs",
        paragraphs: [
          "The advertised price is only one part of a housing budget. List the costs due before you move, then make a separate estimate for recurring costs so you can see both the initial commitment and the ongoing one.",
          "Depending on the property and your agreement, you may need to ask about deposits, professional services, utility connections, service charges, transport, and maintenance.",
        ],
      },
      {
        heading: "Ask what is included",
        paragraphs: [
          "Confirm in writing what the quoted price includes and what it does not. For a build, ask how the design, materials, labour, site preparation, and changes are handled. For a rental, clarify the rent period, deposit, utilities, and any additional charges.",
          "If you are comparing options, use the same list of cost categories for each one. This makes differences easier to spot than comparing headline prices alone.",
        ],
        points: [
          "Amount due now and later",
          "Payment dates and conditions",
          "Recurring charges and who pays them",
          "Costs that could change and how changes are approved",
        ],
      },
      {
        heading: "Build a realistic timeline",
        paragraphs: [
          "Map expected payments to the dates you expect to have funds available. Leave room for verification, approvals, moving costs, and unexpected repairs rather than planning around the fastest possible schedule.",
          "Where payments are staged, request a written schedule that connects each payment to a clear milestone. Make sure you understand what evidence confirms a milestone is complete.",
        ],
      },
      {
        heading: "Keep a reserve",
        paragraphs: [
          "A housing plan is easier to manage when it does not use every available cedi. Set aside a reserve for moving, essential household items, routine care, and costs you could not predict at the start.",
          "Use calculators and example budgets as planning aids only. Ask an independent financial professional about your circumstances before taking on a major commitment.",
        ],
      },
    ],
  },
  {
    slug: "choose-a-home-that-fits-your-routine",
    title: "Choose a home that fits your everyday routine",
    excerpt: "A simple way to compare location, access, services, and the practical details that matter after move-in.",
    category: "Choosing a home",
    readTime: "4 min read",
    image: IMG.village,
    sections: [
      {
        heading: "Begin with the week you actually live",
        paragraphs: [
          "Write down the places you travel to most often, who needs to reach them, and how you usually get there. School, work, family, markets, healthcare, and public transport can all shape whether a location works day to day.",
          "Think about the times you travel, not only the distance on a map. If you can, visit the area at different times and check typical routes yourself.",
        ],
      },
      {
        heading: "Check the essentials at the site",
        paragraphs: [
          "Ask about water, electricity, drainage, road access, connectivity, and waste services. Confirm which services are available now, which are planned, and who is responsible for any connection or ongoing charge.",
          "For land, understand access and boundaries. For a completed home, look at ventilation, natural light, water pressure, drainage, and visible maintenance needs.",
        ],
      },
      {
        heading: "Compare options with the same questions",
        paragraphs: [
          "It is easy to focus on a striking feature and overlook a daily inconvenience. Use a short list of priorities and give every home the same checks so you can compare them fairly.",
        ],
        points: [
          "Travel time and access in your normal routine",
          "What is included in the price and ongoing costs",
          "Condition, maintenance, and services",
          "Documents, boundaries, and the next steps before commitment",
        ],
      },
      {
        heading: "Take time to verify",
        paragraphs: [
          "A viewing is a chance to ask questions, not a reason to rush. Request the documents you need, confirm answers in writing, and get independent professional advice where it is appropriate.",
          "The right choice is the one that works for your priorities and budget, not simply the one that looks best in a photo.",
        ],
      },
    ],
  },
];
