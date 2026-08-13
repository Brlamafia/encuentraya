namespace EncuentraYA.Application;

public record SendMessageRequest(string Content);
public record CreateConversationRequest(Guid ItemReportId, Guid RecipientUserId);
public record MessageDto(Guid Id, Guid ConversationId, Guid SenderId, string SenderName, string Content, DateTime CreatedAt, bool IsRead);
public record ConversationDto(Guid Id, Guid ItemReportId, string ItemTitle, string? ItemImageUrl, Guid OtherUserId, string OtherUserName, string? OtherUserImageUrl, string? LastMessage, DateTime? LastMessageAt, DateTime CreatedAt);
