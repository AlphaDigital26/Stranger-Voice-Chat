import type { Metadata } from "next";

// App screens (queue, call, contacts…) are private and must not be indexed.
// Marketing pages live in app/(marketing) and stay indexable.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
