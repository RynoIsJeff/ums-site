import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "STAFF";
  twoFactorEnabled: boolean;
  /** Only for STAFF: IDs of clients this user can access. ADMIN has null (all clients). */
  assignedClientIds: string[] | null;
};

export type AuthScope = {
  userId: string;
  role: "ADMIN" | "STAFF";
  /** ADMIN: null (all clients). STAFF: list of client IDs they are assigned to. */
  assignedClientIds: string[] | null;
};

// Cache the DB user lookup per email for 60 seconds so repeated server action
// calls (e.g. saving multiple products) don't each pay a full round-trip.
function fetchAppUser(email: string) {
  return unstable_cache(
    () =>
      prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          twoFactorEnabled: true,
          assignedClients: { select: { clientId: true } },
        },
      }),
    ["hub-app-user", email],
    { revalidate: 60 },
  )();
}

/** Use getClaims() in proxy/middleware; use this in Server Components / Actions to get authenticated app user with RBAC scope. */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { user: null as AppUser | null };

  const appUser = await fetchAppUser(user.email.trim().toLowerCase());

  if (!appUser || !appUser.isActive)
    return { user: null as AppUser | null };

  const assignedClientIds =
    appUser.role === "ADMIN"
      ? null
      : appUser.assignedClients.map((a) => a.clientId);

  return {
    user: {
      id: appUser.id,
      email: appUser.email,
      name: appUser.name,
      role: appUser.role,
      twoFactorEnabled: appUser.twoFactorEnabled,
      assignedClientIds,
    } satisfies AppUser,
  };
}

/** Build AuthScope from AppUser (for use in RBAC helpers). */
export function toAuthScope(user: AppUser): AuthScope {
  return {
    userId: user.id,
    role: user.role,
    assignedClientIds: user.assignedClientIds,
  };
}

/** For server actions: get current user + scope or throw. Ensures RBAC scope is available. */
export async function requireHubAuth(): Promise<{ user: AppUser; scope: AuthScope }> {
  const { user } = await getSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return { user, scope: toAuthScope(user) };
}
