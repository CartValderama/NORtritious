using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class ChangedProductsModel3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    ProductId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Group = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    HasEfsaHealth = table.Column<bool>(type: "INTEGER", nullable: false),
                    HasEfsaNutrition = table.Column<bool>(type: "INTEGER", nullable: false),
                    HasNokkelhullet = table.Column<bool>(type: "INTEGER", nullable: false),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: false),
                    Calories = table.Column<decimal>(type: "TEXT", nullable: false),
                    Fat = table.Column<decimal>(type: "TEXT", nullable: false),
                    SatFat = table.Column<decimal>(type: "TEXT", nullable: false),
                    Carbs = table.Column<decimal>(type: "TEXT", nullable: false),
                    NatSugar = table.Column<decimal>(type: "TEXT", nullable: false),
                    AddedSugar = table.Column<decimal>(type: "TEXT", nullable: false),
                    Fiber = table.Column<decimal>(type: "TEXT", nullable: false),
                    Protein = table.Column<decimal>(type: "TEXT", nullable: false),
                    Salt = table.Column<decimal>(type: "TEXT", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.ProductId);
                    table.ForeignKey(
                        name: "FK_Products_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_CreatedByUserId",
                table: "Products",
                column: "CreatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Products");
        }
    }
}
