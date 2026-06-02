import { SignUp } from "@clerk/nextjs";

// User identity is request-specific; never prerender this route.
export const dynamic = "force-dynamic";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-6 text-center text-sm text-muted-foreground">
        Authentication is not configured.
      </main>
    );
  }
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <SignUp />
    </main>
  );
}
