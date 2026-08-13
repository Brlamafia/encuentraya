using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EncuentraYA.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PersistedMessagingRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Conversations_ItemReportId",
                table: "Conversations");

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "Messages",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_SenderId",
                table: "Messages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ItemReportId_UserOneId_UserTwoId",
                table: "Conversations",
                columns: new[] { "ItemReportId", "UserOneId", "UserTwoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_UserOneId",
                table: "Conversations",
                column: "UserOneId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_UserTwoId",
                table: "Conversations",
                column: "UserTwoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Users_UserOneId",
                table: "Conversations",
                column: "UserOneId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Users_UserTwoId",
                table: "Conversations",
                column: "UserTwoId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Users_SenderId",
                table: "Messages",
                column: "SenderId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Users_UserOneId",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Users_UserTwoId",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Users_SenderId",
                table: "Messages");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Messages_SenderId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_ItemReportId_UserOneId_UserTwoId",
                table: "Conversations");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_UserOneId",
                table: "Conversations");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_UserTwoId",
                table: "Conversations");

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "Messages",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000);

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ItemReportId",
                table: "Conversations",
                column: "ItemReportId");
        }
    }
}
