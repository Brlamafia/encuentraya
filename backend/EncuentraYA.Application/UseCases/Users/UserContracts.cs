namespace EncuentraYA.Application;

public record UserDto(Guid Id, string FirstName, string LastName, string Email, string? ProfileImageUrl, string Role, DateTime CreatedAt);
public record UpdateProfileRequest(string FirstName, string LastName, string? ProfileImageUrl);
