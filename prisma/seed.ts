import dotenv from "dotenv";
import path from "path";

// Prisma CLI only loads .env. Load .env.local first so seed works when vars are there.
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config(); // .env as fallback

import { PrismaClient, Role, ClientStatus, BillingFrequency } from "@prisma/client";

const prisma = new PrismaClient();

/** Create or update app User for UMS Hub. Supabase Auth holds the password; this row links by email for role/assignments. */
async function ensureBootstrapUser() {
  const email = (
    process.env.HUB_BOOTSTRAP_EMAIL ?? "admin@ultimatemarketingsmash.com"
  )
    .trim()
    .toLowerCase();

  const role =
    (process.env.HUB_BOOTSTRAP_ROLE ?? "ADMIN").toUpperCase() === "STAFF"
      ? Role.STAFF
      : Role.ADMIN;

  // Placeholder hash; auth is handled by Supabase. Only used if you ever fall back to credentials.
  const placeholderHash =
    "$2a$12$placeholder.supabase.auth.only.hash.not.used";

  await prisma.user.upsert({
    where: { email },
    update: {
      role,
      isActive: true,
      twoFactorEnabled: false,
    },
    create: {
      email,
      passwordHash: placeholderHash,
      role,
      name: "UMS Bootstrap Admin",
      isActive: true,
      twoFactorEnabled: false,
    },
  });
}

async function ensureDefaultServicePlans() {
  const plans = [
    {
      name: "Starter",
      monthlyPrice: 3500,
      description: "Basic monthly retainer plan.",
    },
    {
      name: "Growth",
      monthlyPrice: 8500,
      description: "Growth-focused retainer plan.",
    },
    {
      name: "Scale",
      monthlyPrice: 18500,
      description: "High-touch scale retainer plan.",
    },
  ];

  for (const plan of plans) {
    await prisma.servicePlan.upsert({
      where: { name: plan.name },
      update: {
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        currency: "ZAR",
        isActive: true,
      },
      create: {
        name: plan.name,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        currency: "ZAR",
        isActive: true,
      },
    });
  }
}

async function seedExampleClient() {
  if (process.env.SEED_SAMPLE_DATA !== "true") return;

  const growth = await prisma.servicePlan.findUnique({
    where: { name: "Growth" },
  });

  const client = await prisma.client.upsert({
    where: { id: "seed-acme-client-id" },
    update: {
      companyName: "Acme Retail Group",
      contactPerson: "Jane Doe",
      email: "ops@acme.example",
      phone: "+27 82 555 0101",
      billingAddress: "42 Sample Street, Durban, South Africa",
      planLabel: "Growth",
      billingFrequency: BillingFrequency.MONTHLY,
      retainerAmount: 8500,
      status: ClientStatus.ACTIVE,
      servicePlanId: growth?.id ?? undefined,
    },
    create: {
      id: "seed-acme-client-id",
      companyName: "Acme Retail Group",
      contactPerson: "Jane Doe",
      email: "ops@acme.example",
      phone: "+27 82 555 0101",
      billingAddress: "42 Sample Street, Durban, South Africa",
      planLabel: "Growth",
      billingFrequency: BillingFrequency.MONTHLY,
      retainerAmount: 8500,
      startDate: new Date(),
      renewalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: ClientStatus.ACTIVE,
      servicePlanId: growth?.id ?? undefined,
    },
  });

  await prisma.clientContact.upsert({
    where: { id: "seed-acme-primary-contact-id" },
    update: {
      name: "Jane Doe",
      email: "ops@acme.example",
      phone: "+27 82 555 0101",
      isPrimary: true,
    },
    create: {
      id: "seed-acme-primary-contact-id",
      clientId: client.id,
      name: "Jane Doe",
      email: "ops@acme.example",
      phone: "+27 82 555 0101",
      isPrimary: true,
    },
  });
}

async function main() {
  await ensureBootstrapUser();
  await ensureDefaultServicePlans();
  await seedExampleClient();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Prisma seed failed.", error);
    await prisma.$disconnect();
    process.exit(1);
  });
