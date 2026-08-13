namespace EncuentraYA.Domain;

public sealed class ItemReport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Title { get; set; }
    public required string Description { get; set; }
    public ReportType ReportType { get; set; }
    public ItemCategory Category { get; set; }
    public required string Location { get; set; }
    public DateTime EventDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ItemStatus Status { get; set; } = ItemStatus.Active;
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string? ImageUrl { get; set; }
    public string? PrivateVerificationDetail { get; set; }
}


