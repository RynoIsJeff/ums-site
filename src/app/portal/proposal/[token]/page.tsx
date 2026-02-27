import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCompanyConfig } from "@/lib/company-config";
import { SignProposalForm } from "./SignProposalForm";

type PageProps = { params: Promise<{ token: string }> };

export const metadata = {
  title: "Proposal | UMS",
};

export default async function PortalProposalPage({ params }: PageProps) {
  const { token } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { portalToken: token },
    include: { client: true },
  });

  if (!proposal) notFound();

  if (proposal.status === "SIGNED") {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 text-center">
            <h1 className="text-xl font-semibold text-green-800">Already signed</h1>
            <p className="mt-2 text-slate-600">
              This proposal was signed on{" "}
              {proposal.signedAt?.toLocaleDateString("en-ZA", { dateStyle: "long" })}.
            </p>
            <Link href="/" className="mt-4 inline-block text-(--primary) hover:underline">
              Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (proposal.status === "REJECTED") {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 text-center">
            <h1 className="text-xl font-semibold text-slate-800">Proposal declined</h1>
            <p className="mt-2 text-slate-600">This proposal has been declined.</p>
            <Link href="/" className="mt-4 inline-block text-(--primary) hover:underline">
              Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const config = await getCompanyConfig();

  return (
    <div
      className="min-h-screen bg-slate-50 py-12 px-4"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-6 text-white" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm mb-4"
            >
              Back to site
            </Link>
            <div className="flex items-start gap-4">
              <Image
                src="/ums-logo.svg"
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 object-contain opacity-90"
              />
              <div>
                <h1 className="text-xl font-bold">
                  {config?.companyName || "Proposal"}
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  {proposal.title}
                </p>
                <p className="text-white/70 text-sm mt-0.5">
                  {proposal.client.companyName}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
              {proposal.content}
            </div>

            {proposal.status === "SENT" && (
              <SignProposalForm token={token} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
