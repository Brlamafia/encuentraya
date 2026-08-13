namespace EncuentraYA.Domain;

public sealed class Claim
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ItemReportId { get; set; }
    public ItemReport? ItemReport { get; set; }
    public Guid ClaimantUserId { get; set; }
    public User? ClaimantUser { get; set; }
    public required string Message { get; set; }
    public required string VerificationAnswer { get; set; }
    public string? AdditionalDetail { get; set; }
    public ClaimStatus Status { get; set; } = ClaimStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}


