namespace Backend.DTO
{
    // A report request is a calculation request plus the few things only the form knows:
    // what the product is called, which matvaregruppe it sits under, and whether the user
    // enabled the helsepåstander panel.
    //
    // It carries the inputs rather than a finished result on purpose. The endpoint runs the
    // calculation itself and renders that, so the document can't state a verdict the
    // calculator wouldn't reach for the same inputs.
    public class CalculatorReportRequestDTO : CalculatorRequestDTO
    {
        public string ProductName { get; set; } = string.Empty;
        public string Matvaregruppe { get; set; } = string.Empty;

        // False when the user turned the EFSA helsepåstander panel off, which omits the
        // health-claim sections rather than printing them empty.
        public bool EfsaEnabled { get; set; } = true;
    }
}
