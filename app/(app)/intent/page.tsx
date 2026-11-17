import IntentClient from "./IntentClient";

// /intent?tag=textile preselects a tag (used by tag links on the landing page)
type SearchParams = Promise<{ tag?: string }>;

export default async function IntentPage({ searchParams }: { searchParams: SearchParams }) {
  const { tag } = await searchParams;
  return <IntentClient initialTag={tag} />;
}
