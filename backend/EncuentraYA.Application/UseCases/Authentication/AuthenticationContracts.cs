namespace EncuentraYA.Application;

public record RegisterRequest(string FirstName, string LastName, string Email, string Password, string ConfirmPassword);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, UserDto User);
