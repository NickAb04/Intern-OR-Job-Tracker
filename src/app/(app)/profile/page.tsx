import type { Metadata } from "next";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Profile | JobTracker",
  description: "Manage your JobTracker account settings.",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information.
          </p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {user?.user_metadata?.display_name ?? "User"}
                </CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Display Name
                </p>
                <p className="text-sm">
                  {user?.user_metadata?.display_name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-sm">{user?.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Member since
                </p>
                <p className="text-sm">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-MY", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
