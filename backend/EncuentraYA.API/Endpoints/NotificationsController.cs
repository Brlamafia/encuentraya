using EncuentraYA.Application;
using EncuentraYA.Domain;
using EncuentraYA.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EncuentraYA.API.Controllers;

[ApiController, Route("api/notifications"), Authorize]
public sealed class NotificationsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> Get() => Ok(await db.Notifications.AsNoTracking().Where(x => x.UserId == User.UserId()).OrderByDescending(x => x.CreatedAt).Take(50).ToListAsync());

    [HttpPatch("{id:guid}/read")]
    public async Task<ActionResult> Read(Guid id)
    {
        var notification = await db.Notifications.SingleOrDefaultAsync(x => x.Id == id && x.UserId == User.UserId());
        if (notification is null) return NotFound();
        notification.IsRead = true;
        await db.SaveChangesAsync();
        return NoContent();
    }
}


