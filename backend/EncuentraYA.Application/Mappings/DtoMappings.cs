using EncuentraYA.Domain;

namespace EncuentraYA.Application;

public static class MappingExtensions
{
    public static UserDto ToDto(this User user) => new(user.Id, user.FirstName, user.LastName, user.Email, user.ProfileImageUrl, user.Role.ToString(), user.CreatedAt);
    public static ItemDto ToDto(this ItemReport item) => new(item.Id, item.Title, item.Description, item.ReportType.ToString(), item.Category.ToString(), item.Location, item.EventDate, item.CreatedAt, item.Status.ToString(), item.UserId, item.User is null ? "Comunidad ITLA" : $"{item.User.FirstName} {item.User.LastName}", item.ImageUrl);
}
