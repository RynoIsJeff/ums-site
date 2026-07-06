import type { Decimal } from "@prisma/client/runtime/library";
import { toNum } from "@/lib/utils";

const RED = "#C8102E";
const CARD_W = 540;
const HEADER_H = 205;
const BANNER_H = 40;
const PRODUCT_H = 213;
const FOOTER_H = 82;
const IMG_W = 216;

function formatDate(d: Date, withYear = false) {
  const day = d.getDate();
  const mon = d.toLocaleDateString("en-ZA", { month: "short" });
  return withYear
    ? `${day} ${mon} ${d.getFullYear()}`
    : `${day} ${mon}`;
}

function PriceDisplay({ price }: { price: number }) {
  const whole = Math.floor(price);
  const cents = Math.round((price - whole) * 100)
    .toString()
    .padStart(2, "0");
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 2, lineHeight: 1 }}>
      <span style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: RED }}>R</span>
      <span style={{ fontSize: 52, fontWeight: 800, color: RED, lineHeight: 1 }}>{whole}</span>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: RED, lineHeight: 1 }}>{cents}</span>
        <span style={{ fontSize: 13, color: "#555", marginTop: 2 }}>each</span>
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
  const dateStr = `Promotion valid ${formatDate(promoDateFrom)} – ${formatDate(promoDateTo, true)} · While stocks last. Ts & Cs apply.`;
  const hasStoreInfo = !!(storeName || storeNumber || storeAddress);

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
      <div
        style={{
          width: CARD_W,
          height: HEADER_H,
          background: "#e5e7eb",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {headerImageData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={headerImageData}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: 14,
            }}
          >
            No header image
          </div>
        )}
      </div>

      {/* Date banner */}
      <div
        style={{
          width: CARD_W,
          height: BANNER_H,
          background: RED,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          padding: "0 12px",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {dateStr}
        </span>
      </div>

      {/* Product section */}
      <div
        style={{
          width: CARD_W,
          height: PRODUCT_H,
          display: "flex",
          flexShrink: 0,
          background: "#fff",
        }}
      >
        {/* Product image */}
        <div
          style={{
            width: IMG_W,
            height: PRODUCT_H,
            background: "#f3f4f6",
            flexShrink: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {productImageData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={productImageData}
              alt={productName}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <span style={{ color: "#d1d5db", fontSize: 13 }}>No image</span>
          )}
        </div>

        {/* Product details */}
        <div
          style={{
            flex: 1,
            padding: "16px 16px 12px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#111",
                lineHeight: 1.2,
                textTransform: "uppercase",
              }}
            >
              {productName}
            </div>
            {productVariant && (
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                {productVariant}
              </div>
            )}
          </div>
          {wasPrice != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>WAS</span>
              <span style={{ fontSize: 16, color: "#9ca3af", textDecoration: "line-through", fontWeight: 700 }}>
                R {wasPrice.toFixed(2)}
              </span>
            </div>
          )}
          <PriceDisplay price={price} />
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
          padding: "0 20px",
          flexShrink: 0,
        }}
      >
        {/* Left: store number + address */}
        {hasStoreInfo && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 3,
              flex: 1,
              paddingRight: 12,
            }}
          >
            {storeNumber && (
              <span
                style={{
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                {storeNumber}
              </span>
            )}
            {storeAddress && (
              <span
                style={{
                  color: "rgba(255,255,255,0.88)",
                  fontSize: 10,
                  lineHeight: 1.35,
                }}
              >
                {storeAddress}
              </span>
            )}
          </div>
        )}

        {/* Right: Build It logo + store name below */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/client-logo/buildit.png"
            alt="Build It"
            style={{ height: 38, objectFit: "contain" }}
            crossOrigin="anonymous"
          />
          {storeName && (
            <span
              style={{
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                lineHeight: 1,
              }}
            >
              {storeName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
