import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canAccessSettings } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./_components/ProfileForm";
import { CompanyConfigForm } from "./_components/CompanyConfigForm";
import { StaffAssignmentsForm } from "./_components/StaffAssignmentsForm";
import { updateProfile, updateCompanyConfig } from "./actions";
import { TwoFactorForm } from "./_components/TwoFactorForm";
import { UserPlus, Building2, Users } from "lucide-react";

export const metadata = {
  title: "Settings | UMS Hub",
};

export default async function HubSettingsPage() {
  const { user } = await getSession();
  if (!user) redirect("/login");

  const scope = { role: user.role, userId: user.id, assignedClientIds: user.assignedClientIds };
  if (!canAccessSettings(scope)) {
    redirect("/hub");
  }

  const [hubUsers, companyConfig, allClients] = await Promise.all([
    prisma.user.findMany({
      orderBy: { email: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        assignedClients: { include: { client: { select: { companyName: true, id: true } } } },
      },
    }),
    prisma.companyConfig.findFirst(),
    prisma.client.findMany({
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
  ]);

  const staffUsers = hubUsers.filter((u) => u.role === "STAFF");

  return (
    <section className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Settings</h1>
      <p className="mt-2 text-sm text-(--hub-muted)">
        Manage your profile, users, and app configuration.
      </p>

      <div className="mt-8 space-y-8">
        {/* Profile */}
        <div className="rounded-xl border border-(--hub-border-light) bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
            >
              {(user.name?.[0] ?? user.email[0]).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-(--hub-text)">Profile</h2>
              <p className="text-sm text-(--hub-muted)">
                Update your display name. Avatar uses your initial.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <ProfileForm action={updateProfile} defaultName={user.name} />
          </div>
        </div>

        {/* 2FA */}
        <TwoFactorForm twoFactorEnabled={user.twoFactorEnabled} />

        {/* Users (admin only) */}
        <div className="rounded-xl border border-(--hub-border-light) bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary)/10">
                <Users className="h-5 w-5" style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-(--hub-text)">Users</h2>
                <p className="text-sm text-(--hub-muted)">
                  Hub users and their roles. Invite new users via Supabase Dashboard.
                </p>
              </div>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-(--hub-border-light) bg-white px-4 py-2 text-sm font-medium text-(--hub-text) hover:bg-black/5"
            >
              <UserPlus className="h-4 w-4" />
              Add user (Supabase)
            </a>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="hub-table min-w-[500px]">
              <thead>
                <tr>
                  <th className="text-(--hub-muted)">Email</th>
                  <th className="text-(--hub-muted)">Name</th>
                  <th className="text-(--hub-muted)">Role</th>
                  <th className="text-(--hub-muted)">Status</th>
                  <th className="text-(--hub-muted)">Clients</th>
                </tr>
              </thead>
              <tbody>
                {hubUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-(--hub-muted)">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  hubUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="font-medium text-(--hub-text)">{u.email}</td>
                      <td className="text-(--hub-muted)">{u.name ?? "—"}</td>
                      <td>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.role === "ADMIN"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            u.isActive ? "text-green-600" : "text-(--hub-muted)"
                          }
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-(--hub-muted)">
                        {u.role === "ADMIN"
                          ? "All"
                          : u.assignedClients.length > 0
                            ? u.assignedClients.length > 2
                              ? `${u.assignedClients.slice(0, 2).map((a) => a.client.companyName).join(", ")} & ${u.assignedClients.length - 2} more`
                              : u.assignedClients.map((a) => a.client.companyName).join(", ")
                            : "None"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Company / App configuration */}
        <div className="rounded-xl border border-(--hub-border-light) bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary)/10">
              <Building2 className="h-5 w-5" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-(--hub-text)">
                Company & defaults
              </h2>
              <p className="text-sm text-(--hub-muted)">
                Company name, support email, default currency, and invoice
                settings. Used for branding and invoice emails.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <CompanyConfigForm
              action={updateCompanyConfig}
              config={companyConfig}
            />
          </div>
        </div>

        {/* Staff client assignments */}
        <div className="rounded-xl border border-(--hub-border-light) bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary)/10">
              <UserPlus className="h-5 w-5" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-(--hub-text)">
                Staff client assignments
              </h2>
              <p className="text-sm text-(--hub-muted)">
                Assign clients to staff members. Staff only see their assigned
                clients in the Hub.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <StaffAssignmentsForm
              staffUsers={staffUsers}
              allClients={allClients}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
