import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ClientTabs } from "./_components/ClientTabs";
import { DeleteClientButton } from "./_components/DeleteClientButton";
import { Breadcrumbs } from "@/app/hub/_components/Breadcrumbs";
import { StatusBadge } from "@/app/hub/_components/StatusBadge";
import { toNum } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    select: { companyName: true },
  });
  if (!client) return { title: "Client | UMS Hub" };
  return { title: `${client.companyName} | UMS Hub` };
}

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-ZA", { dateStyle: "medium" });
}

export default async function HubClientDetailPage({ params, searchParams }: PageProps) {
  const { id: clientId } = await params;
  const { tab = "overview" } = await searchParams;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  if (!canAccessClient(scope, clientId)) notFound();

  const [client, clientInvoices, clientSocialPages, clientSocialPosts, clientTasks] = await Promise.all([
    prisma.client.findFirst({
      where: { id: clientId },
      include: {
        contacts: { orderBy: { isPrimary: "desc" } },
      },
    }),
    prisma.invoice.findMany({
      where: { clientId },
      orderBy: [{ status: "asc" }, { dueDate: "desc" }],
      select: { id: true, invoiceNumber: true, dueDate: true, totalAmount: true, status: true },
    }),
    prisma.socialPage.findMany({
      where: { socialAccount: { clientId } },
      select: { id: true, pageName: true },
    }),
    prisma.socialPost.findMany({
      where: { clientId },
      orderBy: [{ scheduledFor: "desc" }, { createdAt: "desc" }],
      select: { id: true, caption: true, status: true, scheduledFor: true, publishedAt: true },
    }),
    prisma.task.findMany({
      where: { clientId },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      select: { id: true, title: true, status: true, dueDate: true, recurrencePattern: true },
    }),
  ]);

  if (!client) notFound();

  const outstandingTotal = clientInvoices
    .filter((inv) => inv.status === "SENT" || inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + toNum(inv.totalAmount), 0);
  const counts = {
    draft: clientInvoices.filter((i) => i.status === "DRAFT").length,
    sent: clientInvoices.filter((i) => i.status === "SENT").length,
    paid: clientInvoices.filter((i) => i.status === "PAID").length,
    overdue: clientInvoices.filter((i) => i.status === "OVERDUE").length,
  };
  const outstandingInvoices = clientInvoices.filter(
    (i) => i.status === "SENT" || i.status === "OVERDUE"
  );

  return (
    <section className="py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <Breadcrumbs
          items={[
            { label: "Hub", href: "/hub" },
            { label: "Clients", href: "/hub/clients" },
            { label: client.companyName },
          ]}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/hub/clients/${client.id}/edit`}
            className="rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium hover:bg-black/5"
          >
            Edit
          </Link>
          <DeleteClientButton clientId={client.id} companyName={client.companyName} />
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">{client.companyName}</h1>
      <p className="mt-1 text-sm text-black/70">
        {client.contactPerson}
        {client.email ? ` · ${client.email}` : ""}
      </p>

      <div className="mt-6">
        <ClientTabs clientId={client.id} />
        <div className="rounded-b-xl border border-t-0 border-black/10 bg-white p-6">
          {tab === "overview" && (
            <div className="grid gap-6 sm:grid-cols-2">
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-black/60">Status</dt>
                  <dd><StatusBadge status={client.status} /></dd>
                </div>
                <div>
                  <dt className="font-medium text-black/60">Contact person</dt>
                  <dd>{client.contactPerson}</dd>
                </div>
                <div>
                  <dt className="font-medium text-black/60">Email</dt>
                  <dd>{client.email || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-black/60">Phone</dt>
                  <dd>{client.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-black/60">VAT number</dt>
                  <dd>{client.vatNumber || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-black/60">Billing address</dt>
                  <dd className="whitespace-pre-wrap">{client.billingAddress || "—"}</dd>
                </div>
              </dl>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-black/60">Plan</dt>
                  <dd>{client.planLabel || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-black/60">Billing frequency</dt>
                  <dd>{client.billingFrequency || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-black/60">Retainer amount</dt>
                  <dd>
                    {client.retainerAmount != null
                      ? `R ${Number(client.retainerAmount).toLocaleString()}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-black/60">Start date</dt>
                  <dd>{formatDate(client.startDate)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-black/60">Renewal date</dt>
                  <dd>{formatDate(client.renewalDate)}</dd>
                </div>
                {client.notes && (
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-black/60">Notes</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-black/80">{client.notes}</dd>
                  </div>
                )}
              </dl>
              {client.contacts.length > 0 && (
                <div className="sm:col-span-2">
                  <h3 className="text-sm font-medium text-black/60">Contacts</h3>
                  <ul className="mt-2 space-y-2">
                    {client.contacts.map((c) => (
                      <li key={c.id} className="text-sm">
                        {c.name}
                        {c.isPrimary && (
                          <span className="ml-2 text-xs text-black/50">(primary)</span>
                        )}
                        {c.email && ` · ${c.email}`}
                        {c.phone && ` · ${c.phone}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {tab === "billing" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-sm font-medium text-[var(--hub-text)]">Billing summary</h3>
                <div className="flex gap-2">
                  <Link
                    href="/hub/billing"
                    className="text-sm font-medium text-[var(--primary)] hover:underline"
                  >
                    Billing dashboard
                  </Link>
                  <span className="text-[var(--hub-muted)]">·</span>
                  <Link
                    href="/hub/invoices/new"
                    className="text-sm font-medium text-[var(--primary)] hover:underline"
                  >
                    New invoice
                  </Link>
                  <span className="text-[var(--hub-muted)]">·</span>
                  <Link
                    href={`/hub/clients/${clientId}?tab=invoices`}
                    className="text-sm font-medium text-[var(--primary)] hover:underline"
                  >
                    All invoices
                  </Link>
                </div>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                <div>
                  <dt className="font-medium text-[var(--hub-muted)]">Renewal date</dt>
                  <dd className="text-[var(--hub-text)]">{formatDate(client.renewalDate)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-[var(--hub-muted)]">Retainer</dt>
                  <dd className="text-[var(--hub-text)]">
                    {client.retainerAmount != null
                      ? `R ${Number(client.retainerAmount).toLocaleString("en-ZA")}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-[var(--hub-muted)]">Outstanding</dt>
                  <dd className="font-medium text-[var(--hub-text)]">
                    R {outstandingTotal.toLocaleString("en-ZA")}
                    {outstandingInvoices.length > 0 && (
                      <span className="ml-1 text-[var(--hub-muted)] font-normal">
                        ({outstandingInvoices.length} invoice
                        {outstandingInvoices.length !== 1 ? "s" : ""})
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-[var(--hub-muted)]">Invoices</dt>
                  <dd className="text-[var(--hub-text)]">
                    {counts.draft > 0 && <span>Draft {counts.draft} · </span>}
                    {counts.sent > 0 && <span>Sent {counts.sent} · </span>}
                    {counts.overdue > 0 && (
                      <span className="text-red-600">Overdue {counts.overdue} · </span>
                    )}
                    {counts.paid > 0 && <span>Paid {counts.paid}</span>}
                    {clientInvoices.length === 0 && "None"}
                  </dd>
                </div>
              </dl>
              {outstandingInvoices.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[var(--hub-muted)] mb-2">
                    Outstanding invoices
                  </h4>
                  <ul className="divide-y divide-black/5 rounded-lg border border-[var(--hub-border-light)] bg-white">
                    {outstandingInvoices.map((inv) => (
                      <li key={inv.id} className="flex items-center justify-between px-4 py-3">
                        <Link
                          href={`/hub/invoices/${inv.id}`}
                          className="font-medium text-[var(--hub-text)] hover:underline"
                        >
                          {inv.invoiceNumber}
                        </Link>
                        <span className="flex items-center gap-2 text-sm text-[var(--hub-muted)]">
                          due {formatDate(inv.dueDate)} · R{" "}
                          {toNum(inv.totalAmount).toLocaleString("en-ZA")}{" "}
                          <StatusBadge status={inv.status} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {tab === "invoices" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-black/70">Invoices for this client</p>
                <Link href="/hub/invoices/new" className="text-sm font-medium hover:underline">New invoice</Link>
              </div>
              {clientInvoices.length === 0 ? (
                <p className="text-sm text-black/50">No invoices yet.</p>
              ) : (
                <ul className="divide-y divide-black/5">
                  {clientInvoices.map((inv) => (
                    <li key={inv.id} className="py-2 first:pt-0">
                      <Link href={`/hub/invoices/${inv.id}`} className="font-medium hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                      <span className="ml-2 flex items-center gap-2 text-[var(--hub-muted)]">
                        due {formatDate(inv.dueDate)} · R {toNum(inv.totalAmount).toLocaleString("en-ZA")}{" "}
                        <StatusBadge status={inv.status} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {tab === "social" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-black/70">Connected pages</p>
                <Link href="/hub/social" className="text-sm font-medium hover:underline">Social hub</Link>
              </div>
              {clientSocialPages.length === 0 ? (
                <p className="text-sm text-black/50">No Facebook pages connected. Connect one in Social.</p>
              ) : (
                <ul className="list-disc pl-5 text-sm">
                  {clientSocialPages.map((p) => (
                    <li key={p.id}>{p.pageName}</li>
                  ))}
                </ul>
              )}
              <div>
                <p className="text-sm font-medium text-black/70">Posts</p>
                {clientSocialPosts.length === 0 ? (
                  <p className="mt-1 text-sm text-black/50">No posts yet.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {clientSocialPosts.map((post) => (
                      <li key={post.id}>
                        <Link href={`/hub/social/posts/${post.id}`} className="font-medium hover:underline line-clamp-1">
                          {post.caption.slice(0, 50)}{post.caption.length > 50 ? "…" : ""}
                        </Link>
                        <span className="ml-2 text-black/60">
                          {post.status}
                          {post.scheduledFor && ` · ${post.scheduledFor.toLocaleDateString("en-ZA", { dateStyle: "short", timeStyle: "short" })}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link href="/hub/social/posts/new" className="mt-3 inline-block text-sm font-medium hover:underline">New post</Link>
              </div>
            </div>
          )}
          {tab === "tasks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-black/70">Tasks</p>
                <Link href={`/hub/tasks/new?clientId=${clientId}`} className="text-sm font-medium hover:underline">New task</Link>
              </div>
              {clientTasks.length === 0 ? (
                <p className="text-sm text-black/50">No tasks for this client.</p>
              ) : (
                <ul className="space-y-2">
                  {clientTasks.map((task) => (
                    <li key={task.id}>
                      <Link href={`/hub/tasks/${task.id}`} className="font-medium hover:underline">
                        {task.title}
                      </Link>
                      <span className="ml-2 flex items-center gap-2 text-[var(--hub-muted)]">
                        <StatusBadge status={task.status} />
                        {task.dueDate && `· due ${formatDate(task.dueDate)}`}
                        {task.recurrencePattern !== "NONE" && `· ${task.recurrencePattern}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
