namespace EncuentraYA.Domain;

public sealed class ItemMatch
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LostItemReportId { get; set; }
    public ItemReport? LostItemReport { get; set; }
    public Guid FoundItemReportId { get; set; }
    public ItemReport? FoundItemReport { get; set; }
    public int MatchScore { get; set; }
    public MatchStatus Status { get; set; } = MatchStatus.Suggested;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}


