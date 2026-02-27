"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

const TimeEntrySchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  taskId: z.string().optional(),
  description: z.string().min(1, "Description is required").max(2000),
  hours: z.string().transform((s) => parseFloat(s)).pipe(z.number().min(0.01).max(24)),
  date: z.string().min(1, "Date is required"),
  billable: z.string().optional().transform((s) => s === "on" || s === "true"),
});

export type TimeEntryFormState = { error?: string };

export async function createTimeEntry(
  _prev: TimeEntryFormState,
  formData: FormData
): Promise<TimeEntryFormState> {
  const { scope, user } = await requireHubAuth();

  const raw = {
    clientId: (formData.get("clientId") as string)?.trim(),
    taskId: (formData.get("taskId") as string) || undefined,
    description: (formData.get("description") as string)?.trim(),
    hours: (formData.get("hours") as string) || "0",
    date: (formData.get("date") as string) || "",
    billable: formData.get("billable"),
  };

  const parsed = TimeEntrySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { clientId, taskId, description, hours, date, billable } = parsed.data;

  if (!canAccessClient(scope, clientId)) {
    return { error: "Access denied to this client." };
  }

  if (taskId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { clientId: true },
    });
    if (!task || task.clientId !== clientId) {
      return { error: "Task must belong to the selected client." };
    }
  }

  await prisma.timeEntry.create({
    data: {
      clientId,
      userId: user.id,
      taskId: taskId || null,
      description,
      hours: new Decimal(hours),
      date: new Date(date),
      billable: billable ?? true,
    },
  });

  revalidatePath("/hub/time");
  revalidatePath("/hub/clients/[id]");
  redirect("/hub/time");
}
