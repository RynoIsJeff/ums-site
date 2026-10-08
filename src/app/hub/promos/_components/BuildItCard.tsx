import type { Decimal } from "@prisma/client/runtime/library";
import { toNum } from "@/lib/utils";

const RED = "#C8102E";
const DARK = "#1e1e1e";
const CARD_W = 540;
const HEADER_H = 196;
const BANNER_H = 26;
const PRODUCT_H = 256;
const FOOTER_H = 62;
const IMG_W = 270;
// Usable width of the text panel (card - image - left/right padding)
const TEXT_PANEL_W = CARD_W - IMG_W - 25;
// Inner height available to the product panel once its padding is removed
const PANEL_INNER_H = PRODUCT_H - 13 - 11;
// Width the price column of a variant row can use, after the label column
const VARIANT_PRICE_W = Math.round(TEXT_PANEL_W * 0.58);
// Helvetica Bold digit width ratio — empirically ~0.65 of font size
const DIGIT_W_RATIO = 0.65;

export type CardVariant = {
  label: string;
  description?: string | null;
  promoPrice: number;
  originalPrice?: number | null;
};

function splitPrice(price: number) {
  const whole = Math.floor(price);
  const cents = Math.round((price - whole) * 100).toString().padStart(2, "0");
  return { whole, cents };
}

/** Compute adaptive font sizes so all content fits regardless of digit count / variant lines / WAS presence. */
function computeSizes(
  name: string,
  variant: string | null | undefined,
  nowWhole: number,
  wasWhole: number | null,
) {
  const digits = String(nowWhole).length;
  const hasWas = wasWhole !== null;
  const variantLines = variant ? variant.split("\n").filter(Boolean).length : 0;

  // Density score: how much content needs to fit
  const score =
    (hasWas ? 3 : 0) +
    (name.length > 22 ? 2 : name.length > 12 ? 1 : 0) +
    variantLines;

  // Scale price down with more digits
  const digitMult =
    digits <= 2 ? 1.12
    : digits === 3 ? 1.0
    : digits === 4 ? 0.88
    : digits === 5 ? 0.77
    : 0.67;

  // Scale price down when lots of content
  const denseMult =
    score <= 1 ? 1.0
    : score <= 3 ? 0.92
    : score <= 5 ? 0.83
    : score <= 7 ? 0.75
    : score <= 9 ? 0.65
    : 0.52;

  // When no WAS, boost price to fill the freed vertical space
  const noWasBoost = hasWas ? 1.0 : 1.3;

  // Hard width cap: digits × charWidth + reserve for cents superscript must fit panel
  // Reserve 2px for marginLeft + account for cents column (≈2 chars × 0.33 of nowSize)
  const widthCap = Math.floor((TEXT_PANEL_W - 2) / ((digits + 0.66) * DIGIT_W_RATIO));
  const sizeCap = Math.min(hasWas ? 100 : 130, widthCap);
  const nowSize = Math.round(Math.min(sizeCap, 90 * digitMult * denseMult * noWasBoost));
  const centsSize = Math.round(nowSize * 0.33);
  const eachSize = Math.round(nowSize * 0.13);

  const wasDigits = wasWhole !== null ? String(wasWhole).length : digits;
  const wasDigitMult =
    wasDigits <= 2 ? 1.12
    : wasDigits === 3 ? 1.0
    : wasDigits === 4 ? 0.88
    : 0.77;
  const wasScale = score > 9 ? 0.33 : 0.44;
  const wasSize = Math.round(90 * wasDigitMult * wasScale);
  const wasCentsSize = Math.round(wasSize * 0.37);

  const baseNameSize =
    name.length <= 14 ? 27
    : name.length <= 22 ? 24
    : name.length <= 32 ? 21
    : 18;
  // Reduce name size when many variant lines are present to reclaim vertical space
  const nameSize =
    variantLines >= 5 ? Math.max(14, baseNameSize - 5)
    : variantLines >= 3 ? Math.max(16, baseNameSize - 2)
    : baseNameSize;

  const variantSize =
    variantLines <= 2 ? 12
    : variantLines <= 4 ? 10
    : variantLines <= 6 ? 9
    : variantLines <= 8 ? 8
    : 7;

  // WAS/NOW label size: shrink at high density to reclaim vertical space
  const labelSize = score > 9 ? 10 : score > 6 ? 12 : 14;

  return { nowSize, centsSize, eachSize, wasSize, wasCentsSize, nameSize, variantSize, variantLines, labelSize };
}

/**
 * Size a variant row from the space it actually gets, not from guessed
 * multipliers: the rows have to share a fixed panel, so derive the price size
 * from the row height and cap it by the width the digits need. Anything that
 * does not fit shrinks rather than being cut off.
 */
function computeMultiVariantSizes(
  variantCount: number,
  hasAnyWas: boolean,
  maxDigits: number,
  availableHeight: number,
) {
  const rowGap = variantCount <= 3 ? 9 : 6;
  const rowH = Math.max(
    16,
    (availableHeight - rowGap * (variantCount - 1)) / variantCount,
  );

  // WAS sits on its own line above NOW, so it takes a slice off the row.
  const wasSize = hasAnyWas ? Math.round(Math.min(14, Math.max(8, rowH * 0.3))) : 0;
  const wasLineH = hasAnyWas ? wasSize * 1.15 + 2 : 0;

  const nowTagSize = hasAnyWas ? Math.round(Math.min(12, Math.max(8, rowH * 0.22))) : 0;
  // Space left for the NOW figure, and the width its digits need beside the tag.
  const byHeight = (rowH - wasLineH) * 0.92;
  const byWidth =
    (VARIANT_PRICE_W - (hasAnyWas ? nowTagSize * 2.6 : 0)) /
    (0.62 * maxDigits + 0.52);
  const nowSize = Math.max(13, Math.min(46, Math.floor(Math.min(byHeight, byWidth))));

  const centsSize = Math.round(nowSize * 0.42);
  const eachSize = Math.max(7, Math.round(nowSize * 0.22));
  const wasCentsSize = Math.max(6, Math.round(wasSize * 0.72));
  const labelSize = Math.round(Math.min(13, Math.max(8, rowH * 0.26)));
  const descSize = Math.max(7, labelSize - 2);
  // Only show the unit when the row is tall enough for it to read as a unit.
  const showUnit = rowH >= 30;

  return {
    rowH,
    rowGap,
    nowSize,
    centsSize,
    eachSize,
    wasSize,
    wasCentsSize,
    nowTagSize,
    labelSize,
    descSize,
    showUnit,
  };
}

function PriceBlock({
  price,
  wasPrice,
  unit,
  sizes,
}: {
  price: number;
  wasPrice: number | null;
  unit: string;
  sizes: ReturnType<typeof computeSizes>;
}) {
  const now = splitPrice(price);
  const was = wasPrice != null ? splitPrice(wasPrice) : null;
  const { nowSize, centsSize, eachSize, wasSize, wasCentsSize, labelSize } = sizes;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {was && (
        <>
          <span style={{ fontSize: labelSize, fontWeight: 900, color: RED, textTransform: "uppercase" as const, letterSpacing: "0.08em", lineHeight: 1 }}>
            WAS
          </span>
          <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1, marginBottom: 4 }}>
            <span style={{ fontSize: wasSize, fontWeight: 900, color: "#999", lineHeight: 0.9, textDecoration: "line-through" }}>
              {was.whole}
            </span>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 2, marginLeft: 1 }}>
              <span style={{ fontSize: wasCentsSize, fontWeight: 800, color: "#999", lineHeight: 1, textDecoration: "line-through" }}>
                {was.cents}
              </span>
              <span style={{ fontSize: 8, color: "#bbb", marginTop: 1 }}>{unit}</span>
            </div>
          </div>
          <span style={{ fontSize: labelSize, fontWeight: 900, color: RED, textTransform: "uppercase" as const, letterSpacing: "0.08em", lineHeight: 1 }}>
            NOW
          </span>
        </>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1 }}>
        <span style={{ fontSize: nowSize, fontWeight: 900, color: "#111", lineHeight: 0.88 }}>
          {now.whole}
        </span>
        <div style={{ display: "flex", flexDirection: "column", marginTop: Math.round(nowSize * 0.05), marginLeft: 2 }}>
          <span style={{ fontSize: centsSize, fontWeight: 800, color: "#111", lineHeight: 1 }}>
            {now.cents}
          </span>
          <span style={{ fontSize: eachSize, color: "#555", marginTop: 2, lineHeight: 1 }}>{unit}</span>
        </div>
      </div>
    </div>
  );
}

function VariantPriceRow({
  variant,
  unit,
  sizes,
  isLast,
}: {
  variant: CardVariant;
  unit: string;
  sizes: ReturnType<typeof computeMultiVariantSizes>;
  isLast: boolean;
}) {
  const now = splitPrice(variant.promoPrice);
  const was =
    variant.originalPrice != null && variant.originalPrice > 0
      ? splitPrice(variant.originalPrice)
      : null;
  const {
    rowH,
    rowGap,
    nowSize,
    centsSize,
    eachSize,
    wasSize,
    wasCentsSize,
    nowTagSize,
    labelSize,
    descSize,
    showUnit,
  } = sizes;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: rowH,
        paddingBottom: isLast ? 0 : rowGap / 2,
        marginBottom: isLast ? 0 : rowGap / 2,
        borderBottom: isLast ? undefined : "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <span
        style={{
          fontSize: labelSize,
          fontWeight: 700,
          color: "#333",
          lineHeight: 1.15,
          flexShrink: 0,
          maxWidth: "40%",
        }}
      >
        {variant.label}
        {variant.description && (
          <span
            style={{
              display: "block",
              fontSize: descSize,
              fontWeight: 400,
              color: "#6b7280",
              lineHeight: 1.2,
              whiteSpace: "pre-line",
            }}
          >
            {variant.description}
          </span>
        )}
      </span>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        {was && (
          /* WAS on one line: tag, struck price and cents side by side. */
          <div style={{ display: "flex", alignItems: "baseline", gap: 3, lineHeight: 1 }}>
            <span
              style={{
                fontSize: Math.max(7, wasSize - 2),
                fontWeight: 900,
                color: "#9ca3af",
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
              }}
            >
              WAS
            </span>
            <span
              style={{
                fontSize: wasSize,
                fontWeight: 800,
                color: "#9ca3af",
                textDecoration: "line-through",
              }}
            >
              {was.whole}
            </span>
            <span
              style={{
                fontSize: wasCentsSize,
                fontWeight: 800,
                color: "#9ca3af",
                textDecoration: "line-through",
              }}
            >
              {was.cents}
            </span>
          </div>
        )}

        {/* NOW on one line, with the figure kept as large as the row allows. */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, lineHeight: 1 }}>
          {was && (
            <span
              style={{
                fontSize: nowTagSize,
                fontWeight: 900,
                color: RED,
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
              }}
            >
              NOW
            </span>
          )}
          <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1 }}>
            <span style={{ fontSize: nowSize, fontWeight: 900, color: "#111", lineHeight: 0.92 }}>
              {now.whole}
            </span>
            <div style={{ display: "flex", flexDirection: "column", marginLeft: 2 }}>
              <span style={{ fontSize: centsSize, fontWeight: 800, color: "#111", lineHeight: 1 }}>
                {now.cents}
              </span>
              {showUnit && (
                <span style={{ fontSize: eachSize, color: "#555", lineHeight: 1, marginTop: 1 }}>
                  {unit}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <path d="M7 0C4.24 0 2 2.24 2 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 7 3.5a1.5 1.5 0 0 1 0 3z" fill="white"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z" fill="white"/>
    </svg>
  );
}

type Props = {
  headerImageData: string | null;
  promoDateFrom: Date;
  promoDateTo: Date;
  storeName?: string | null;
  storeNumber?: string | null;
  storeAddress?: string | null;
  storePhone?: string | null;
  productName: string;
  productUnit?: string | null;
  productVariant?: string | null;
  productVariants?: CardVariant[] | null;
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
  storePhone,
  productName,
  productUnit,
  productVariant,
  productVariants,
  productPrice,
  productImageData,
  priceOverride,
  originalPrice,
}: Props) {
  const price = priceOverride != null ? toNum(priceOverride) : toNum(productPrice);
  const wasPrice = originalPrice != null ? toNum(originalPrice) : null;
  const hasStoreInfo = !!(storeName || storeNumber || storeAddress || storePhone);

  const fromDay = promoDateFrom.getDate();
  const toDay = promoDateTo.getDate();
  const fromMon = promoDateFrom.toLocaleDateString("en-ZA", { month: "long" });
  const toMon = promoDateTo.toLocaleDateString("en-ZA", { month: "long" });
  const toYear = promoDateTo.getFullYear();
  const dateStr =
    fromMon === toMon
      ? `Promotion valid from ${fromDay} - ${toDay} ${toMon} ${toYear}. T's and C's apply.`
      : `Promotion valid from ${fromDay} ${fromMon} - ${toDay} ${toMon} ${toYear}. T's and C's apply.`;

  const isMultiVariant = productVariants != null && productVariants.length >= 2;

  const { whole: nowWhole } = splitPrice(price);
  const wasWhole = wasPrice != null ? splitPrice(wasPrice).whole : null;
  const sizes = computeSizes(productName, productVariant, nowWhole, wasWhole);

  const nameSize = isMultiVariant
    ? (productName.length <= 14 ? 24 : productName.length <= 22 ? 21 : productName.length <= 32 ? 18 : 15)
    : sizes.nameSize;

  // The name can wrap to a second line, which is height the rows cannot have.
  const nameCharsPerLine = Math.max(8, Math.floor(TEXT_PANEL_W / (nameSize * 0.52)));
  const nameLines = Math.min(2, Math.max(1, Math.ceil(productName.length / nameCharsPerLine)));
  const variantListH = PANEL_INNER_H - Math.round(nameSize * 1.12 * nameLines) - 6;

  const mvSizes = isMultiVariant
    ? computeMultiVariantSizes(
        productVariants.length,
        productVariants.some((v) => v.originalPrice != null && v.originalPrice > 0),
        Math.max(...productVariants.map((v) => String(Math.floor(v.promoPrice)).length)),
        variantListH,
      )
    : null;

  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_W,
        fontFamily: "Helvetica, Arial, sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        flexShrink: 0,
      }}
    >
      {/* Header image — extracted PDF header (Say Yes banner + Build it logo bar) */}
      <div style={{ width: CARD_W, height: HEADER_H, background: "#e5e7eb", overflow: "hidden", flexShrink: 0 }}>
        {headerImageData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={headerImageData}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              // "fill" stretches to fit exactly — prevents cropping when PDF aspect ratio
              // doesn't match the header box (e.g. A4 landscape vs square card PDFs)
              objectFit: "fill",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
            No header image
          </div>
        )}
      </div>

      {/* Date banner */}
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
        <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, textAlign: "center", letterSpacing: "0.025em", lineHeight: 1 }}>
          {dateStr}
        </span>
      </div>

      {/* Product section */}
      <div style={{ width: CARD_W, height: PRODUCT_H, display: "flex", flexShrink: 0, background: "#fff", overflow: "hidden" }}>
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
            padding: "13px 14px 11px 11px",
            display: "flex",
            flexDirection: "column",
            justifyContent: isMultiVariant || wasPrice !== null ? "flex-start" : "center",
            overflow: "hidden",
          }}
        >
          <div style={{ fontSize: nameSize, fontWeight: 900, color: "#111", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
            {productName}
          </div>

          {isMultiVariant ? (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                flex: 1,
                overflow: "hidden",
              }}
            >
              {productVariants.map((v, i) => (
                <VariantPriceRow
                  key={i}
                  variant={v}
                  unit={productUnit ?? "each"}
                  sizes={mvSizes!}
                  isLast={i === productVariants.length - 1}
                />
              ))}
            </div>
          ) : (
            <>
              {productVariant && (
                <div style={{ fontSize: sizes.variantSize, color: "#6b7280", marginTop: 4, lineHeight: 1.4, whiteSpace: "pre-line" }}>
                  {productVariant}
                </div>
              )}
              <div style={{ marginTop: sizes.variantLines > 4 ? 2 : (wasPrice == null ? 10 : 8) }}>
                <PriceBlock price={price} wasPrice={wasPrice} unit={productUnit ?? "each"} sizes={sizes} />
              </div>
            </>
          )}
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
            <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
              {storeAddress && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                  <LocationIcon />
                  <span style={{ color: "rgba(255,255,255,0.90)", fontSize: 11, lineHeight: 1.35, maxWidth: 220 }}>
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/client-logo/buildit-white.png" alt="Build It" style={{ height: 34, objectFit: "contain" }} crossOrigin="anonymous" />
              {storeName && (
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1 }}>
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
