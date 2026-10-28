import { SignUp } from "@clerk/nextjs";
import AuthShell, { clerkAppearance } from "@/components/layout/AuthShell";

export default function SignUpPage() {
  return (
    <AuthShell note="got an idea? join in ↓">
      <SignUp appearance={clerkAppearance} />
    </AuthShell>
  );
}
