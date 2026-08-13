using EncuentraYA.Domain;
using Microsoft.EntityFrameworkCore;

namespace EncuentraYA.Infrastructure;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<ItemReport> ItemReports => Set<ItemReport>();
    public DbSet<Claim> Claims => Set<Claim>();
    public DbSet<ItemMatch> Matches => Set<ItemMatch>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasPostgresEnum<UserRole>().HasPostgresEnum<ReportType>().HasPostgresEnum<ItemStatus>().HasPostgresEnum<ItemCategory>().HasPostgresEnum<ClaimStatus>().HasPostgresEnum<MatchStatus>();
        b.Entity<User>().HasIndex(x => x.Email).IsUnique();
        b.Entity<User>().Property(x => x.Email).HasMaxLength(200);
        b.Entity<ItemReport>().HasIndex(x => new { x.ReportType, x.Category, x.Status });
        b.Entity<ItemReport>().HasIndex(x => x.EventDate);
        b.Entity<ItemReport>().Property(x => x.Title).HasMaxLength(140);
        b.Entity<ItemReport>().Property(x => x.PrivateVerificationDetail).HasMaxLength(500);
        b.Entity<ItemReport>().HasOne(x => x.User).WithMany(x => x.Reports).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Claim>().HasOne(x => x.ItemReport).WithMany().HasForeignKey(x => x.ItemReportId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Claim>().HasOne(x => x.ClaimantUser).WithMany().HasForeignKey(x => x.ClaimantUserId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<ItemMatch>().HasIndex(x => new { x.LostItemReportId, x.FoundItemReportId }).IsUnique();
        b.Entity<ItemMatch>().HasOne(x => x.LostItemReport).WithMany().HasForeignKey(x => x.LostItemReportId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<ItemMatch>().HasOne(x => x.FoundItemReport).WithMany().HasForeignKey(x => x.FoundItemReportId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Message>().HasOne<Conversation>().WithMany(x => x.Messages).HasForeignKey(x => x.ConversationId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Conversation>().HasOne(x => x.UserOne).WithMany().HasForeignKey(x => x.UserOneId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Conversation>().HasOne(x => x.UserTwo).WithMany().HasForeignKey(x => x.UserTwoId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Conversation>().HasIndex(x => new { x.ItemReportId, x.UserOneId, x.UserTwoId }).IsUnique();
        b.Entity<Message>().HasOne(x => x.Sender).WithMany().HasForeignKey(x => x.SenderId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Message>().Property(x => x.Content).HasMaxLength(2000);
        b.Entity<Notification>().HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
