namespace EncuentraYA.Domain;

public sealed class Conversation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ItemReportId { get; set; }
    public ItemReport? ItemReport { get; set; }
    public Guid UserOneId { get; set; }
    public User? UserOne { get; set; }
    public Guid UserTwoId { get; set; }
    public User? UserTwo { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Message> Messages { get; set; } = [];
}


