import { SignIn } from "@clerk/nextjs";
import AuthShell, { clerkAppearance } from "@/components/layout/AuthShell";

export default function SignInPage() {
  return (
    <AuthShell note="welcome back!">
      <SignIn appearance={clerkAppearance} />
    </AuthShell>
  );
}
