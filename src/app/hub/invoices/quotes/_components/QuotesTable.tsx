import Link from "next/link";
import { StatusBadge } from "@/app/hub/_components/StatusBadge";
import { MarkQuoteSentButton } from "./MarkQuoteSentButton";
import { DeleteQuoteButton } from "./DeleteQuoteButton";
import { DuplicateQuoteButton } from "./DuplicateQuoteButton";
import { ConvertQuoteButton } from "./ConvertQuoteButton";
import type { QuoteStatus } from "@prisma/client";

type QuoteRow = {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  issueDate: Date;
  validUntil: Date;
  totalAmount: string | number;
  convertedInvoiceId: string | null;
  client: { id: string; companyName: string };
};

const DELETABLE: QuoteStatus[] = ["DRAFT", "DECLINED", "EXPIRED"];

export function QuotesTable({ quotes }: { quotes: QuoteRow[] }) {
  const now = new Date();

  return (
    <div className="overflow-x-auto">
      <table className="hub-table min-w-[760px]">
        <thead>
          <tr>
            <th>Number</th>
            <th>Client</th>
            <th>Quote date</th>
            <th>Valid until</th>
            <th>Amount</th>
            <th>Status</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {quotes.map((q) => {
            const lapsed = q.status === "SENT" && q.validUntil < now;
            return (
              <tr key={q.id}>
                <td>
                  <Link
                    href={`/hub/invoices/quotes/${q.id}`}
                    className="font-medium text-(--hub-text) hover:underline"
                  >
                    {q.quoteNumber}
                  </Link>
                </td>
                <td>
                  <Link
                    href={`/hub/clients/${q.client.id}`}
                    className="text-(--hub-muted) hover:underline"
                  >
                    {q.client.companyName}
                  </Link>
                </td>
                <td className="text-(--hub-text)">
                  {q.issueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
                </td>
                <td className={lapsed ? "text-amber-700" : "text-(--hub-text)"}>
                  {q.validUntil.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
                  {lapsed && <span className="ml-1 text-xs">(lapsed)</span>}
                </td>
                <td className="text-(--hub-text)">
                  R {Number(q.totalAmount).toLocaleString("en-ZA")}
                </td>
                <td>
                  <StatusBadge status={q.status} />
                </td>
                <td className="whitespace-nowrap text-right">
                  <span className="inline-flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                    <Link
                      href={`/api/hub/quotes/${q.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-(--hub-muted) hover:underline"
                    >
                      View
                    </Link>
                    <a
                      href={`/api/hub/quotes/${q.id}/pdf?download=1`}
                      download
                      className="text-(--hub-muted) hover:underline"
                    >
                      Download
                    </a>
                    {q.status === "DRAFT" && (
                      <Link
                        href={`/hub/invoices/quotes/${q.id}/edit`}
                        className="text-(--hub-muted) hover:underline"
                      >
                        Edit
                      </Link>
                    )}
                    {q.status === "DRAFT" && <MarkQuoteSentButton quoteId={q.id} />}
                    {q.status === "ACCEPTED" && <ConvertQuoteButton quoteId={q.id} compact />}
                    {q.status === "CONVERTED" && q.convertedInvoiceId && (
                      <Link
                        href={`/hub/invoices/${q.convertedInvoiceId}`}
                        className="text-(--hub-muted) hover:underline"
                      >
                        Invoice
                      </Link>
                    )}
                    <DuplicateQuoteButton quoteId={q.id} compact />
                    {DELETABLE.includes(q.status) && (
                      <DeleteQuoteButton quoteId={q.id} quoteNumber={q.quoteNumber} compact />
                    )}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
