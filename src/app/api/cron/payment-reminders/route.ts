import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const token = auth?.replace(/^Bearer\s+/i, "").trim();
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const config = await prisma.companyConfig.findFirst();
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000";

  const invoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["SENT", "OVERDUE"] },
      client: { email: { not: null } },
    },
    include: {
      client: true,
      lineItems: { orderBy: { createdAt: "asc" } },
    },
  });

  const sent: { type: string; invoice: string }[] = [];
  const errors: string[] = [];

  for (const inv of invoices) {
    const dueDate = inv.dueDate;
    const dueDateOnly = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate()
    );
    const isOverdue = dueDateOnly < startOfToday;
    const dueIn7Days =
      !isOverdue &&
      dueDateOnly >= startOfToday &&
      dueDateOnly <= new Date(in7Days.getFullYear(), in7Days.getMonth(), in7Days.getDate());

    let reminderType: "due_soon" | "overdue" | null = null;
    if (isOverdue) {
      if (!inv.lastReminderAt || inv.lastReminderAt < startOfToday) {
        reminderType = "overdue";
      }
    } else if (dueIn7Days) {
      const daysUntilDue = Math.ceil(
        (dueDateOnly.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (daysUntilDue <= 3) {
        if (!inv.lastReminderAt || inv.lastReminderAt < startOfToday) {
          reminderType = "due_soon";
        }
      }
    }

    if (reminderType) {
      const portalUrl = inv.portalToken
        ? `${baseUrl}/portal/invoice/${inv.portalToken}`
        : null;
      const result = await sendPaymentReminderEmail(
        inv,
        config?.companyName ?? null,
        config?.supportEmail ?? null,
        portalUrl,
        reminderType
      );

      if (result.success) {
        await prisma.invoice.update({
          where: { id: inv.id },
          data: { lastReminderAt: now },
        });
        sent.push({ type: reminderType, invoice: inv.invoiceNumber });
      } else if (result.error) {
        errors.push(`${inv.invoiceNumber}: ${result.error}`);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    sent: sent.length,
    reminders: sent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
