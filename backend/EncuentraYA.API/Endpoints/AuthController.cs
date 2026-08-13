using EncuentraYA.Application;
using EncuentraYA.Domain;
using EncuentraYA.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EncuentraYA.API.Controllers;

[ApiController, Route("api/auth")]
public sealed class AuthController(AppDbContext db, IPasswordService passwords, ITokenService tokens) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
            return BadRequest(new { message = "Nombre y apellido son obligatorios." });
        if (request.Password != request.ConfirmPassword) return BadRequest(new { message = "Las contraseñas no coinciden." });
        if (request.Password.Length < 8) return BadRequest(new { message = "La contraseña debe tener al menos 8 caracteres." });
        var email = request.Email.Trim().ToLowerInvariant();
        if (!email.Contains('@')) return BadRequest(new { message = "Ingresa un correo válido." });
        if (await db.Users.AnyAsync(x => x.Email == email)) return Conflict(new { message = "Ya existe una cuenta con ese correo." });
        var user = new User { FirstName = request.FirstName.Trim(), LastName = request.LastName.Trim(), Email = email, PasswordHash = passwords.Hash(request.Password) };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return Created("/api/users/me", new AuthResponse(tokens.Create(user), user.ToDto()));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await db.Users.SingleOrDefaultAsync(x => x.Email == request.Email.Trim().ToLowerInvariant());
        if (user is null || !user.IsActive || !passwords.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Correo o contraseña incorrectos." });
        return Ok(new AuthResponse(tokens.Create(user), user.ToDto()));
    }
}


