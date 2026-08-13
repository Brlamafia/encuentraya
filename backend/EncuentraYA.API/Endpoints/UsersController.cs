using EncuentraYA.Application;
using EncuentraYA.Domain;
using EncuentraYA.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EncuentraYA.API.Controllers;

[ApiController, Route("api/users"), Authorize]
public sealed class UsersController(AppDbContext db) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult> Me()
    {
        var user = await db.Users.FindAsync(User.UserId());
        return user is null ? NotFound() : Ok(user.ToDto());
    }

    [HttpPut("me")]
    public async Task<ActionResult> Update(UpdateProfileRequest request)
    {
        var user = await db.Users.FindAsync(User.UserId());
        if (user is null) return NotFound();
        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.ProfileImageUrl = request.ProfileImageUrl;
        await db.SaveChangesAsync();
        return Ok(user.ToDto());
    }
}


