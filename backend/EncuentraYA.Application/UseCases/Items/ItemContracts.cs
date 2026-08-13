using EncuentraYA.Domain;

namespace EncuentraYA.Application;

public record CreateItemRequest(string Title, string Description, ReportType ReportType, ItemCategory Category, string Location, DateTime EventDate, string? PrivateVerificationDetail);
public record ItemDto(Guid Id, string Title, string Description, string ReportType, string Category, string Location, DateTime EventDate, DateTime CreatedAt, string Status, Guid UserId, string PublisherName, string? ImageUrl);
