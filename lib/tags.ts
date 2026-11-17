// ============================================================
// Tag catalogue. People are only matched with someone on the SAME tag.
// The slug is what's stored and matched on; never change a slug once live
// (labels can change freely). Keep the list curated so people land on the
// same tags instead of splitting across spellings.
// ============================================================

export interface Tag {
  slug: string;
  label: string;
}

export interface TagCategory {
  id: string;
  label: string;
  /** Sticky-note colour class used for this category's chips (full class name for Tailwind) */
  note: string;
  tags: Tag[];
}

const t = (label: string): Tag => ({
  slug: label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
  label,
});

export const TAG_CATEGORIES: TagCategory[] = [
  {
    id: "industry",
    label: "Industries & trade",
    note: "bg-note-yellow",
    tags: [
      "Textile", "Garments & Apparel", "Handicrafts", "Leather", "Jewellery", "Furniture",
      "Packaging", "Chemicals", "Steel & Metals", "Plastics", "Electronics Manufacturing", "Auto Parts",
      "Import & Export", "Wholesale & Distribution", "Logistics", "Agriculture", "Dairy", "Food Processing",
      "Spices", "Tea & Coffee", "Organic Farming", "Pharma", "Medical Devices", "Construction",
      "Real Estate", "Interior Design", "Architecture", "Renewable Energy", "Hospitality",
      "Restaurants & Cafes", "Travel & Tourism", "Retail", "Local Shops", "Beauty & Salon",
      "Fitness & Gyms", "Healthcare", "Education & Coaching", "Printing",
    ].map(t),
  },
  {
    id: "tech",
    label: "Tech",
    note: "bg-note-blue",
    tags: [
      "SaaS", "AI & ML", "Web Development", "Mobile Apps", "Cybersecurity", "Cloud & DevOps",
      "Data Science", "Blockchain & Web3", "Gaming", "AR & VR", "IoT", "Robotics", "No-code",
      "Open Source", "UI & UX Design", "Product Management",
    ].map(t),
  },
  {
    id: "business",
    label: "Business & startups",
    note: "bg-note-pink",
    tags: [
      "Startup Ideas", "Fundraising", "Bootstrapping", "Marketing", "Digital Marketing", "SEO",
      "Sales", "E-commerce", "D2C Brands", "Dropshipping", "Franchise", "Freelancing", "Side Hustles",
      "Small Business", "Family Business", "Legal & Compliance", "GST & Taxes", "Accounting",
      "HR & Hiring", "Customer Support",
    ].map(t),
  },
  {
    id: "finance",
    label: "Money & finance",
    note: "bg-note-green",
    tags: [
      "Fintech", "Stock Market", "Mutual Funds", "Crypto", "Personal Finance", "Insurance",
      "Banking", "Real Estate Investing",
    ].map(t),
  },
  {
    id: "creators",
    label: "Creators & media",
    note: "bg-note-orange",
    tags: [
      "Content Creation", "YouTube", "Instagram", "Podcasting", "Writing & Blogging", "Photography",
      "Video Editing", "Music", "Film & Animation", "Graphic Design", "Fashion Design",
    ].map(t),
  },
  {
    id: "careers",
    label: "Careers & learning",
    note: "bg-note-blue",
    tags: [
      "Job Hunting", "Interview Prep", "Career Switch", "College Students", "Govt Exams",
      "Study Abroad", "Learning English", "Coding Interviews", "MBA", "Internships",
    ].map(t),
  },
  {
    id: "impact",
    label: "Social impact",
    note: "bg-note-green",
    tags: [
      "Climate", "Sustainability", "NGOs & Social Impact", "Rural Development",
      "Women Entrepreneurs", "Mental Health",
    ].map(t),
  },
];

export const ALL_TAGS: Tag[] = TAG_CATEGORIES.flatMap(c => c.tags);

const BY_SLUG = new Map(ALL_TAGS.map(tag => [tag.slug, tag]));
const CATEGORY_BY_SLUG = new Map(TAG_CATEGORIES.flatMap(c => c.tags.map(tag => [tag.slug, c] as const)));

export function getTag(slug: string | null | undefined): Tag | undefined {
  return slug ? BY_SLUG.get(slug) : undefined;
}

export function isValidTag(slug: string | null | undefined): slug is string {
  return !!slug && BY_SLUG.has(slug);
}

/** Sticky-note colour for a tag, from its category */
export function tagNote(slug: string | null | undefined): string {
  return (slug && CATEGORY_BY_SLUG.get(slug)?.note) || "bg-note-yellow";
}

/** Shown first in the picker; a mix of busy, broad tags so new visitors match quickly */
export const POPULAR_TAG_SLUGS = [
  "startup-ideas", "textile", "saas", "ai-and-ml", "e-commerce", "real-estate",
  "stock-market", "content-creation", "job-hunting", "agriculture", "digital-marketing", "import-and-export",
];

export const POPULAR_TAGS: Tag[] = POPULAR_TAG_SLUGS.map(s => BY_SLUG.get(s)).filter((x): x is Tag => !!x);
