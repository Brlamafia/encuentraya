using EncuentraYA.Application;
using EncuentraYA.Domain;
using EncuentraYA.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EncuentraYA.API.Controllers;

[ApiController, Route("api/admin"), Authorize(Roles = "Administrator")]
public sealed class AdminController(AppDbContext db) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<ActionResult> Dashboard() => Ok(new
    {
        users = await db.Users.CountAsync(), lost = await db.ItemReports.CountAsync(x => x.ReportType == ReportType.Lost && x.Status != ItemStatus.Closed),
        found = await db.ItemReports.CountAsync(x => x.ReportType == ReportType.Found && x.Status != ItemStatus.Closed),
        resolved = await db.ItemReports.CountAsync(x => x.Status == ItemStatus.Resolved), pendingClaims = await db.Claims.CountAsync(x => x.Status == ClaimStatus.Pending)
    });

    [HttpGet("users")]
    public async Task<ActionResult> Users() => Ok(await db.Users.AsNoTracking().OrderByDescending(x => x.CreatedAt).Select(x => new { x.Id, x.FirstName, x.LastName, x.Email, Role = x.Role.ToString(), x.IsActive, x.CreatedAt }).ToListAsync());

    [HttpPatch("users/{id:guid}/toggle-active")]
    public async Task<ActionResult> Toggle(Guid id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();
        user.IsActive = !user.IsActive;
        await db.SaveChangesAsync();
        return Ok(new { user.IsActive });
    }

    [HttpGet("items")]
    public async Task<ActionResult> Items()
    {
        var items = await db.ItemReports.AsNoTracking().Include(x => x.User).OrderByDescending(x => x.CreatedAt).ToListAsync();
        return Ok(items.Select(x => x.ToDto()));
    }

    [HttpGet("claims")]
    public async Task<ActionResult> Claims() => Ok(await db.Claims.AsNoTracking().OrderByDescending(x => x.CreatedAt).Select(x => new { x.Id, x.ItemReportId, x.ClaimantUserId, Status = x.Status.ToString(), x.CreatedAt }).ToListAsync());
}

