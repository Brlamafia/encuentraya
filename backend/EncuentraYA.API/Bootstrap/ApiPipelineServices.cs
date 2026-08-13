using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EncuentraYA.Application;
using EncuentraYA.Domain;
using Microsoft.IdentityModel.Tokens;

namespace EncuentraYA.API;

public sealed class JwtTokenService(IConfiguration configuration) : ITokenService
{
    public string Create(User user)
    {
        var claims = new[] { new System.Security.Claims.Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), new System.Security.Claims.Claim(JwtRegisteredClaimNames.Email, user.Email), new System.Security.Claims.Claim(ClaimTypes.Role, user.Role.ToString()), new System.Security.Claims.Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}") };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"] ?? "development-only-key-change-me-32-characters"));
        var token = new JwtSecurityToken(configuration["Jwt:Issuer"] ?? "EncuentraYA", configuration["Jwt:Audience"] ?? "EncuentraYA.Web", claims, expires: DateTime.UtcNow.AddHours(8), signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public sealed class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try { await next(context); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled request error");
            context.Response.StatusCode = ex is InvalidOperationException ? 400 : 500;
            await context.Response.WriteAsJsonAsync(new { message = ex is InvalidOperationException ? ex.Message : "Ocurrió un error inesperado." });
        }
    }
}

public static class ClaimsPrincipalExtensions
{
    public static Guid UserId(this ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException());
}
