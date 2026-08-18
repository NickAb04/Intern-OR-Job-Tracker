import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/nav/top-nav";
import { QueryProvider } from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "";
  const displayName = user.user_metadata?.display_name ?? null;

  return (
    <QueryProvider>
      <TooltipProvider delay={1500}>
        <div className="flex min-h-screen flex-col">
          <TopNav email={email} displayName={displayName} />
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
        <Toaster richColors position="bottom-right" />
      </TooltipProvider>
    </QueryProvider>
  );
}
