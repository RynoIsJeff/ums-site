import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Fetch company config with a 60-second server-side cache.
 * Since updateCompanyConfig() calls revalidatePath("/hub"), Next.js
 * will invalidate cached fetches for hub pages on the next request,
 * ensuring fresh config data is served after any update.
 */
export const getCompanyConfig = unstable_cache(
  async () => prisma.companyConfig.findFirst(),
  ["company-config"],
  { revalidate: 60 }
);
