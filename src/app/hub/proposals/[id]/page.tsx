import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { canAccessClient, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ProposalForm } from "../_components/ProposalForm";
import { updateProposal } from "../actions";
import { SendProposalButton } from "../_components/SendProposalButton";

export const metadata = {
  title: "Proposal | UMS Hub",
};

export default async function ProposalDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await getSession();
  if (!user) return null;

  const { id } = await params;
  const raw = await searchParams;

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { client: { select: { id: true, companyName: true } } },
  });

  if (!proposal || !canAccessClient({ role: user.role, userId: user.id, assignedClientIds: user.assignedClientIds }, proposal.clientId)) {
    notFound();
  }

  const scope = toAuthScope(user);
  const clients = await prisma.client.findMany({
    where: clientWhere(scope),
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true },
  });

  const portalUrl = typeof raw.portalUrl === "string" ? raw.portalUrl : undefined;

  return (
    <section className="py-10">
      <div className="mb-6">
        <Link href="/hub/proposals" className="text-sm text-(--hub-muted) hover:text-(--hub-text)">
          ← Proposals
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">
            {proposal.title}
          </h1>
          <p className="mt-2 text-sm text-(--hub-muted)">
            {proposal.client.companyName} ·{" "}
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              proposal.status === "DRAFT" ? "bg-slate-100 text-slate-800" :
              proposal.status === "SENT" ? "bg-amber-100 text-amber-800" :
              proposal.status === "SIGNED" ? "bg-green-100 text-green-800" :
              "bg-red-100 text-red-800"
            }`}>
              {proposal.status}
            </span>
          </p>
        </div>
      </div>

      {proposal.status === "DRAFT" ? (
        <div className="mt-6 rounded-xl border border-(--hub-border) bg-(--hub-card) p-6">
          <ProposalForm
            action={(prev, fd) => updateProposal(id, prev, fd)}
            clients={clients}
            defaultValues={{
              clientId: proposal.clientId,
              title: proposal.title,
              content: proposal.content,
            }}
            submitLabel="Save changes"
            backHref="/hub/proposals"
          />
          <div className="mt-6 pt-6 border-t border-(--hub-border)">
            <SendProposalButton proposalId={id} />
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {portalUrl && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">Portal link (share with client):</p>
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block break-all text-sm text-green-700 underline"
              >
                {portalUrl}
              </a>
              <p className="mt-2 text-xs text-green-600">
                Copy this link to send to your client for viewing and signing.
              </p>
            </div>
          )}
          {proposal.status === "SENT" && !portalUrl && (
            <div className="rounded-lg border border-(--hub-border) bg-(--hub-card) p-4">
              <p className="text-sm text-(--hub-muted)">
                This proposal has been sent. The portal link was shown when you sent it.
                If you need to resend, create a new proposal or contact support.
              </p>
            </div>
          )}
          <div className="rounded-xl border border-(--hub-border) bg-white p-6">
            <h2 className="text-sm font-medium text-(--hub-muted) mb-2">Content</h2>
            <div className="prose prose-sm max-w-none text-(--hub-text) whitespace-pre-wrap">
              {proposal.content}
            </div>
          </div>
          {proposal.sentAt && (
            <p className="text-sm text-(--hub-muted)">
              Sent {proposal.sentAt.toLocaleDateString("en-ZA", { dateStyle: "long" })}
              {proposal.signedAt && (
                <> · Signed {proposal.signedAt.toLocaleDateString("en-ZA", { dateStyle: "long" })}</>
              )}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
