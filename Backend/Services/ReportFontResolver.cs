using PdfSharp.Fonts;

namespace Backend.Services
{
    // Supplies PDFsharp with a font file it can actually read, on whichever machine the app
    // is running.
    //
    // PDFsharp doesn't ship fonts. On a developer's Windows machine it can fall back to the
    // system ones, but the aspnet runtime image has none, so a report that renders locally
    // throws in production. Rather than depend on that difference, the report asks for one
    // family name and this resolver points it at the first font present from a short list,
    // with DejaVu first because that is what the Dockerfile installs.
    public class ReportFontResolver : IFontResolver
    {
        // Searched in order. DejaVu is installed by the Dockerfile; the Liberation and
        // Windows entries cover a developer machine or a differently-provisioned host.
        private static readonly string[] CandidatePaths =
        {
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
            @"C:\Windows\Fonts\arial.ttf",
        };

        private static readonly string[] BoldCandidatePaths =
        {
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
            @"C:\Windows\Fonts\arialbd.ttf",
        };

        private static byte[]? Load(IEnumerable<string> paths)
        {
            foreach (var path in paths)
            {
                if (File.Exists(path)) return File.ReadAllBytes(path);
            }
            return null;
        }

        public FontResolverInfo? ResolveTypeface(string familyName, bool isBold, bool isItalic) =>
            new(isBold ? "report-bold" : "report-regular");

        public byte[]? GetFont(string faceName) =>
            // Falls back to the regular face when no bold file is present rather than
            // failing: a report in one weight is still a usable report.
            faceName == "report-bold"
                ? Load(BoldCandidatePaths) ?? Load(CandidatePaths)
                : Load(CandidatePaths);
    }
}
