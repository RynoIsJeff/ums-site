import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ProposalForm } from "../_components/ProposalForm";
import { createProposal } from "../actions";

export const metadata = {
  title: "New Proposal | UMS Hub",
};

export default async function NewProposalPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const clients = await prisma.client.findMany({
    where: clientWhere(scope),
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true },
  });

  return (
    <section className="py-10">
      <div className="mb-6">
        <Link href="/hub/proposals" className="text-sm text-(--hub-muted) hover:text-(--hub-text)">
          Back to Proposals
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">
        New proposal
      </h1>
      <p className="mt-2 text-sm text-(--hub-muted)">
        Create a draft proposal or contract to send to your client.
      </p>
      <div className="mt-6 rounded-xl border border-(--hub-border) bg-(--hub-card) p-6">
        <ProposalForm
          action={createProposal}
          clients={clients}
          submitLabel="Create proposal (draft)"
          backHref="/hub/proposals"
        />
      </div>
    </section>
  );
}
