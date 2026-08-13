using EncuentraYA.Application;
using EncuentraYA.Domain;
using EncuentraYA.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EncuentraYA.API.Controllers;

[ApiController, Route("api/matches"), Authorize]
public sealed class MatchesController(AppDbContext db) : ControllerBase
{
    [HttpGet("mine")]
    public async Task<ActionResult> Mine()
    {
        var userId = User.UserId();
        var matches = await db.Matches.AsNoTracking().Include(x => x.LostItemReport)!.ThenInclude(x => x!.User).Include(x => x.FoundItemReport)!.ThenInclude(x => x!.User)
            .Where(x => x.Status != MatchStatus.Dismissed && (x.LostItemReport!.UserId == userId || x.FoundItemReport!.UserId == userId)).OrderByDescending(x => x.MatchScore).ToListAsync();
        return Ok(matches.Select(x => new { x.Id, x.MatchScore, Status = x.Status.ToString(), Lost = x.LostItemReport!.ToDto(), Found = x.FoundItemReport!.ToDto() }));
    }

    [HttpPatch("{id:guid}/dismiss")]
    public async Task<ActionResult> Dismiss(Guid id)
    {
        var userId = User.UserId();
        var match = await db.Matches.Include(x => x.LostItemReport).Include(x => x.FoundItemReport).SingleOrDefaultAsync(x => x.Id == id && (x.LostItemReport!.UserId == userId || x.FoundItemReport!.UserId == userId));
        if (match is null) return NotFound();
        match.Status = MatchStatus.Dismissed;
        await db.SaveChangesAsync();
        return NoContent();
    }
}


