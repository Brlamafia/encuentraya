namespace EncuentraYA.Application;

public record CreateClaimRequest(Guid ItemReportId, string Message, string VerificationAnswer, string? AdditionalDetail);
public record ClaimDto(Guid Id, Guid ItemReportId, string ItemTitle, string? ItemImageUrl, Guid ClaimantUserId, string ClaimantName, string Message, string? VerificationAnswer, string? AdditionalDetail, string Status, DateTime CreatedAt, DateTime UpdatedAt, bool CanManage);
