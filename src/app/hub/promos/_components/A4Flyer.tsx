import type { CardVariant } from "./BuildItCard";

const FLYER_W = 794;
const FLYER_H = 1123;
const HEADER_H = 196;
const BANNER_H = 26;
const FOOTER_H = 62;
const CONTENT_H = FLYER_H - HEADER_H - BANNER_H - FOOTER_H; // 839
const RED = "#C8102E";
const DARK = "#1e1e1e";

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

/** Large, properly spaced price block matching BuildItCard style. */
function PriceBlock({
  price,
  wasPrice,
  unit,
  maxSize,
}: {
  price: number;
  wasPrice: number | null;
  unit: string;
  maxSize: number;
}) {
  const { whole, cents } = splitPrice(price);
  const was = wasPrice != null ? splitPrice(wasPrice) : null;
  const ps = Math.max(24, Math.min(maxSize, 90));
  const cs = Math.round(ps * 0.38);
  const us = Math.max(8, Math.round(cs * 0.72));
  const ws = Math.round(ps * 0.60);
  const wcs = Math.round(ws * 0.40);
  const ls = 9;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {was && (
        <>
          <span style={{ fontSize: ls, fontWeight: 900, color: RED, textTransform: "uppercase" as const, letterSpacing: "0.08em", lineHeight: 1 }}>WAS</span>
          <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1, marginBottom: 4 }}>
            <span style={{ fontSize: ws, fontWeight: 900, color: "#aaa", lineHeight: 0.9, textDecoration: "line-through" }}>{was.whole}</span>
            <span style={{ fontSize: wcs, fontWeight: 800, color: "#aaa", textDecoration: "line-through", marginTop: 1, marginLeft: 1, lineHeight: 1 }}>{was.cents}</span>
          </div>
          <span style={{ fontSize: ls, fontWeight: 900, color: RED, textTransform: "uppercase" as const, letterSpacing: "0.08em", lineHeight: 1 }}>NOW</span>
        </>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1 }}>
        <span style={{ fontSize: ps, fontWeight: 900, color: "#111", lineHeight: 0.88 }}>{whole}</span>
        <div style={{ display: "flex", flexDirection: "column", marginTop: Math.round(ps * 0.05), marginLeft: 2 }}>
          <span style={{ fontSize: cs, fontWeight: 800, color: "#111", lineHeight: 1 }}>{cents}</span>
          <span style={{ fontSize: us, color: "#666", lineHeight: 1.2, marginTop: 2 }}>{unit}</span>
        </div>
      </div>
    </div>
  );
}

/** Multi-variant price list. */
function VariantBlock({
  variants,
  unit,
  maxSize,
}: {
  variants: CardVariant[];
  unit: string;
  maxSize: number;
}) {
  const ls = Math.max(9, Math.min(13, Math.round(maxSize * 0.28)));
  const ps = Math.max(16, Math.min(maxSize, 30));
  const cs = Math.round(ps * 0.42);
  const ws = Math.round(ps * 0.75);
  const wcs = Math.round(ws * 0.42);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {variants.map((v, i) => {
        const now = splitPrice(v.promoPrice);
        const was = v.originalPrice != null && v.originalPrice > 0 ? splitPrice(v.originalPrice) : null;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: i < variants.length - 1 ? 6 : 0,
              borderBottom: i < variants.length - 1 ? "1px solid rgba(0,0,0,0.08)" : undefined,
            }}
          >
            <div style={{ fontSize: ls, fontWeight: 700, color: "#333", lineHeight: 1.25, maxWidth: "50%", overflow: "hidden" }}>
              {v.label}
              {v.description && (
                <div style={{ fontSize: Math.max(8, ls - 2), fontWeight: 400, color: "#6b7280", whiteSpace: "pre-line" as const, marginTop: 1 }}>
                  {v.description}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
              {was && (
                <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1 }}>
                  <span style={{ fontSize: ws, fontWeight: 900, color: "#aaa", lineHeight: 0.9, textDecoration: "line-through" }}>{was.whole}</span>
                  <span style={{ fontSize: wcs, fontWeight: 800, color: "#aaa", textDecoration: "line-through", marginTop: 1, marginLeft: 1 }}>{was.cents}</span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1 }}>
                <span style={{ fontSize: ps, fontWeight: 900, color: "#111", lineHeight: 0.9 }}>{now.whole}</span>
                <div style={{ display: "flex", flexDirection: "column", marginTop: Math.round(ps * 0.05), marginLeft: 1 }}>
                  <span style={{ fontSize: cs, fontWeight: 800, color: "#111", lineHeight: 1 }}>{now.cents}</span>
                  <span style={{ fontSize: Math.max(7, Math.round(cs * 0.7)), color: "#666", lineHeight: 1.2 }}>{unit}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Horizontal cell — image on left, details on right.
 * Used for 2-col layout (≤ 8 products per page).
 */
function ProductCellH({
  product,
  cellW,
  cellH,
}: {
  product: A4FlyerProduct;
  cellW: number;
  cellH: number;
}) {
  const price = product.priceOverride != null ? product.priceOverride : product.productPrice;
  const wasPrice = product.originalPrice != null && product.originalPrice > 0 ? product.originalPrice : null;
  const isMulti = product.productVariants != null && product.productVariants.length >= 2;
  const unit = product.productUnit ?? "each";

  // Image takes ~42% of the cell width
  const imageW = Math.round(cellW * 0.42);
  const pad = 16; // info section horizontal padding (each side)
  const padV = 16; // info section vertical padding (each side)

  const baseNameSize =
    product.productName.length <= 10 ? 20
    : product.productName.length <= 18 ? 17
    : product.productName.length <= 28 ? 14
    : 12;
  // Scale name font up when cells are tall; baseline reference = 170px
  const cellScale = cellH / 170;
  const nameFontSize = Math.min(38, Math.max(baseNameSize, Math.round(baseNameSize * cellScale)));

  // Estimate lines: short names fit in 1 line, longer names wrap to 2
  const nameLines = product.productName.length <= 12 ? 1 : 2;
  const estimatedTopH = nameFontSize * 1.25 * nameLines + (product.productVariant && !isMulti ? 22 : 0);
  const priceAreaH = cellH - padV * 2 - estimatedTopH - 12;
  const maxPriceSize = Math.max(26, Math.min(90, Math.floor(priceAreaH * (wasPrice ? 0.24 : 0.38))));

  return (
    <div style={{ width: cellW, height: cellH, display: "flex", background: "#fff", overflow: "hidden" }}>
      {/* Product image — white background so transparent/white images look clean */}
      <div
        style={{
          width: imageW,
          height: cellH,
          flexShrink: 0,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: 8,
          boxSizing: "border-box" as const,
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
          <span style={{ color: "#ccc", fontSize: 11 }}>No image</span>
        )}
      </div>

      {/* Product info */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: cellH,
          padding: `${padV}px ${pad}px`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box" as const,
        }}
      >
        {/* Product name */}
        <div style={{ fontSize: nameFontSize, fontWeight: 900, color: "#111", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
          {product.productName}
        </div>

        {/* Variant description (single-variant or plain description) */}
        {product.productVariant && !isMulti && (
          <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.45, marginTop: 4, whiteSpace: "pre-line" as const }}>
            {product.productVariant}
          </div>
        )}

        {/* Price block — sits directly below name / variant */}
        <div style={{ marginTop: 12 }}>
          {isMulti ? (
            <VariantBlock variants={product.productVariants!} unit={unit} maxSize={maxPriceSize} />
          ) : (
            <PriceBlock price={price} wasPrice={wasPrice} unit={unit} maxSize={maxPriceSize} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Vertical cell — image on top, details below.
 * Used for 3-col layout (> 8 products per page).
 */
function ProductCellV({
  product,
  cellW,
  cellH,
}: {
  product: A4FlyerProduct;
  cellW: number;
  cellH: number;
}) {
  const price = product.priceOverride != null ? product.priceOverride : product.productPrice;
  const wasPrice = product.originalPrice != null && product.originalPrice > 0 ? product.originalPrice : null;
  const isMulti = product.productVariants != null && product.productVariants.length >= 2;
  const unit = product.productUnit ?? "each";

  const imgH = Math.round(cellH * 0.52);
  const infoH = cellH - imgH;
  const pad = 9;

  const baseNameSize =
    product.productName.length <= 12 ? 13
    : product.productName.length <= 22 ? 11
    : 9;
  const cellScale = cellH / 170;
  const nameFontSize = Math.min(22, Math.max(baseNameSize, Math.round(baseNameSize * cellScale)));

  const nameLines = product.productName.length <= 14 ? 1 : 2;
  const estimatedTopH = nameFontSize * 1.25 * nameLines + (product.productVariant && !isMulti ? 16 : 0);
  const priceAreaH = infoH - pad * 2 - estimatedTopH - 8;
  const maxPriceSize = Math.max(20, Math.min(52, Math.floor(priceAreaH * (wasPrice ? 0.22 : 0.36))));

  return (
    <div style={{ width: cellW, height: cellH, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>
      <div
        style={{
          height: imgH,
          flexShrink: 0,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: 6,
          boxSizing: "border-box" as const,
        }}
      >
        {product.productImageData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.productImageData} alt={product.productName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        ) : (
          <span style={{ color: "#ccc", fontSize: 10 }}>No image</span>
        )}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: `${pad}px ${pad + 1}px`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box" as const,
        }}
      >
        <div style={{ fontSize: nameFontSize, fontWeight: 900, color: "#111", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
          {product.productName}
        </div>
        {product.productVariant && !isMulti && (
          <div style={{ fontSize: 9, color: "#6b7280", lineHeight: 1.35, marginTop: 3, whiteSpace: "pre-line" as const }}>
            {product.productVariant}
          </div>
        )}
        <div style={{ marginTop: 8 }}>
          {isMulti ? (
            <VariantBlock variants={product.productVariants!} unit={unit} maxSize={maxPriceSize} />
          ) : (
            <PriceBlock price={price} wasPrice={wasPrice} unit={unit} maxSize={maxPriceSize} />
          )}
        </div>
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

  // 2 columns for up to 8 products (horizontal cells, Canva-like);
  // 3 columns beyond that (vertical cells).
  const cols = products.length <= 8 ? 2 : 3;
  // Account for the 1px column separator so total width stays within FLYER_W
  const cellW = Math.floor((FLYER_W - (cols - 1)) / cols);
  const rows = Math.max(1, Math.ceil(products.length / cols));
  const cellH = Math.min(380, Math.floor(CONTENT_H / rows));
  const gridH = cellH * rows;
  // Vertically centre the grid if it's shorter than the content area
  const gridTopPad = Math.max(0, Math.floor((CONTENT_H - gridH) / 2));

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
      <div style={{ width: FLYER_W, height: HEADER_H, background: "#e5e7eb", overflow: "hidden", flexShrink: 0 }}>
        {headerImageData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={headerImageData} alt="" style={{ width: "100%", height: "100%", objectFit: "fill" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
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
        <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, textAlign: "center" as const, letterSpacing: "0.025em", lineHeight: 1 }}>
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
          overflow: "hidden",
        }}
      >
        {Array.from({ length: rows }).map((_, rowIdx) => {
          const rowProducts = products.slice(rowIdx * cols, rowIdx * cols + cols);
          const isIncomplete = rowProducts.length < cols;
          return (
            <div
              key={rowIdx}
              style={{
                display: "flex",
                justifyContent: isIncomplete ? "center" : "flex-start",
              }}
            >
              {rowProducts.map((product, colIdx) => (
                <div key={colIdx}>
                  {cols <= 2 ? (
                    <ProductCellH product={product} cellW={cellW} cellH={cellH} />
                  ) : (
                    <ProductCellV product={product} cellW={cellW} cellH={cellH} />
                  )}
                </div>
              ))}
            </div>
          );
        })}
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
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {storeAddress && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                  <LocationIcon />
                  <span style={{ color: "rgba(255,255,255,0.90)", fontSize: 11, lineHeight: 1.35, maxWidth: 400 }}>{storeAddress}</span>
                </div>
              )}
              {storePhone && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                  <PhoneIcon />
                  <span style={{ color: "rgba(255,255,255,0.90)", fontSize: 11, lineHeight: 1.35 }}>{storePhone}</span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/client-logo/buildit-white.png" alt="Build It" style={{ height: 34, objectFit: "contain" }} crossOrigin="anonymous" />
              {storeName && (
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.08em", lineHeight: 1 }}>
                  {storeName}
                </span>
              )}
            </div>
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/client-logo/buildit-white.png" alt="Build It" style={{ height: 44, objectFit: "contain" }} crossOrigin="anonymous" />
        )}
      </div>
    </div>
  );
}
