import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "social-media";
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("name") ?? "upload";
  const ext = (filename.split(".").pop() ?? "bin").toLowerCase();
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const supabase = createAdminClient();
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  // Call REST API directly so we can set a 1-hour expiry.
  // The JS SDK hardcodes 5 minutes which isn't enough for large video uploads.
  const tokenRes = await fetch(
    `${supabaseUrl}/storage/v1/object/upload/sign/${BUCKET}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: ONE_HOUR_MS }),
    }
  );

  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: err.message ?? "Failed to create upload URL" },
      { status: 500 }
    );
  }

  const { token } = await tokenRes.json() as { token: string };
  const signedUrl = `${supabaseUrl}/storage/v1/object/upload/sign/${BUCKET}/${path}?token=${encodeURIComponent(token)}`;
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({ signedUrl, publicUrl: urlData.publicUrl });
}
