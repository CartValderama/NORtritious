import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  buildResultStats,
  getApplicableClaims,
  getAllHealthClaims,
  translateSubstanceName,
  stripPercentageSuffix,
  getEfsaClaimDisplay,
  CLAIMS_BY_NAME,
  FIELD_LABELS,
  type ResultStats,
  type HealthClaim,
} from "./nutritionResultHelpers";
import { evaluateNokkelhulletRequirements } from "./nokkelhulletEvaluation";
import { formatNoNumber, type NutritionValues } from "./nutritionFormFields";

const MARGIN = 20;
const PAGE_WIDTH = 210; // A4 portrait, mm
const PAGE_HEIGHT = 297;
const BOTTOM_MARGIN = 25;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const GRAY: [number, number, number] = [90, 90, 90];
const LINE_GRAY: [number, number, number] = [190, 190, 190];
const TABLE_HEAD: [number, number, number] = [240, 240, 240];

// jsPDF's standard fonts use WinAnsiEncoding, which has no "≤"/"≥" glyphs —
// rendering them produced garbled characters ("d, "e) in the Grense column.
// Spelled out in words instead, which also reads more naturally in a formal
// Norwegian report than a bare comparator symbol.
const comparatorWord = (comparator: string): string =>
  comparator === "≤" ? "høyst" : "minst";

interface BuildResultPdfInput {
  productName: string;
  matvaregruppe: string;
  foodType: string;
  category: string;
  result: {
    hasNokkelhullet?: boolean;
    efsaNutritionClaims?: string[];
    efsaHealthClaims?: HealthClaim[];
    ingredientHealthClaims?: HealthClaim[];
  };
  nutrition: NutritionValues;
  efsaEnabled: boolean;
}

// Adds a new page (resetting y to the top margin) if the next block wouldn't
// fit above the footer — every block that isn't an autoTable (which paginates
// itself) needs to check this before drawing.
const ensureSpace = (doc: jsPDF, y: number, needed: number): number => {
  if (y + needed > PAGE_HEIGHT - BOTTOM_MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
};

let sectionNumber = 0;

// Numbered section heading with a thin rule underneath — the report's only
// structural device, in place of color, to separate one section from the
// next.
const drawSectionHeading = (doc: jsPDF, y: number, title: string): number => {
  sectionNumber += 1;
  y = ensureSpace(doc, y, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`${sectionNumber}. ${title}`, MARGIN, y);
  y += 2;
  doc.setDrawColor(...LINE_GRAY);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  return y + 6;
};

// A justified block of running text — the report's default register:
// explanatory prose rather than a bare status label.
const drawParagraph = (doc: jsPDF, y: number, text: string): number => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  y = ensureSpace(doc, y, lines.length * 5 + 3);
  doc.text(lines, MARGIN, y);
  return y + lines.length * 5 + 3;
};

// One claim, written as a bold sub-heading followed by its substantiating
// text as a normal paragraph — not a highlighted box, so the whole report
// reads as one continuous document.
const drawClaimEntry = (
  doc: jsPDF,
  y: number,
  heading: string,
  body: string,
  footnote?: string,
): number => {
  const bodyLines = doc.splitTextToSize(body, CONTENT_WIDTH);
  const footnoteLines = footnote ? doc.splitTextToSize(footnote, CONTENT_WIDTH) : [];
  const totalHeight =
    5 + bodyLines.length * 5 + (footnoteLines.length ? footnoteLines.length * 4.2 + 2 : 0) + 4;
  y = ensureSpace(doc, y, totalHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(heading, MARGIN, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.text(bodyLines, MARGIN, y);
  y += bodyLines.length * 5;

  if (footnoteLines.length) {
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.text(footnoteLines, MARGIN, y);
    y += footnoteLines.length * 4.2;
    doc.setTextColor(0, 0, 0);
  }

  return y + 3;
};

const plainTable = (
  doc: jsPDF,
  startY: number,
  head: string[][],
  body: string[][],
  advanceTo: (y: number) => void,
) => {
  autoTable(doc, {
    startY,
    margin: { left: MARGIN, right: MARGIN },
    theme: "grid",
    head,
    body,
    styles: {
      fontSize: 9,
      textColor: [0, 0, 0],
      lineColor: LINE_GRAY,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    didDrawPage: (data) => {
      if (data.cursor) advanceTo(data.cursor.y);
    },
  });
};

// Text report built from the same result data the on-screen Resultat section
// reads — so this can't drift from what the calculator actually shows.
//
// Written as a formal document (numbered sections, running prose, plain
// tables) rather than a dashboard of colored boxes: section 2 states in
// writing which claims are usable right now and on what basis; the sections
// after it lay out, in full, every requirement and every claim that was
// checked — including the ones that failed — as supporting documentation.
export const buildResultPdf = ({
  productName,
  matvaregruppe,
  foodType,
  category,
  result,
  nutrition,
  efsaEnabled,
}: BuildResultPdfInput): jsPDF => {
  sectionNumber = 0;
  const doc = new jsPDF();
  const stats: ResultStats = buildResultStats(result, foodType, category, nutrition);
  const foodTypeLabel = foodType === "solid" ? "fast form" : "flytende form";
  const dateStr = new Date().toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Title block ──────────────────────────────────────────────────────────
  let y = MARGIN;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(0, 0, 0);
  doc.text("Ernærings- og helsepåstandsrapport", MARGIN, y);
  y += 10;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const metaRows: [string, string][] = [
    ["Produkt", productName || "-"],
    ["Matvaregruppe", matvaregruppe || "-"],
    ["Produkttype", foodTypeLabel],
    ["Dato", dateStr],
  ];
  metaRows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, MARGIN + 32, y);
    y += 5.5;
  });
  y += 4;

  // ── 1. Sammendrag ────────────────────────────────────────────────────────
  y = drawSectionHeading(doc, y, "Sammendrag");

  const nokkelhulletSentence =
    stats.nokkelhulletTotalCount === 0
      ? "Nøkkelhullforskriften stiller ingen krav for denne varekategorien."
      : stats.nokkelhulletPassed
        ? "Produktet oppfyller kravene til Nøkkelhullet."
        : "Produktet oppfyller ikke kravene til Nøkkelhullet med det oppgitte næringsinnholdet.";

  const efsaSentence =
    stats.efsaTotalCount === 0
      ? "Ingen EFSA-ernæringspåstander er aktuelle for denne varekategorien."
      : `${stats.efsaMetCount} av ${stats.efsaTotalCount} mulige EFSA-ernæringspåstander er oppfylt.`;

  const healthSentence = efsaEnabled
    ? stats.healthClaimsTotalCount === 0
      ? "Ingen kilder er lagt inn for vurdering av helsepåstander."
      : `${stats.healthClaimsMetCount} av ${stats.healthClaimsTotalCount} vurderte helsepåstander er dokumentert oppfylt.`
    : "Helsepåstander er ikke vurdert for dette produktet.";

  y = drawParagraph(
    doc,
    y,
    `Denne rapporten oppsummerer vurderingen av ${
      productName || "produktet"
    } opp mot Nøkkelhullforskriften og EU-forordning (EF) nr. 1924/2006 om ernærings- og helsepåstander, basert på det næringsinnholdet som er lagt inn i kalkulatoren. ${nokkelhulletSentence} ${efsaSentence} ${healthSentence}`,
  );

  // ── 2. Godkjente påstander ───────────────────────────────────────────────
  y = drawSectionHeading(doc, y, "Godkjente påstander");
  y = drawParagraph(
    doc,
    y,
    "Følgende påstander er oppfylt med det oppgitte næringsinnholdet og kan benyttes på emballasje eller i markedsføring, forutsatt at eventuelle vilkår for bruk overholdes.",
  );

  let anyUsable = false;

  if (stats.nokkelhulletPassed && stats.nokkelhulletTotalCount > 0) {
    anyUsable = true;
    y = drawClaimEntry(
      doc,
      y,
      "Nøkkelhullet",
      "Produktet oppfyller kravene til Nøkkelhullet og kan merkes med Nøkkelhullsymbolet på pakningen.",
    );
  }

  const metNutritionNames = new Set(result.efsaNutritionClaims || []);
  const usableNutritionClaims = getApplicableClaims(foodType)
    .map(({ cfg }) => ({ name: cfg.name, cfg: CLAIMS_BY_NAME[cfg.name] }))
    .filter(({ name, cfg }) => cfg && metNutritionNames.has(name));

  usableNutritionClaims.forEach(({ cfg }) => {
    anyUsable = true;
    y = drawClaimEntry(doc, y, cfg.name, cfg.metText);
  });

  if (efsaEnabled) {
    const usableHealthClaims = getAllHealthClaims(result).filter(
      (c) => c.meetsRequirement === "Oppfyller gitt krav",
    );
    usableHealthClaims.forEach((claim) => {
      anyUsable = true;
      const amount = stripPercentageSuffix(claim.amount);
      const heading = `${translateSubstanceName(claim.nutrient || "Ukjent")}${
        amount ? ` (${amount})` : ""
      }`;
      const footnoteParts: string[] = [];
      if (claim.vilkaarForBruk) footnoteParts.push(`Vilkår for bruk: ${claim.vilkaarForBruk}`);
      if (claim.legislationReference) footnoteParts.push(`Kilde: ${claim.legislationReference}`);
      y = drawClaimEntry(
        doc,
        y,
        heading,
        claim.pastand || "",
        footnoteParts.length ? footnoteParts.join(" ") : undefined,
      );
    });
  }

  if (!anyUsable) {
    y = drawParagraph(
      doc,
      y,
      "Ingen påstander kan på nåværende tidspunkt benyttes for dette produktet, basert på det oppgitte næringsinnholdet.",
    );
  }

  const advanceTo = (finalY: number) => {
    y = finalY + 10;
  };

  // ── 3. Næringsinnhold ────────────────────────────────────────────────────
  y = drawSectionHeading(doc, y, `Næringsinnhold per 100 ${foodType === "liquid" ? "ml" : "g"}`);

  const energyValue =
    nutrition.energikcal !== "" ? `${formatNoNumber(Number(nutrition.energikcal) || 0)} kcal` : "";
  const energyKjValue =
    nutrition.energikj !== "" ? `${formatNoNumber(Number(nutrition.energikj) || 0)} kJ` : "";
  const nutritionRows: [string, string][] = [
    ["Energi", [energyValue, energyKjValue].filter(Boolean).join(" / ") || "-"],
    ...(Object.keys(FIELD_LABELS) as (keyof NutritionValues)[])
      .filter((key) => nutrition[key] !== undefined)
      .map((key): [string, string] => [
        FIELD_LABELS[key],
        nutrition[key] !== "" ? `${formatNoNumber(Number(nutrition[key]) || 0)} g` : "-",
      ]),
  ];

  plainTable(doc, y, [["Næringsstoff", "Verdi"]], nutritionRows, advanceTo);

  // ── 4. Nøkkelhullet ──────────────────────────────────────────────────────
  y = drawSectionHeading(doc, y, "Nøkkelhullet — kravvurdering");

  const requirements = evaluateNokkelhulletRequirements(category, nutrition);
  if (requirements.length > 0) {
    plainTable(
      doc,
      y,
      [["Krav", "Faktisk", "Grense", "Status"]],
      requirements.map((r) => [
        r.nutrient,
        `${formatNoNumber(r.actualValue)} ${r.unit}`,
        `${comparatorWord(r.comparator)} ${formatNoNumber(r.thresholdValue)} ${r.unit}`,
        r.passed ? "Oppfylt" : "Ikke oppfylt",
      ]),
      advanceTo,
    );
  } else {
    y = drawParagraph(doc, y, "Ingen Nøkkelhullet-krav gjelder for denne varekategorien.");
  }

  // ── 5. EFSA Ernæringspåstander ───────────────────────────────────────────
  y = drawSectionHeading(doc, y, "EFSA Ernæringspåstander — fullstendig oversikt");

  const allNutritionClaims = getApplicableClaims(foodType)
    .map(({ cfg }) => ({
      name: cfg.name,
      cfg: CLAIMS_BY_NAME[cfg.name],
      met: metNutritionNames.has(cfg.name),
    }))
    .filter((c) => c.cfg);

  if (allNutritionClaims.length > 0) {
    plainTable(
      doc,
      y,
      [["Krav", "Faktisk", "Grense", "Status"]],
      allNutritionClaims.map((c) => {
        const display = getEfsaClaimDisplay(c.cfg.key, foodType, nutrition);
        return [
          c.name,
          display ? `${formatNoNumber(display.actualValue)} ${display.actualUnit}` : "-",
          display
            ? `${comparatorWord(display.comparator)} ${formatNoNumber(display.thresholdValue)} ${display.thresholdUnit}`
            : "-",
          c.met ? "Oppfylt" : "Ikke oppfylt",
        ];
      }),
      advanceTo,
    );
  } else {
    y = drawParagraph(doc, y, "Ingen ernæringspåstander er aktuelle for denne varekategorien.");
  }

  // ── 6. EFSA Helsepåstander ───────────────────────────────────────────────
  if (efsaEnabled) {
    y = drawSectionHeading(doc, y, "EFSA Helsepåstander — fullstendig oversikt");

    const healthClaims = getAllHealthClaims(result);
    if (healthClaims.length > 0) {
      plainTable(
        doc,
        y,
        [["Stoff", "Mengde", "Status"]],
        healthClaims.map((c) => [
          translateSubstanceName(c.nutrient || "Ukjent"),
          stripPercentageSuffix(c.amount) || "-",
          c.meetsRequirement === "Oppfyller gitt krav" ? "Oppfylt" : "Ikke oppfylt",
        ]),
        advanceTo,
      );
    } else {
      y = drawParagraph(doc, y, "Ingen kilder er lagt til for vurdering av helsepåstander.");
    }
  }

  // ── Footer (every page) ──────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...LINE_GRAY);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, PAGE_HEIGHT - 15, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text(
      "Generert av NORtritious-kalkulatoren. Kontroller alltid mot gjeldende regelverk før publisering.",
      MARGIN,
      PAGE_HEIGHT - 10,
    );
    doc.text(`Side ${i} av ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10, {
      align: "right",
    });
    doc.setTextColor(0, 0, 0);
  }

  return doc;
};
