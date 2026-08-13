using EncuentraYA.Application;
using EncuentraYA.Domain;
using EncuentraYA.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EncuentraYA.API.Controllers;

[ApiController, Route("api/items")]
public sealed class ItemsController(AppDbContext db, IMatchingService matcher, IImageStorageService images) : ControllerBase
{
    [HttpGet, AllowAnonymous]
    public async Task<ActionResult> GetAll([FromQuery] string? search, [FromQuery] ReportType? type, [FromQuery] ItemCategory? category, [FromQuery] ItemStatus? status, [FromQuery] string? location)
    {
        var query = db.ItemReports.AsNoTracking().Include(x => x.User).Where(x => x.Status != ItemStatus.Closed).AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x => x.Title.ToLower().Contains(term) || x.Description.ToLower().Contains(term));
        }
        if (type.HasValue) query = query.Where(x => x.ReportType == type);
        if (category.HasValue) query = query.Where(x => x.Category == category);
        if (status.HasValue) query = query.Where(x => x.Status == status);
        if (!string.IsNullOrWhiteSpace(location))
        {
            var place = location.Trim().ToLower();
            query = query.Where(x => x.Location.ToLower().Contains(place));
        }
        return Ok((await query.OrderByDescending(x => x.CreatedAt).Take(100).ToListAsync()).Select(x => x.ToDto()));
    }

    [HttpGet("{id:guid}"), AllowAnonymous]
    public async Task<ActionResult> Get(Guid id)
    {
        var item = await db.ItemReports.AsNoTracking().Include(x => x.User).SingleOrDefaultAsync(x => x.Id == id && x.Status != ItemStatus.Closed);
        return item is null ? NotFound() : Ok(item.ToDto());
    }

    [HttpGet("mine"), Authorize]
    public async Task<ActionResult> Mine()
    {
        var items = await db.ItemReports.AsNoTracking().Include(x => x.User).Where(x => x.UserId == User.UserId()).OrderByDescending(x => x.CreatedAt).ToListAsync();
        return Ok(items.Select(x => x.ToDto()));
    }

    [HttpPost, Authorize]
    public async Task<ActionResult> Create(CreateItemRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Trim().Length < 4) return BadRequest(new { message = "El título debe tener al menos 4 caracteres." });
        if (string.IsNullOrWhiteSpace(request.Description) || request.Description.Trim().Length < 10) return BadRequest(new { message = "Agrega una descripción más detallada." });
        if (string.IsNullOrWhiteSpace(request.Location)) return BadRequest(new { message = "La ubicación es obligatoria." });
        if (request.ReportType == ReportType.Found && string.IsNullOrWhiteSpace(request.PrivateVerificationDetail))
            return BadRequest(new { message = "Agrega una pregunta privada de verificación." });

        await using var transaction = await db.Database.BeginTransactionAsync();
        var item = new ItemReport
        {
            Title = request.Title.Trim(), Description = request.Description.Trim(), ReportType = request.ReportType,
            Category = request.Category, Location = request.Location.Trim(), EventDate = request.EventDate.ToUniversalTime(),
            UserId = User.UserId(), PrivateVerificationDetail = request.PrivateVerificationDetail?.Trim()
        };
        db.ItemReports.Add(item);
        await db.SaveChangesAsync();

        var candidates = await db.ItemReports.Where(x => x.Id != item.Id && x.ReportType != item.ReportType && x.Status == ItemStatus.Active && x.Category == item.Category).ToListAsync();
        foreach (var candidate in candidates)
        {
            var lost = item.ReportType == ReportType.Lost ? item : candidate;
            var found = item.ReportType == ReportType.Found ? item : candidate;
            var score = matcher.CalculateScore(lost, found);
            if (score < 60 || await db.Matches.AnyAsync(x => x.LostItemReportId == lost.Id && x.FoundItemReportId == found.Id)) continue;
            db.Matches.Add(new ItemMatch { LostItemReportId = lost.Id, FoundItemReportId = found.Id, MatchScore = score });
            lost.Status = ItemStatus.PotentialMatch;
            found.Status = ItemStatus.PotentialMatch;
            db.Notifications.Add(new Notification { UserId = lost.UserId, Title = "Posible coincidencia encontrada", Message = $"Encontramos una coincidencia de {score}% para {lost.Title}.", Type = "match", RelatedEntityId = lost.Id });
        }
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item.ToDto());
    }

    [HttpPost("{id:guid}/image"), Authorize, RequestSizeLimit(5_000_000)]
    public async Task<ActionResult> Upload(Guid id, IFormFile file, CancellationToken ct)
    {
        var item = await db.ItemReports.SingleOrDefaultAsync(x => x.Id == id && x.UserId == User.UserId(), ct);
        if (item is null) return NotFound();
        if (file.Length == 0) return BadRequest(new { message = "El archivo está vacío." });
        if (file.Length > 5_000_000) return BadRequest(new { message = "La imagen no puede superar 5 MB." });
        await using var stream = file.OpenReadStream();
        item.ImageUrl = await images.SaveAsync(stream, file.FileName, file.ContentType, ct);
        await db.SaveChangesAsync(ct);
        return Ok(new { item.ImageUrl });
    }

    [HttpPatch("{id:guid}/resolve"), Authorize]
    public async Task<ActionResult> Resolve(Guid id)
    {
        var item = await db.ItemReports.SingleOrDefaultAsync(x => x.Id == id && x.UserId == User.UserId());
        if (item is null) return NotFound();
        item.Status = ItemStatus.Resolved;
        db.Notifications.Add(new Notification { UserId = item.UserId, Title = "Caso resuelto", Message = $"{item.Title} fue marcado como recuperado.", Type = "success", RelatedEntityId = item.Id });
        await db.SaveChangesAsync();
        return Ok(new { message = "Caso marcado como resuelto." });
    }

    [HttpDelete("{id:guid}"), Authorize]
    public async Task<ActionResult> Delete(Guid id)
    {
        var item = await db.ItemReports.SingleOrDefaultAsync(x => x.Id == id && (x.UserId == User.UserId() || User.IsInRole("Administrator")));
        if (item is null) return NotFound();
        item.Status = ItemStatus.Closed;
        await db.SaveChangesAsync();
        return NoContent();
    }
}

