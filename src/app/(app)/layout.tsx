import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppTopNav from "@/components/AppTopNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  return (
    <div className="min-h-[100dvh]">
      <AppTopNav />
      <main className="mx-auto w-full max-w-[1200px] pb-16">{children}</main>
    </div>
  );
}
