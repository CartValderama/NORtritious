using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class RemovedNutrionalInfoModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NutritionalInfo");

            migrationBuilder.DropColumn(
                name: "NutritionalInfoId",
                table: "Product");

            migrationBuilder.AddColumn<decimal>(
                name: "AddedSugar",
                table: "Product",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Calories",
                table: "Product",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Carbs",
                table: "Product",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Fat",
                table: "Product",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Fiber",
                table: "Product",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "NatSugar",
                table: "Product",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Protein",
                table: "Product",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Salt",
                table: "Product",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SatFat",
                table: "Product",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddedSugar",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "Calories",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "Carbs",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "Fat",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "Fiber",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "NatSugar",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "Protein",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "Salt",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "SatFat",
                table: "Product");

            migrationBuilder.AddColumn<int>(
                name: "NutritionalInfoId",
                table: "Product",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "NutritionalInfo",
                columns: table => new
                {
                    NutritionalInfoId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ProductId = table.Column<int>(type: "INTEGER", nullable: false),
                    Calories = table.Column<decimal>(type: "TEXT", nullable: false),
                    Carbs = table.Column<decimal>(type: "TEXT", nullable: false),
                    Fat = table.Column<decimal>(type: "TEXT", nullable: false),
                    Fiber = table.Column<decimal>(type: "TEXT", nullable: false),
                    Protein = table.Column<decimal>(type: "TEXT", nullable: false),
                    Sugar = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NutritionalInfo", x => x.NutritionalInfoId);
                    table.ForeignKey(
                        name: "FK_NutritionalInfo_Product_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Product",
                        principalColumn: "ProductId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NutritionalInfo_ProductId",
                table: "NutritionalInfo",
                column: "ProductId",
                unique: true);
        }
    }
}
