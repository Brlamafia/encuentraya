using EncuentraYA.Application;
using EncuentraYA.Domain;
using EncuentraYA.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EncuentraYA.API.Controllers;

[ApiController, Route("api/claims"), Authorize]
public sealed class ClaimsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> Mine()
    {
        var userId = User.UserId();
        var claims = await db.Claims.AsNoTracking().Include(x => x.ItemReport).Include(x => x.ClaimantUser)
            .Where(x => x.ClaimantUserId == userId || x.ItemReport!.UserId == userId).OrderByDescending(x => x.CreatedAt).ToListAsync();
        return Ok(claims.Select(x => new ClaimDto(x.Id, x.ItemReportId, x.ItemReport!.Title, x.ItemReport.ImageUrl,
            x.ClaimantUserId, x.ClaimantUser is null ? "Usuario" : $"{x.ClaimantUser.FirstName} {x.ClaimantUser.LastName}",
            x.Message, x.VerificationAnswer, x.AdditionalDetail, x.Status.ToString(), x.CreatedAt, x.UpdatedAt, x.ItemReport.UserId == userId)));
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateClaimRequest request)
    {
        var item = await db.ItemReports.SingleOrDefaultAsync(x => x.Id == request.ItemReportId && x.ReportType == ReportType.Found && x.Status != ItemStatus.Resolved && x.Status != ItemStatus.Closed);
        if (item is null) return NotFound();
        if (item.UserId == User.UserId()) return BadRequest(new { message = "No puedes reclamar tu propio reporte." });
        if (await db.Claims.AnyAsync(x => x.ItemReportId == item.Id && x.ClaimantUserId == User.UserId() && x.Status == ClaimStatus.Pending))
            return Conflict(new { message = "Ya tienes una reclamación pendiente para este objeto." });
        if (string.IsNullOrWhiteSpace(request.Message) || string.IsNullOrWhiteSpace(request.VerificationAnswer))
            return BadRequest(new { message = "Completa la explicación y la respuesta de verificación." });
        var claim = new Claim { ItemReportId = item.Id, ClaimantUserId = User.UserId(), Message = request.Message.Trim(), VerificationAnswer = request.VerificationAnswer.Trim(), AdditionalDetail = request.AdditionalDetail?.Trim() };
        db.Claims.Add(claim);
        db.Notifications.Add(new Notification { UserId = item.UserId, Title = "Nueva reclamación", Message = $"Un usuario está reclamando {item.Title}.", Type = "claim", RelatedEntityId = claim.Id });
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Mine), new { id = claim.Id }, new { claim.Id, Status = claim.Status.ToString() });
    }

    [HttpPatch("{id:guid}/approve")]
    public Task<ActionResult> Approve(Guid id) => Decide(id, true);

    [HttpPatch("{id:guid}/reject")]
    public Task<ActionResult> Reject(Guid id) => Decide(id, false);

    private async Task<ActionResult> Decide(Guid id, bool approved)
    {
        var claim = await db.Claims.Include(x => x.ItemReport).SingleOrDefaultAsync(x => x.Id == id && x.ItemReport!.UserId == User.UserId());
        if (claim is null) return NotFound();
        if (claim.Status != ClaimStatus.Pending) return Conflict(new { message = "Esta reclamación ya fue revisada." });
        claim.Status = approved ? ClaimStatus.Approved : ClaimStatus.Rejected;
        claim.UpdatedAt = DateTime.UtcNow;
        if (approved)
        {
            claim.ItemReport!.Status = ItemStatus.ClaimInProgress;
            var (first, second) = SortUsers(claim.ClaimantUserId, claim.ItemReport.UserId);
            if (!await db.Conversations.AnyAsync(x => x.ItemReportId == claim.ItemReportId && x.UserOneId == first && x.UserTwoId == second))
                db.Conversations.Add(new Conversation { ItemReportId = claim.ItemReportId, UserOneId = first, UserTwoId = second });
        }
        db.Notifications.Add(new Notification { UserId = claim.ClaimantUserId, Title = approved ? "Reclamación aceptada" : "Reclamación rechazada", Message = approved ? "Ya puedes coordinar la entrega por mensajes." : "El publicador no pudo validar tu reclamación.", Type = "claim", RelatedEntityId = claim.Id });
        await db.SaveChangesAsync();
        return Ok(new { Status = claim.Status.ToString() });
    }

    private static (Guid First, Guid Second) SortUsers(Guid a, Guid b) => a.CompareTo(b) < 0 ? (a, b) : (b, a);
}


