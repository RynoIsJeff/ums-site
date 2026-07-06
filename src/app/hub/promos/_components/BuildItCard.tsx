import type { Decimal } from "@prisma/client/runtime/library";
import { toNum } from "@/lib/utils";

const RED = "#C8102E";
const DARK = "#1e1e1e";
const CARD_W = 540;
const HEADER_H = 210;
const BANNER_H = 33;
const PRODUCT_H = 213;
const FOOTER_H = 84;
const IMG_W = 220;

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
          <span style={{ fontSize: 14, fontWeight: 900, color: RED, textTransform: "uppercase" as const, letterSpacing: "0.08em", lineHeight: 1 }}>
            WAS
          </span>
          <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1, marginBottom: 4 }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: "#999", lineHeight: 0.9, textDecoration: "line-through" }}>
              {was.whole}
            </span>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 2, marginLeft: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#999", lineHeight: 1, textDecoration: "line-through" }}>
                {was.cents}
              </span>
              <span style={{ fontSize: 8.5, color: "#bbb", marginTop: 1 }}>each</span>
            </div>
          </div>
          <span style={{ fontSize: 14, fontWeight: 900, color: RED, textTransform: "uppercase" as const, letterSpacing: "0.08em", lineHeight: 1 }}>
            NOW
          </span>
        </>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1 }}>
        <span style={{ fontSize: 66, fontWeight: 900, color: "#111", lineHeight: 0.88 }}>
          {now.whole}
        </span>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 4, marginLeft: 2 }}>
          <span style={{ fontSize: 23, fontWeight: 800, color: "#111", lineHeight: 1 }}>
            {now.cents}
          </span>
          <span style={{ fontSize: 10, color: "#555", marginTop: 2, lineHeight: 1 }}>each</span>
        </div>
      </div>
    </div>
  );
}

function ServiceIcons() {
  const wrap: React.CSSProperties = {
    width: 34, height: 34, borderRadius: "50%",
    background: "rgba(0,0,0,0.28)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {/* Masonry */}
      <div style={wrap}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="0" y="1.5" width="7.5" height="3.5" rx="0.5" fill="white"/>
          <rect x="10" y="1.5" width="8" height="3.5" rx="0.5" fill="white"/>
          <rect x="0" y="7.5" width="4" height="3.5" rx="0.5" fill="white"/>
          <rect x="6" y="7.5" width="5" height="3.5" rx="0.5" fill="white"/>
          <rect x="13" y="7.5" width="5" height="3.5" rx="0.5" fill="white"/>
          <rect x="0" y="13.5" width="7.5" height="3.5" rx="0.5" fill="white"/>
          <rect x="10" y="13.5" width="8" height="3.5" rx="0.5" fill="white"/>
        </svg>
      </div>
      {/* Paint roller */}
      <div style={wrap}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="1" y="1" width="12" height="6" rx="1.2" stroke="white" strokeWidth="1.4" fill="none"/>
          <rect x="3.5" y="3" width="7" height="2.5" rx="0.4" fill="white" opacity="0.45"/>
          <line x1="7" y1="7" x2="7" y2="12" stroke="white" strokeWidth="1.5"/>
          <rect x="5" y="12" width="4" height="4.5" rx="0.7" fill="white"/>
        </svg>
      </div>
      {/* Plumbing */}
      <div style={wrap}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="1" y="6.5" width="6" height="5" rx="0.8" stroke="white" strokeWidth="1.4" fill="none"/>
          <line x1="7" y1="9" x2="10" y2="9" stroke="white" strokeWidth="1.5"/>
          <circle cx="13.5" cy="9" r="3.5" stroke="white" strokeWidth="1.4" fill="none"/>
          <circle cx="13.5" cy="9" r="1" fill="white"/>
        </svg>
      </div>
      {/* Electrical */}
      <div style={wrap}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <polygon points="10.5 1 3.5 9.5 9 9.5 7.5 17 14.5 8 9 8 10.5 1" fill="rgba(255,255,255,0.5)" stroke="white" strokeWidth="1.1" strokeLinejoin="round"/>
        </svg>
      </div>
      {/* Tiles */}
      <div style={wrap}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="0.5" y="0.5" width="7" height="7" rx="0.7" fill="white"/>
          <rect x="10.5" y="0.5" width="7" height="7" rx="0.7" fill="white"/>
          <rect x="0.5" y="10.5" width="7" height="7" rx="0.7" fill="white"/>
          <rect x="10.5" y="10.5" width="7" height="7" rx="0.7" fill="white"/>
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

  const fromDay = promoDateFrom.getDate();
  const toDay = promoDateTo.getDate();
  const fromMon = promoDateFrom.toLocaleDateString("en-ZA", { month: "long" });
  const toMon = promoDateTo.toLocaleDateString("en-ZA", { month: "long" });
  const toYear = promoDateTo.getFullYear();
  const dateStr = fromMon === toMon
    ? `Promotion valid from ${fromDay} - ${toDay} ${toMon} ${toYear}. T's and C's apply.`
    : `Promotion valid from ${fromDay} ${fromMon} - ${toDay} ${toMon} ${toYear}. T's and C's apply.`;

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
      {/* Header image — PDF-extracted header incl. "Say Yes" banner + logo bar */}
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

      {/* Date banner — dark charcoal, single line, Build It CI style */}
      <div
        style={{
          width: CARD_W,
          height: BANNER_H,
          background: DARK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          padding: "0 14px",
        }}
      >
        <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, textAlign: "center", letterSpacing: "0.025em", lineHeight: 1 }}>
          {dateStr}
        </span>
      </div>

      {/* Product section */}
      <div style={{ width: CARD_W, height: PRODUCT_H, display: "flex", flexShrink: 0, background: "#fff" }}>
        {/* Product image */}
        <div
          style={{
            width: IMG_W,
            height: PRODUCT_H,
            background: "#fff",
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
            padding: "14px 14px 12px 12px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#111", lineHeight: 1.1, textTransform: "uppercase", letterSpacing: "-0.01em" }}>
              {productName}
            </div>
            {productVariant && (
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 5, lineHeight: 1.45, whiteSpace: "pre-line" }}>
                {productVariant}
              </div>
            )}
          </div>

          <div style={{ marginTop: "auto" }}>
            <PriceBlock price={price} wasPrice={wasPrice} />
          </div>
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
          padding: "0 18px",
          flexShrink: 0,
        }}
      >
        {hasStoreInfo ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, justifyContent: "center" }}>
              <ServiceIcons />
              {storeAddress && (
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 8.5, lineHeight: 1.3, maxWidth: 240 }}>
                  {storeAddress}
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/client-logo/buildit.png" alt="Build It" style={{ height: 34, objectFit: "contain" }} crossOrigin="anonymous" />
              {storeName && (
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1 }}>
                  {storeName}
                </span>
              )}
            </div>
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/client-logo/buildit.png" alt="Build It" style={{ height: 42, objectFit: "contain" }} crossOrigin="anonymous" />
        )}
      </div>
    </div>
  );
}
