"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import type { TaskStatus, RecurrencePattern } from "@prisma/client";

const recurrencePatterns: RecurrencePattern[] = ["NONE", "DAILY", "WEEKLY", "MONTHLY"];

const TaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional(),
  clientId: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]),
  recurrencePattern: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY"]),
  recurrenceInterval: z.string().transform((s) => Math.max(1, Math.min(99, parseInt(s, 10) || 1))),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
});

export type TaskFormState = { error?: string };

function addRecurrence(
  from: Date,
  pattern: RecurrencePattern,
  interval: number
): Date {
  const d = new Date(from);
  if (pattern === "DAILY") d.setDate(d.getDate() + interval);
  else if (pattern === "WEEKLY") d.setDate(d.getDate() + 7 * interval);
  else if (pattern === "MONTHLY") d.setMonth(d.getMonth() + interval);
  return d;
}

export async function createTask(
  _prev: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const { scope, user } = await requireHubAuth();

  const raw = {
    title: (formData.get("title") as string)?.trim(),
    description: (formData.get("description") as string)?.trim() || undefined,
    clientId: (formData.get("clientId") as string) || undefined,
    status: formData.get("status") ?? "TODO",
    recurrencePattern: formData.get("recurrencePattern") ?? "NONE",
    recurrenceInterval: formData.get("recurrenceInterval") ?? "1",
    startDate: (formData.get("startDate") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
  };

  const parsed = TaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { title, description, clientId, status, recurrencePattern, recurrenceInterval, startDate, dueDate } = parsed.data;

  if (clientId && !canAccessClient(scope, clientId)) {
    return { error: "Access denied to this client." };
  }

  const start = startDate ? new Date(startDate) : dueDate ? new Date(dueDate) : new Date();
  const due = dueDate ? new Date(dueDate) : startDate ? new Date(startDate) : null;

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      clientId: clientId || null,
      status: status as TaskStatus,
      recurrencePattern: recurrencePattern as RecurrencePattern,
      recurrenceInterval,
      startDate: start,
      dueDate: due,
      createdById: user.id,
    },
  });

  if (recurrencePattern !== "NONE" && due) {
    const base = new Date(due);
    await prisma.taskOccurrence.create({
      data: { taskId: task.id, dueDate: base },
    });
    for (let i = 1; i < 12; i++) {
      const next = addRecurrence(base, recurrencePattern as RecurrencePattern, recurrenceInterval * i);
      await prisma.taskOccurrence.create({
        data: { taskId: task.id, dueDate: next },
      });
    }
  } else if (due) {
    await prisma.taskOccurrence.create({
      data: { taskId: task.id, dueDate: due },
    });
  }

  revalidatePath("/hub/tasks");
  revalidatePath("/hub/clients/[id]");
  redirect("/hub/tasks");
}

export async function updateTask(
  taskId: string,
  _prev: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const { scope, user } = await requireHubAuth();

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { occurrences: { orderBy: { dueDate: "asc" } } },
  });
  if (!task) return { error: "Task not found." };
  if (task.clientId && !canAccessClient(scope, task.clientId)) {
    return { error: "Access denied." };
  }

  const raw = {
    title: (formData.get("title") as string)?.trim(),
    description: (formData.get("description") as string)?.trim() || undefined,
    clientId: (formData.get("clientId") as string) || undefined,
    status: formData.get("status") ?? task.status,
    recurrencePattern: formData.get("recurrencePattern") ?? task.recurrencePattern,
    recurrenceInterval: formData.get("recurrenceInterval") ?? String(task.recurrenceInterval),
    startDate: (formData.get("startDate") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
  };

  const parsed = TaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { title, description, clientId, status, recurrencePattern, recurrenceInterval, startDate, dueDate } = parsed.data;

  if (clientId && !canAccessClient(scope, clientId)) {
    return { error: "Access denied to this client." };
  }

  const start = startDate ? new Date(startDate) : dueDate ? new Date(dueDate) : task.startDate;
  const due = dueDate ? new Date(dueDate) : startDate ? new Date(startDate) : task.dueDate;

  await prisma.task.update({
    where: { id: taskId },
    data: {
      title,
      description: description || null,
      clientId: clientId || null,
      status: status as TaskStatus,
      recurrencePattern: recurrencePattern as RecurrencePattern,
      recurrenceInterval,
      startDate: start,
      dueDate: due,
      completedAt: status === "DONE" ? new Date() : task.completedAt,
    },
  });

  revalidatePath("/hub/tasks");
  revalidatePath(`/hub/tasks/${taskId}`);
  revalidatePath("/hub/clients/[id]");
  redirect(`/hub/tasks/${taskId}`);
}

export async function setTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<TaskFormState> {
  const { scope } = await requireHubAuth();

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { clientId: true },
  });
  if (!task || (task.clientId && !canAccessClient(scope, task.clientId))) {
    return { error: "Task not found or access denied." };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === "DONE" ? new Date() : null,
    },
  });

  revalidatePath("/hub/tasks");
  revalidatePath(`/hub/tasks/${taskId}`);
  revalidatePath("/hub/clients/[id]");
  return {};
}

export async function completeOccurrence(occurrenceId: string): Promise<TaskFormState> {
  const { scope, user } = await requireHubAuth();

  const occ = await prisma.taskOccurrence.findUnique({
    where: { id: occurrenceId },
    include: { task: true },
  });
  if (!occ || (occ.task.clientId && !canAccessClient(scope, occ.task.clientId))) {
    return { error: "Occurrence not found or access denied." };
  }
  if (occ.status !== "PENDING") {
    return { error: "Occurrence already completed or skipped." };
  }

  await prisma.taskOccurrence.update({
    where: { id: occurrenceId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      completedById: user.id,
    },
  });

  const task = occ.task;
  if (task.recurrencePattern !== "NONE") {
    const nextDue = addRecurrence(occ.dueDate, task.recurrencePattern, task.recurrenceInterval);
    const existing = await prisma.taskOccurrence.findFirst({
      where: { taskId: task.id, dueDate: { gte: nextDue } },
    });
    if (!existing) {
      await prisma.taskOccurrence.create({
        data: { taskId: task.id, dueDate: nextDue },
      });
    }
  }

  revalidatePath("/hub/tasks");
  revalidatePath(`/hub/tasks/${task.id}`);
  revalidatePath("/hub/clients/[id]");
  return {};
}

export async function skipOccurrence(occurrenceId: string): Promise<TaskFormState> {
  const { scope } = await requireHubAuth();

  const occ = await prisma.taskOccurrence.findUnique({
    where: { id: occurrenceId },
    include: { task: true },
  });
  if (!occ || (occ.task.clientId && !canAccessClient(scope, occ.task.clientId))) {
    return { error: "Occurrence not found or access denied." };
  }
  if (occ.status !== "PENDING") {
    return { error: "Occurrence already completed or skipped." };
  }

  await prisma.taskOccurrence.update({
    where: { id: occurrenceId },
    data: { status: "SKIPPED" },
  });

  revalidatePath("/hub/tasks");
  revalidatePath(`/hub/tasks/${occ.task.id}`);
  revalidatePath("/hub/clients/[id]");
  return {};
}
