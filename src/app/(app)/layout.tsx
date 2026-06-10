import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-6xl lg:border-x lg:border-ink-line">
      <SideNav />
      <main className="min-w-0 flex-1 pb-24 lg:pb-12">{children}</main>
      <BottomNav />
    </div>
  );
}
