import type { Decimal } from "@prisma/client/runtime/library";
import { toNum } from "@/lib/utils";

const RED = "#C8102E";
const CARD_W = 540;
const HEADER_H = 210;
const BANNER_H = 46;
const PRODUCT_H = 222;
const FOOTER_H = 62;
const IMG_W = 210;

function formatDate(d: Date, withYear = false) {
  const day = d.getDate();
  const mon = d.toLocaleDateString("en-ZA", { month: "long" });
  return withYear ? `${day} ${mon} ${d.getFullYear()}` : `${day} ${mon}`;
}

function splitPrice(price: number) {
  const whole = Math.floor(price);
  const cents = Math.round((price - whole) * 100).toString().padStart(2, "0");
  return { whole, cents };
}

function PriceBlock({ price, wasPrice }: { price: number; wasPrice: number | null }) {
  const now = splitPrice(price);
  const was = wasPrice != null ? splitPrice(wasPrice) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {was && (
        <>
          <span style={{ fontSize: 15, fontWeight: 900, color: RED, textTransform: "uppercase" as const, letterSpacing: "0.06em", lineHeight: 1 }}>
            WAS
          </span>
          <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1, marginBottom: 3 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "#888", lineHeight: 0.9, textDecoration: "line-through" }}>
              {was.whole}
            </span>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 2, marginLeft: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#888", lineHeight: 1, textDecoration: "line-through" }}>
                {was.cents}
              </span>
              <span style={{ fontSize: 9, color: "#aaa", marginTop: 1 }}>each</span>
            </div>
          </div>
          <span style={{ fontSize: 15, fontWeight: 900, color: RED, textTransform: "uppercase" as const, letterSpacing: "0.06em", lineHeight: 1 }}>
            NOW
          </span>
        </>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1 }}>
        <span style={{ fontSize: 62, fontWeight: 900, color: "#111", lineHeight: 0.88 }}>
          {now.whole}
        </span>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 3, marginLeft: 2 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#111", lineHeight: 1 }}>
            {now.cents}
          </span>
          <span style={{ fontSize: 10, color: "#666", marginTop: 2, lineHeight: 1 }}>each</span>
        </div>
      </div>
    </div>
  );
}

function ServiceIcons() {
  const wrap: React.CSSProperties = {
    width: 28, height: 28, borderRadius: "50%",
    background: "rgba(0,0,0,0.22)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      {/* Masonry */}
      <div style={wrap}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="0" y="1.5" width="6" height="3" rx="0.4" fill="white"/>
          <rect x="8" y="1.5" width="6" height="3" rx="0.4" fill="white"/>
          <rect x="0" y="6.5" width="3.5" height="3" rx="0.4" fill="white"/>
          <rect x="5" y="6.5" width="4" height="3" rx="0.4" fill="white"/>
          <rect x="10.5" y="6.5" width="3.5" height="3" rx="0.4" fill="white"/>
          <rect x="0" y="11.5" width="6" height="3" rx="0.4" fill="white"/>
          <rect x="8" y="11.5" width="6" height="3" rx="0.4" fill="white"/>
        </svg>
      </div>
      {/* Paint roller */}
      <div style={wrap}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="9" height="5" rx="1" stroke="white" strokeWidth="1.2"/>
          <rect x="3" y="2.5" width="5" height="2" rx="0.3" fill="white" opacity="0.5"/>
          <line x1="5.5" y1="6" x2="5.5" y2="9.5" stroke="white" strokeWidth="1.3"/>
          <rect x="4" y="9.5" width="3" height="3.5" rx="0.5" fill="white"/>
        </svg>
      </div>
      {/* Pipe */}
      <div style={wrap}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="5" width="5" height="4" rx="0.5" stroke="white" strokeWidth="1.2" fill="none"/>
          <line x1="6" y1="7" x2="8.5" y2="7" stroke="white" strokeWidth="1.3"/>
          <circle cx="11" cy="7" r="2.5" stroke="white" strokeWidth="1.2" fill="none"/>
        </svg>
      </div>
      {/* Electrical */}
      <div style={wrap}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <polyline points="8 1 3 7.5 7 7.5 6 13 11 6.5 7 6.5 8 1" fill="rgba(255,255,255,0.45)" stroke="white" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
      </div>
      {/* Tiles */}
      <div style={wrap}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="0.5" y="0.5" width="5.5" height="5.5" rx="0.5" fill="white"/>
          <rect x="8" y="0.5" width="5.5" height="5.5" rx="0.5" fill="white"/>
          <rect x="0.5" y="8" width="5.5" height="5.5" rx="0.5" fill="white"/>
          <rect x="8" y="8" width="5.5" height="5.5" rx="0.5" fill="white"/>
        </svg>
      </div>
    </div>
  );
}

type Props = {
  headerImageData: string | null;
  promoDateFrom: Date;
  promoDateTo: Date;
  storeName?: string | null;
  storeNumber?: string | null;
  storeAddress?: string | null;
  productName: string;
  productVariant?: string | null;
  productPrice: number | Decimal;
  productImageData: string | null;
  priceOverride?: number | Decimal | null;
  originalPrice?: number | Decimal | null;
};

export function BuildItCard({
  headerImageData,
  promoDateFrom,
  promoDateTo,
  storeName,
  storeNumber,
  storeAddress,
  productName,
  productVariant,
  productPrice,
  productImageData,
  priceOverride,
  originalPrice,
}: Props) {
  const price = priceOverride != null ? toNum(priceOverride) : toNum(productPrice);
  const wasPrice = originalPrice != null ? toNum(originalPrice) : null;
  const hasStoreInfo = !!(storeName || storeNumber || storeAddress);
  const dateLine1 = `Promotion valid from ${formatDate(promoDateFrom)} – ${formatDate(promoDateTo, true)}`;

  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_W,
        fontFamily: "Arial, Helvetica, sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        flexShrink: 0,
      }}
    >
      {/* Header image */}
      <div style={{ width: CARD_W, height: HEADER_H, background: "#e5e7eb", overflow: "hidden", flexShrink: 0 }}>
        {headerImageData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={headerImageData}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
            No header image
          </div>
        )}
      </div>

      {/* Date banner — two lines */}
      <div
        style={{
          width: CARD_W,
          height: BANNER_H,
          background: RED,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          padding: "0 16px",
          gap: 3,
        }}
      >
        <span style={{ color: "#fff", fontSize: 10.5, fontWeight: 700, textAlign: "center", letterSpacing: "0.03em", lineHeight: 1.1 }}>
          {dateLine1}
        </span>
        <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 9.5, fontWeight: 500, textAlign: "center", letterSpacing: "0.02em", lineHeight: 1.1 }}>
          While stocks last. T&apos;s and C&apos;s apply.
        </span>
      </div>

      {/* Product section */}
      <div style={{ width: CARD_W, height: PRODUCT_H, display: "flex", flexShrink: 0, background: "#fff" }}>
        {/* Product image */}
        <div
          style={{
            width: IMG_W,
            height: PRODUCT_H,
            background: "#f9fafb",
            flexShrink: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {productImageData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={productImageData} alt={productName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <span style={{ color: "#d1d5db", fontSize: 13 }}>No image</span>
          )}
        </div>

        {/* Product details */}
        <div
          style={{
            flex: 1,
            padding: "12px 14px 10px 14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#111", lineHeight: 1.15, textTransform: "uppercase" }}>
              {productName}
            </div>
            {productVariant && (
              <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 3, lineHeight: 1.4, whiteSpace: "pre-line" }}>
                {productVariant}
              </div>
            )}
          </div>

          <PriceBlock price={price} wasPrice={wasPrice} />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          width: CARD_W,
          height: FOOTER_H,
          background: RED,
          display: "flex",
          alignItems: "center",
          justifyContent: hasStoreInfo ? "space-between" : "center",
          padding: "0 16px",
          flexShrink: 0,
        }}
      >
        {hasStoreInfo ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
              <ServiceIcons />
              {storeAddress && (
                <span style={{ color: "rgba(255,255,255,0.82)", fontSize: 8.5, lineHeight: 1.3 }}>
                  {storeAddress}
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/client-logo/buildit.png" alt="Build It" style={{ height: 28, objectFit: "contain" }} crossOrigin="anonymous" />
              {storeName && (
                <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1 }}>
                  {storeName}
                </span>
              )}
            </div>
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/client-logo/buildit.png" alt="Build It" style={{ height: 38, objectFit: "contain" }} crossOrigin="anonymous" />
        )}
      </div>
    </div>
  );
}
