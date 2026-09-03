import type { CardVariant } from "./BuildItCard";

const FLYER_W = 794;
const FLYER_H = 1123;
const HEADER_H = 196;
const BANNER_H = 26;
const FOOTER_H = 62;
const CONTENT_H = FLYER_H - HEADER_H - BANNER_H - FOOTER_H; // 839
const RED = "#C8102E";
const DARK = "#1e1e1e";
const MAX_CELL_H = 420;

function splitPrice(price: number) {
  const [w = "0", c = "00"] = price.toFixed(2).split(".");
  return { whole: w, cents: c };
}

export type A4FlyerProduct = {
  productName: string;
  productUnit?: string | null;
  productVariant?: string | null;
  productVariants?: CardVariant[] | null;
  productPrice: number;
  productImageData: string | null;
  priceOverride?: number | null;
  originalPrice?: number | null;
};

function LocationIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <path d="M7 0C4.24 0 2 2.24 2 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 7 3.5a1.5 1.5 0 0 1 0 3z" fill="white" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z" fill="white" />
    </svg>
  );
}

function ProductCell({ product, cellW, cellH }: { product: A4FlyerProduct; cellW: number; cellH: number }) {
  const price = product.priceOverride != null ? product.priceOverride : product.productPrice;
  const wasPrice = product.originalPrice != null && product.originalPrice > 0 ? product.originalPrice : null;
  const isMulti = product.productVariants != null && product.productVariants.length >= 2;

  const imgH = Math.round(cellH * 0.55);
  const infoH = cellH - imgH;

  const { whole, cents } = splitPrice(price);
  const wasNow = wasPrice ? splitPrice(wasPrice) : null;

  const nameFontSize = product.productName.length <= 12 ? 14 : product.productName.length <= 22 ? 12 : 10;
  const priceSize = Math.max(18, Math.min(32, Math.floor(infoH * 0.26)));
  const centsFontSize = Math.round(priceSize * 0.38);

  return (
    <div
      style={{
        width: cellW,
        height: cellH,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRight: "1px solid rgba(0,0,0,0.09)",
        borderBottom: "1px solid rgba(0,0,0,0.09)",
      }}
    >
      {/* Product image */}
      <div
        style={{
          height: imgH,
          background: "#f9fafb",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {product.productImageData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.productImageData}
            alt={product.productName}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <span style={{ color: "#d1d5db", fontSize: 11 }}>No image</span>
        )}
      </div>

      {/* Product info */}
      <div
        style={{
          padding: "7px 9px 6px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: nameFontSize,
            fontWeight: 900,
            color: "#111",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          {product.productName}
        </div>
        {product.productVariant && !isMulti && (
          <div
            style={{
              fontSize: 9,
              color: "#6b7280",
              lineHeight: 1.3,
              marginTop: 2,
              whiteSpace: "pre-line" as const,
            }}
          >
            {product.productVariant}
          </div>
        )}

        {isMulti ? (
          <div
            style={{
              marginTop: 4,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 3,
              overflow: "hidden",
            }}
          >
            {product.productVariants!.map((v, i) => {
              const vNow = splitPrice(v.promoPrice);
              const vWas =
                v.originalPrice != null && v.originalPrice > 0
                  ? splitPrice(v.originalPrice)
                  : null;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: i < product.productVariants!.length - 1 ? 3 : 0,
                    borderBottom:
                      i < product.productVariants!.length - 1
                        ? "1px solid rgba(0,0,0,0.07)"
                        : undefined,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#333",
                      lineHeight: 1.2,
                      maxWidth: "55%",
                      overflow: "hidden",
                    }}
                  >
                    {v.label}
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    {vWas && (
                      <span
                        style={{
                          fontSize: 8,
                          color: "#999",
                          textDecoration: "line-through",
                        }}
                      >
                        R{vWas.whole}.{vWas.cents}
                      </span>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#111" }}>
                      R{vNow.whole}.{vNow.cents}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              marginTop: "auto",
              paddingTop: 4,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {wasNow && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    color: RED,
                    letterSpacing: "0.07em",
                    lineHeight: 1,
                  }}
                >
                  WAS
                </span>
                <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1 }}>
                  <span
                    style={{
                      fontSize: Math.round(priceSize * 0.58),
                      fontWeight: 900,
                      color: "#999",
                      lineHeight: 0.9,
                      textDecoration: "line-through",
                    }}
                  >
                    {wasNow.whole}
                  </span>
                  <span
                    style={{
                      fontSize: Math.round(centsFontSize * 0.85),
                      fontWeight: 800,
                      color: "#999",
                      textDecoration: "line-through",
                      marginTop: 1,
                      marginLeft: 1,
                    }}
                  >
                    {wasNow.cents}
                  </span>
                </div>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: wasNow ? 5 : 0 }}>
              {wasNow && (
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    color: RED,
                    letterSpacing: "0.07em",
                    lineHeight: 1,
                  }}
                >
                  NOW
                </span>
              )}
              <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1 }}>
                <span
                  style={{
                    fontSize: priceSize,
                    fontWeight: 900,
                    color: "#111",
                    lineHeight: 0.9,
                  }}
                >
                  {whole}
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: Math.round(priceSize * 0.05),
                    marginLeft: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: centsFontSize,
                      fontWeight: 800,
                      color: "#111",
                      lineHeight: 1,
                    }}
                  >
                    {cents}
                  </span>
                  <span
                    style={{
                      fontSize: Math.max(7, Math.round(centsFontSize * 0.7)),
                      color: "#555",
                      lineHeight: 1.2,
                    }}
                  >
                    {product.productUnit ?? "each"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export type A4FlyerProps = {
  headerImageData: string | null;
  promoDateFrom: Date;
  promoDateTo: Date;
  storeName?: string | null;
  storeAddress?: string | null;
  storePhone?: string | null;
  products: A4FlyerProduct[];
};

export function A4Flyer({
  headerImageData,
  promoDateFrom,
  promoDateTo,
  storeName,
  storeAddress,
  storePhone,
  products,
}: A4FlyerProps) {
  const fromDay = promoDateFrom.getDate();
  const toDay = promoDateTo.getDate();
  const fromMon = promoDateFrom.toLocaleDateString("en-ZA", { month: "long" });
  const toMon = promoDateTo.toLocaleDateString("en-ZA", { month: "long" });
  const toYear = promoDateTo.getFullYear();
  const dateStr =
    fromMon === toMon
      ? `Promotion valid from ${fromDay} - ${toDay} ${toMon} ${toYear}. T's and C's apply.`
      : `Promotion valid from ${fromDay} ${fromMon} - ${toDay} ${toMon} ${toYear}. T's and C's apply.`;

  const hasStoreInfo = !!(storeName || storeAddress || storePhone);

  const cols = products.length <= 1 ? 1 : products.length === 2 ? 2 : 3;
  const cellW = Math.floor(FLYER_W / cols);
  const rows = Math.max(1, Math.ceil(products.length / cols));
  const cellH = Math.min(MAX_CELL_H, Math.floor(CONTENT_H / rows));
  const gridH = cellH * rows;
  const gridTopPad = Math.floor((CONTENT_H - gridH) / 2);

  // Pad products array to fill complete rows
  const padded: (A4FlyerProduct | null)[] = [...products];
  while (padded.length % cols !== 0) padded.push(null);

  return (
    <div
      style={{
        width: FLYER_W,
        height: FLYER_H,
        fontFamily: "Helvetica, Arial, sans-serif",
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
          width: FLYER_W,
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
            style={{ width: "100%", height: "100%", objectFit: "fill" }}
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
          width: FLYER_W,
          height: BANNER_H,
          background: DARK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          padding: "0 14px",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            textAlign: "center",
            letterSpacing: "0.025em",
            lineHeight: 1,
          }}
        >
          {dateStr}
        </span>
      </div>

      {/* Products grid */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          paddingTop: gridTopPad,
          borderLeft: "1px solid rgba(0,0,0,0.09)",
          borderTop: "1px solid rgba(0,0,0,0.09)",
          overflow: "hidden",
        }}
      >
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} style={{ display: "flex" }}>
            {padded.slice(rowIdx * cols, rowIdx * cols + cols).map((product, colIdx) =>
              product ? (
                <ProductCell key={colIdx} product={product} cellW={cellW} cellH={cellH} />
              ) : (
                <div
                  key={colIdx}
                  style={{
                    width: cellW,
                    height: cellH,
                    background: "#fff",
                    borderRight: "1px solid rgba(0,0,0,0.09)",
                    borderBottom: "1px solid rgba(0,0,0,0.09)",
                  }}
                />
              )
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          width: FLYER_W,
          height: FOOTER_H,
          background: RED,
          display: "flex",
          alignItems: "center",
          justifyContent: hasStoreInfo ? "space-between" : "center",
          padding: "0 20px",
          flexShrink: 0,
        }}
      >
        {hasStoreInfo ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, justifyContent: "center" }}>
              {storeAddress && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                  <LocationIcon />
                  <span
                    style={{
                      color: "rgba(255,255,255,0.90)",
                      fontSize: 11,
                      lineHeight: 1.35,
                      maxWidth: 400,
                    }}
                  >
                    {storeAddress}
                  </span>
                </div>
              )}
              {storePhone && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                  <PhoneIcon />
                  <span style={{ color: "rgba(255,255,255,0.90)", fontSize: 11, lineHeight: 1.35 }}>
                    {storePhone}
                  </span>
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/client-logo/buildit-white.png"
                alt="Build It"
                style={{ height: 34, objectFit: "contain" }}
                crossOrigin="anonymous"
              />
              {storeName && (
                <span
                  style={{
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.08em",
                    lineHeight: 1,
                  }}
                >
                  {storeName}
                </span>
              )}
            </div>
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/client-logo/buildit-white.png"
            alt="Build It"
            style={{ height: 44, objectFit: "contain" }}
            crossOrigin="anonymous"
          />
        )}
      </div>
    </div>
  );
}
