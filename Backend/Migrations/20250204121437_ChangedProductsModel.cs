using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class ChangedProductsModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Product");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Product",
                columns: table => new
                {
                    ProductId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    AddedSugar = table.Column<decimal>(type: "TEXT", nullable: false),
                    Calories = table.Column<decimal>(type: "TEXT", nullable: false),
                    Carbs = table.Column<decimal>(type: "TEXT", nullable: false),
                    Fat = table.Column<decimal>(type: "TEXT", nullable: false),
                    Fiber = table.Column<decimal>(type: "TEXT", nullable: false),
                    Group = table.Column<string>(type: "TEXT", nullable: false),
                    HasEfsaHealth = table.Column<bool>(type: "INTEGER", nullable: false),
                    HasEfsaNutrition = table.Column<bool>(type: "INTEGER", nullable: false),
                    HasNokkelhullet = table.Column<bool>(type: "INTEGER", nullable: false),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    NatSugar = table.Column<decimal>(type: "TEXT", nullable: false),
                    Protein = table.Column<decimal>(type: "TEXT", nullable: false),
                    Salt = table.Column<decimal>(type: "TEXT", nullable: false),
                    SatFat = table.Column<decimal>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product", x => x.ProductId);
                    table.ForeignKey(
                        name: "FK_Product_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Product_UserId",
                table: "Product",
                column: "UserId");
        }
    }
}
