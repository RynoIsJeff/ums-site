import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canAccessSettings } from "@/lib/rbac";
import { toAuthScope } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/app/hub/_components/Breadcrumbs";
import { Pagination } from "@/app/hub/_components/Pagination";
import { parseListParams, paramsForPagination } from "@/app/hub/_lib/listParams";
import { ClipboardList } from "lucide-react";

export const metadata = {
  title: "Audit Log | UMS Hub",
};

const ACTION_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: "Login",
  LOGIN_FAILED: "Failed login",
  CLIENT_CREATED: "Client created",
  CLIENT_UPDATED: "Client updated",
  CLIENT_DELETED: "Client deleted",
  INVOICE_CREATED: "Invoice created",
  INVOICE_SENT: "Invoice sent",
  PAYMENT_RECORDED: "Payment recorded",
  SOCIAL_POST_SCHEDULED: "Post scheduled",
  SOCIAL_POST_PUBLISHED: "Post published",
};

const ACTION_COLOURS: Record<string, string> = {
  LOGIN_SUCCESS: "bg-green-100 text-green-800",
  LOGIN_FAILED: "bg-red-100 text-red-800",
  CLIENT_DELETED: "bg-red-100 text-red-800",
  INVOICE_SENT: "bg-blue-100 text-blue-800",
  PAYMENT_RECORDED: "bg-green-100 text-green-800",
  SOCIAL_POST_PUBLISHED: "bg-purple-100 text-purple-800",
};

const BASE_PATH = "/hub/settings/audit-log";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await getSession();
  if (!user) redirect("/login");

  const scope = toAuthScope(user);
  if (!canAccessSettings(scope)) redirect("/hub");

  const raw = await searchParams;
  const params = parseListParams(raw as Record<string, string | undefined>);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        actorUser: { select: { email: true, name: true } },
        client: { select: { companyName: true } },
      },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.auditLog.count(),
  ]);

  return (
    <section className="py-10">
      <Breadcrumbs
        items={[
          { label: "Hub", href: "/hub" },
          { label: "Settings", href: "/hub/settings" },
          { label: "Audit log" },
        ]}
        className="mb-6"
      />

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary)/10">
          <ClipboardList className="h-5 w-5" style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Audit log</h1>
          <p className="mt-1 text-sm text-(--hub-muted)">
            A record of significant actions taken in UMS Hub.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-(--hub-border-light) bg-white shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-(--hub-muted)" />
            <p className="mt-3 text-sm font-medium text-(--hub-text)">No audit events yet</p>
            <p className="mt-1 text-sm text-(--hub-muted)">Events will appear here as the team uses the Hub.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="hub-table min-w-[640px]">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>User</th>
                  <th>Client</th>
                  <th>Entity</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap text-(--hub-muted)">
                      {log.createdAt.toLocaleDateString("en-ZA", { dateStyle: "medium" })}{" "}
                      <span className="text-xs">
                        {log.createdAt.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          ACTION_COLOURS[log.action] ?? "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="text-(--hub-text)">
                      {log.actorUser ? (log.actorUser.name ?? log.actorUser.email) : <span className="text-(--hub-muted)">System</span>}
                    </td>
                    <td className="text-(--hub-muted)">
                      {log.client?.companyName ?? "—"}
                    </td>
                    <td className="text-(--hub-muted) text-xs font-mono">
                      {log.entityType && log.entityId
                        ? `${log.entityType} ${log.entityId.slice(0, 8)}…`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        totalItems={total}
        currentPage={params.page}
        pageSize={params.pageSize}
        basePath={BASE_PATH}
        searchParams={paramsForPagination(params) as Record<string, string | undefined>}
      />
    </section>
  );
}
