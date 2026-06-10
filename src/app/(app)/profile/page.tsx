import { auth } from "@/lib/auth";
import { getUserStats } from "@/lib/queries";
import ProfileView from "./ProfileView";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  const user = session!.user;
  const stats = await getUserStats(user.id);

  return (
    <ProfileView
      user={{
        name: user.name ?? null,
        email: user.email ?? null,
        image: user.image ?? null,
        country: user.country ?? null,
      }}
      stats={stats}
    />
  );
}
