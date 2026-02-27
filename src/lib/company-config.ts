import { prisma } from "@/lib/prisma";

export async function getCompanyConfig() {
  return prisma.companyConfig.findFirst();
}
