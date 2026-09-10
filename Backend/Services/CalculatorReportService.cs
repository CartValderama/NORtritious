using System.Globalization;
using Backend.DTO;
using MigraDoc.DocumentObjectModel;
using MigraDoc.DocumentObjectModel.Tables;
using MigraDoc.Rendering;

namespace Backend.Services
{
    // Renders the calculator's assessment as a PDF.
    //
    // This used to be buildResultPdf.ts, some 460 lines of jsPDF in the browser. It moved
    // here because the report is a compliance document: it quotes limits, verdicts and claim
    // wording, all of which are decided in this project, and a document produced from the
    // assessment should come from the same place the assessment does.
    //
    // Written as a formal document (numbered sections, running prose, plain tables) rather
    // than a dashboard of coloured boxes. Section 2 states in writing which claims are usable
    // and on what basis; the sections after it lay out every requirement and every claim that
    // was checked, including the ones that failed, as supporting documentation.
    public class CalculatorReportService
    {
        private static readonly CultureInfo NorwegianCulture = CultureInfo.GetCultureInfo("nb-NO");
        private static string FormatNo(decimal value) => value.ToString(NorwegianCulture);

        private static readonly Color Gray = new(90, 90, 90);
        private static readonly Color LineGray = new(190, 190, 190);
        private static readonly Color TableHead = new(240, 240, 240);

        // Nutrition-table rows, in the order the form shows them. Key matches the schema's
        // field keys so only the fields the category actually asked for are printed; the rest
        // were never entered and a "0 g" against them would be a number nobody supplied.
        private static readonly (string Key, string Label)[] NutritionRows =
        {
            ("fett", "Fett"),
            ("mettede", "Mettede fettsyrer"),
            ("transfett", "Transfett"),
            ("karbohydrat", "Karbohydrat"),
            ("sukkerarter", "Sukkerarter"),
            ("kostfiber", "Kostfiber"),
            ("protein", "Protein"),
            ("salt", "Salt"),
        };

        private static readonly Dictionary<string, string> ClaimStatusLabel = new()
        {
            ["met"] = "Oppfylt",
            ["notMet"] = "Ikke oppfylt",
            ["undetermined"] = "Ikke vurdert",
        };

        private readonly CalculatorService _calculator;
        private int _sectionNumber;

        public CalculatorReportService(CalculatorService calculator) => _calculator = calculator;

        public async Task<byte[]> BuildAsync(CalculatorReportRequestDTO request)
        {
            var result = await _calculator.Calculate(request);
            var schema = _calculator.BuildSchema(request.Category, request.FoodType);

            _sectionNumber = 0;
            var doc = new Document();
            doc.Info.Title = "Ernærings- og helsepåstandsrapport";
            DefineStyles(doc);

            var section = doc.AddSection();
            section.PageSetup.PageFormat = PageFormat.A4;
            section.PageSetup.LeftMargin = Unit.FromMillimeter(20);
            section.PageSetup.RightMargin = Unit.FromMillimeter(20);
            section.PageSetup.TopMargin = Unit.FromMillimeter(20);
            section.PageSetup.BottomMargin = Unit.FromMillimeter(25);
            AddFooter(section);

            DrawDisclaimerPage(section);
            section.AddPageBreak();

            DrawTitleBlock(section, request);
            DrawSummary(section, request, result);
            DrawUsableClaims(section, request, result);
            DrawNutritionTable(section, request, schema);
            DrawNokkelhullet(section, result);
            DrawNutritionClaims(section, result);
            if (request.EfsaEnabled) DrawHealthClaims(section, result);

            var renderer = new PdfDocumentRenderer { Document = doc };
            renderer.RenderDocument();

            using var stream = new MemoryStream();
            renderer.PdfDocument.Save(stream, false);
            return stream.ToArray();
        }

        // ── Layout primitives ───────────────────────────────────────────────────

        private static void DefineStyles(Document doc)
        {
            var normal = doc.Styles["Normal"]!;
            normal.Font.Name = "Arial";
            normal.Font.Size = 10;
            normal.ParagraphFormat.SpaceAfter = Unit.FromMillimeter(3);

            var heading = doc.Styles.AddStyle("SectionHeading", "Normal");
            heading.Font.Size = 12;
            heading.Font.Bold = true;
            heading.ParagraphFormat.SpaceBefore = Unit.FromMillimeter(6);
            heading.ParagraphFormat.SpaceAfter = Unit.FromMillimeter(2);
            heading.ParagraphFormat.Borders.Bottom.Width = 0.3;
            heading.ParagraphFormat.Borders.Bottom.Color = LineGray;

            var claimHeading = doc.Styles.AddStyle("ClaimHeading", "Normal");
            claimHeading.Font.Bold = true;
            claimHeading.ParagraphFormat.SpaceBefore = Unit.FromMillimeter(2);
            claimHeading.ParagraphFormat.SpaceAfter = Unit.FromMillimeter(0.5);

            var footnote = doc.Styles.AddStyle("Footnote", "Normal");
            footnote.Font.Size = 8.5;
            footnote.Font.Color = Gray;

            var footer = doc.Styles[StyleNames.Footer]!;
            footer.Font.Size = 7.5;
            footer.Font.Color = Gray;
        }

        private static void AddFooter(Section section)
        {
            var footer = section.Footers.Primary.AddParagraph();
            footer.Format.Borders.Top.Width = 0.2;
            footer.Format.Borders.Top.Color = LineGray;
            footer.Format.SpaceBefore = Unit.FromMillimeter(2);
            footer.AddText("Generert av NORtritious-kalkulatoren. Kontroller alltid mot gjeldende regelverk før publisering.");
            footer.AddTab();
            footer.AddText("Side ");
            footer.AddPageField();
            footer.AddText(" av ");
            footer.AddNumPagesField();
            footer.Format.TabStops.AddTabStop(Unit.FromMillimeter(170), TabAlignment.Right);
        }

        private void DrawSectionHeading(Section section, string title)
        {
            _sectionNumber += 1;
            section.AddParagraph($"{_sectionNumber}. {title}", "SectionHeading");
        }

        private static Table AddTable(Section section, string[] headers, IEnumerable<string[]> rows)
        {
            var table = section.AddTable();
            table.Borders.Width = 0.2;
            table.Borders.Color = LineGray;
            table.Rows.LeftIndent = 0;

            var width = Unit.FromMillimeter(170) / headers.Length;
            foreach (var _ in headers) table.AddColumn(width);

            var head = table.AddRow();
            head.Shading.Color = TableHead;
            head.Format.Font.Bold = true;
            for (var i = 0; i < headers.Length; i++) head.Cells[i].AddParagraph(headers[i]);

            foreach (var cells in rows)
            {
                var row = table.AddRow();
                for (var i = 0; i < cells.Length; i++) row.Cells[i].AddParagraph(cells[i]);
            }

            table.Rows.HeightRule = RowHeightRule.AtLeast;
            section.AddParagraph();
            return table;
        }

        // ── Sections ────────────────────────────────────────────────────────────

        private static void DrawDisclaimerPage(Section section)
        {
            var title = section.AddParagraph("Merk: prototype-rapport");
            title.Format.Font.Size = 16;
            title.Format.Font.Bold = true;
            title.Format.Borders.Bottom.Width = 0.5;
            title.Format.Borders.Bottom.Color = Colors.Black;
            title.Format.SpaceAfter = Unit.FromMillimeter(6);

            section.AddParagraph(
                "Denne PDF-en er et eksempel på hvordan en rapport fra NORtritious-kalkulatoren kan se ut, "
                + "og er kun ment som en illustrasjon i utviklingsfasen. Verken innholdet, strukturen eller "
                + "formateringen som benyttes her er endelig fastsatt. Videre avklaring med "
                + "oppdragsgiver/veileder er nødvendig for å bestemme hvilken struktur den ferdige rapporten "
                + "skal ha.");
        }

        private static void DrawTitleBlock(Section section, CalculatorReportRequestDTO request)
        {
            var title = section.AddParagraph("Ernærings- og helsepåstandsrapport");
            title.Format.Font.Size = 17;
            title.Format.Font.Bold = true;
            title.Format.Borders.Bottom.Width = 0.5;
            title.Format.Borders.Bottom.Color = Colors.Black;
            title.Format.SpaceAfter = Unit.FromMillimeter(5);

            var meta = new (string Label, string Value)[]
            {
                ("Produkt", string.IsNullOrWhiteSpace(request.ProductName) ? "-" : request.ProductName),
                ("Matvaregruppe", string.IsNullOrWhiteSpace(request.Matvaregruppe) ? "-" : request.Matvaregruppe),
                ("Produkttype", request.FoodType == "liquid" ? "flytende form" : "fast form"),
                ("Dato", DateTime.Now.ToString("d. MMMM yyyy", NorwegianCulture)),
            };

            foreach (var (label, value) in meta)
            {
                var p = section.AddParagraph();
                p.Format.SpaceAfter = Unit.FromMillimeter(1);
                p.AddFormattedText($"{label}: ", TextFormat.Bold);
                p.AddText(value);
            }
        }

        private void DrawSummary(Section section, CalculatorReportRequestDTO request, CalculatorResponseDTO result)
        {
            DrawSectionHeading(section, "Sammendrag");

            var requirements = result.NokkelhulletRequirements;
            var claims = result.EfsaNutritionClaimResults;
            var health = result.EfsaHealthClaims.Concat(result.IngredientHealthClaims).ToList();

            string nokkelhullet = requirements.Count == 0
                ? "Nøkkelhullforskriften stiller ingen krav for denne varekategorien."
                : result.HasNokkelhullet == true
                    ? "Produktet oppfyller kravene til Nøkkelhullet."
                    : "Produktet oppfyller ikke kravene til Nøkkelhullet med det oppgitte næringsinnholdet.";

            string efsa = claims.Count == 0
                ? "Ingen EFSA-ernæringspåstander er aktuelle for denne varekategorien."
                : $"{claims.Count(c => c.Passed)} av {claims.Count} mulige EFSA-ernæringspåstander er oppfylt.";

            string helse = !request.EfsaEnabled
                ? "Helsepåstander er ikke vurdert for dette produktet."
                : health.Count == 0
                    ? "Ingen kilder er lagt inn for vurdering av helsepåstander."
                    : $"{health.Count(c => IsMet(c))} av {health.Count} vurderte helsepåstander er dokumentert oppfylt.";

            string product = string.IsNullOrWhiteSpace(request.ProductName) ? "produktet" : request.ProductName;

            section.AddParagraph(
                $"Denne rapporten oppsummerer vurderingen av {product} opp mot Nøkkelhullforskriften og "
                + "EU-forordning (EF) nr. 1924/2006 om ernærings- og helsepåstander, basert på det "
                + $"næringsinnholdet som er lagt inn i kalkulatoren. {nokkelhullet} {efsa} {helse}");
        }

        private void DrawUsableClaims(Section section, CalculatorReportRequestDTO request, CalculatorResponseDTO result)
        {
            DrawSectionHeading(section, "Godkjente påstander");
            section.AddParagraph(
                "Følgende påstander er oppfylt med det oppgitte næringsinnholdet og kan benyttes på "
                + "emballasje eller i markedsføring, forutsatt at eventuelle vilkår for bruk overholdes.");

            var anyUsable = false;

            if (result.HasNokkelhullet == true && result.NokkelhulletRequirements.Count > 0)
            {
                anyUsable = true;
                DrawClaimEntry(section, "Nøkkelhullet",
                    "Produktet oppfyller kravene til Nøkkelhullet og kan merkes med Nøkkelhullsymbolet på pakningen.");
            }

            foreach (var claim in result.EfsaNutritionClaimResults.Where(c => c.Passed))
            {
                anyUsable = true;
                DrawClaimEntry(section, claim.Label, claim.Explanation);
            }

            if (request.EfsaEnabled)
            {
                foreach (var claim in result.EfsaHealthClaims.Concat(result.IngredientHealthClaims).Where(IsMet))
                {
                    anyUsable = true;
                    var amount = StripPercentageSuffix(claim.Amount);
                    var heading = string.IsNullOrWhiteSpace(amount)
                        ? claim.Nutrient
                        : $"{claim.Nutrient} ({amount})";

                    var footnote = new List<string>();
                    if (!string.IsNullOrWhiteSpace(claim.VilkaarForBruk))
                        footnote.Add($"Vilkår for bruk: {claim.VilkaarForBruk}");
                    if (!string.IsNullOrWhiteSpace(claim.LegislationReference))
                        footnote.Add($"Kilde: {claim.LegislationReference}");

                    DrawClaimEntry(section, heading, claim.Pastand,
                        footnote.Count > 0 ? string.Join(" ", footnote) : null);
                }
            }

            if (!anyUsable)
            {
                section.AddParagraph(
                    "Ingen påstander kan på nåværende tidspunkt benyttes for dette produktet, basert på "
                    + "det oppgitte næringsinnholdet.");
            }
        }

        private static void DrawClaimEntry(Section section, string heading, string body, string? footnote = null)
        {
            section.AddParagraph(heading, "ClaimHeading");
            section.AddParagraph(body);
            if (!string.IsNullOrWhiteSpace(footnote)) section.AddParagraph(footnote, "Footnote");
        }

        private void DrawNutritionTable(Section section, CalculatorReportRequestDTO request, CalculatorSchemaDTO schema)
        {
            var per = request.FoodType == "liquid" ? "ml" : "g";
            DrawSectionHeading(section, $"Næringsinnhold per 100 {per}");

            var n = request.Nutrition;
            var energy = new List<string>();
            if (n.EnergyKcal != 0) energy.Add($"{FormatNo(n.EnergyKcal)} kcal");
            if (n.EnergyKj != 0) energy.Add($"{FormatNo(n.EnergyKj)} kJ");

            var values = new Dictionary<string, decimal>
            {
                ["fett"] = n.Fat,
                ["mettede"] = n.SaturatedFat,
                ["transfett"] = n.TransFat,
                ["karbohydrat"] = n.Carbs,
                ["sukkerarter"] = n.NaturalSugars + n.AddedSugars,
                ["kostfiber"] = n.Fibre,
                ["protein"] = n.Protein,
                ["salt"] = n.Salt,
            };

            var rows = new List<string[]>
            {
                new[] { "Energi", energy.Count > 0 ? string.Join(" / ", energy) : "-" },
            };
            // Only the fields this category actually asked for. A row for a field the form
            // never showed would be a number nobody entered.
            rows.AddRange(NutritionRows
                .Where(r => schema.Fields.Contains(r.Key))
                .Select(r => new[] { r.Label, $"{FormatNo(values[r.Key])} g" }));

            AddTable(section, new[] { "Næringsstoff", "Verdi" }, rows);
        }

        private void DrawNokkelhullet(Section section, CalculatorResponseDTO result)
        {
            DrawSectionHeading(section, "Nøkkelhullet - kravvurdering");

            var requirements = result.NokkelhulletRequirements;
            if (requirements.Count == 0)
            {
                section.AddParagraph("Ingen Nøkkelhullet-krav gjelder for denne varekategorien.");
                return;
            }

            AddTable(section, new[] { "Krav", "Faktisk", "Grense", "Status" },
                requirements.Select(r => new[]
                {
                    r.Label,
                    $"{FormatNo(r.ActualValue)} {r.ActualUnit}",
                    $"{ComparatorWord(r.Comparator)} {FormatNo(r.ThresholdValue)} {r.ThresholdUnit}",
                    r.Passed ? "Oppfylt" : "Ikke oppfylt",
                }));

            // A rule whose criterion covers something narrower than the number compared
            // against it carries that note into the report too. The table's bare "Ikke
            // oppfylt" would otherwise read as a settled verdict.
            foreach (var r in requirements.Where(r => !string.IsNullOrWhiteSpace(r.Note)))
                section.AddParagraph($"{r.Label}: {r.Note}", "Footnote");
        }

        private void DrawNutritionClaims(Section section, CalculatorResponseDTO result)
        {
            DrawSectionHeading(section, "EFSA Ernæringspåstander - fullstendig oversikt");

            var claims = result.EfsaNutritionClaimResults;
            if (claims.Count == 0)
            {
                section.AddParagraph("Ingen ernæringspåstander er aktuelle for denne varekategorien.");
                return;
            }

            AddTable(section, new[] { "Krav", "Faktisk", "Grense", "Status" },
                claims.Select(c => new[]
                {
                    c.Label,
                    $"{FormatNo(c.ActualValue)} {c.ActualUnit}",
                    $"{ComparatorWord(c.Comparator)} {FormatNo(c.ThresholdValue)} {c.ThresholdUnit}",
                    c.Passed ? "Oppfylt" : "Ikke oppfylt",
                }));
        }

        private void DrawHealthClaims(Section section, CalculatorResponseDTO result)
        {
            DrawSectionHeading(section, "EFSA Helsepåstander - fullstendig oversikt");

            var claims = result.EfsaHealthClaims.Concat(result.IngredientHealthClaims).ToList();
            if (claims.Count == 0)
            {
                section.AddParagraph("Ingen kilder er lagt til for vurdering av helsepåstander.");
                return;
            }

            AddTable(section, new[] { "Stoff", "Mengde", "Status" },
                claims.Select(c => new[]
                {
                    c.Nutrient,
                    string.IsNullOrWhiteSpace(StripPercentageSuffix(c.Amount)) ? "-" : StripPercentageSuffix(c.Amount),
                    ClaimStatusLabel[ClaimStatus(c.MeetsRequirement)],
                }));
        }

        // ── Shared vocabulary with the frontend ─────────────────────────────────

        // Mirrors getClaimStatus in nutritionResultHelpers.ts. A condition the calculator
        // couldn't evaluate is not a failure, and the report must not print it as one.
        private static string ClaimStatus(string meetsRequirement) =>
            meetsRequirement == "Oppfyller gitt krav" ? "met"
            : meetsRequirement.StartsWith("Kan ikke beregnes automatisk")
              || meetsRequirement.StartsWith("Kan ikke vurderes automatisk") ? "undetermined"
            : "notMet";

        private static bool IsMet(HealthClaimResultDTO c) => ClaimStatus(c.MeetsRequirement) == "met";

        // The comparator symbols have no glyph in several PDF base fonts and rendered as
        // mojibake in the old report, so they are spelled out. It also reads more naturally
        // in a formal Norwegian document than a bare symbol.
        private static string ComparatorWord(string comparator) => comparator == "≤" ? "høyst" : "minst";

        // The resistant starch claim's amount trails with a "(NN %)" ratio that isn't meant
        // to be shown.
        private static string StripPercentageSuffix(string text) =>
            System.Text.RegularExpressions.Regex.Replace(text ?? string.Empty, @"\s*\([\d.,]+\s*%\)\s*$", "").Trim();
    }
}
