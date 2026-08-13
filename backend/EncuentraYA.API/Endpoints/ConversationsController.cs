using EncuentraYA.Application;
using EncuentraYA.Domain;
using EncuentraYA.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EncuentraYA.API.Controllers;

[ApiController, Route("api/conversations"), Authorize]
public sealed class ConversationsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> All()
    {
        var userId = User.UserId();
        var conversations = await db.Conversations.AsNoTracking().Include(x => x.ItemReport).Include(x => x.Messages).Include(x => x.UserOne).Include(x => x.UserTwo)
            .Where(x => x.UserOneId == userId || x.UserTwoId == userId).ToListAsync();
        return Ok(conversations.Select(x =>
        {
            var other = x.UserOneId == userId ? x.UserTwo! : x.UserOne!;
            var last = x.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault();
            return new ConversationDto(x.Id, x.ItemReportId, x.ItemReport!.Title, x.ItemReport.ImageUrl, other.Id,
                $"{other.FirstName} {other.LastName}", other.ProfileImageUrl, last?.Content, last?.CreatedAt, x.CreatedAt);
        }).OrderByDescending(x => x.LastMessageAt ?? x.CreatedAt));
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateConversationRequest request)
    {
        var userId = User.UserId();
        var item = await db.ItemReports.AsNoTracking().SingleOrDefaultAsync(x => x.Id == request.ItemReportId && x.Status != ItemStatus.Closed);
        if (item is null) return NotFound();
        if (request.RecipientUserId != item.UserId || request.RecipientUserId == userId)
            return BadRequest(new { message = "Solo puedes contactar al publicador desde su reporte." });
        var (first, second) = SortUsers(userId, request.RecipientUserId);
        var existing = await db.Conversations.SingleOrDefaultAsync(x => x.ItemReportId == item.Id && x.UserOneId == first && x.UserTwoId == second);
        if (existing is not null) return Ok(new { existing.Id });
        var conversation = new Conversation { ItemReportId = item.Id, UserOneId = first, UserTwoId = second };
        db.Conversations.Add(conversation);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = conversation.Id }, new { conversation.Id });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult> Get(Guid id)
    {
        var userId = User.UserId();
        var conversation = await db.Conversations.Include(x => x.ItemReport).Include(x => x.Messages).ThenInclude(x => x.Sender).Include(x => x.UserOne).Include(x => x.UserTwo)
            .SingleOrDefaultAsync(x => x.Id == id && (x.UserOneId == userId || x.UserTwoId == userId));
        if (conversation is null) return NotFound();
        foreach (var message in conversation.Messages.Where(x => x.SenderId != userId && !x.IsRead)) message.IsRead = true;
        await db.SaveChangesAsync();
        var other = conversation.UserOneId == userId ? conversation.UserTwo! : conversation.UserOne!;
        return Ok(new
        {
            conversation.Id, conversation.ItemReportId, ItemTitle = conversation.ItemReport!.Title, conversation.ItemReport.ImageUrl,
            OtherUserName = $"{other.FirstName} {other.LastName}",
            Messages = conversation.Messages.OrderBy(x => x.CreatedAt).Select(x => new MessageDto(x.Id, x.ConversationId, x.SenderId,
                x.Sender is null ? "Usuario" : $"{x.Sender.FirstName} {x.Sender.LastName}", x.Content, x.CreatedAt, x.IsRead))
        });
    }

    [HttpPost("{id:guid}/messages")]
    public async Task<ActionResult> Send(Guid id, SendMessageRequest request)
    {
        var userId = User.UserId();
        if (!await db.Conversations.AnyAsync(x => x.Id == id && (x.UserOneId == userId || x.UserTwoId == userId))) return NotFound();
        if (string.IsNullOrWhiteSpace(request.Content)) return BadRequest(new { message = "Escribe un mensaje." });
        if (request.Content.Trim().Length > 2000) return BadRequest(new { message = "El mensaje no puede superar 2000 caracteres." });
        var message = new Message { ConversationId = id, SenderId = userId, Content = request.Content.Trim() };
        db.Messages.Add(message);
        await db.SaveChangesAsync();
        return Ok(new MessageDto(message.Id, message.ConversationId, message.SenderId, User.Identity?.Name ?? "Tú", message.Content, message.CreatedAt, message.IsRead));
    }

    private static (Guid First, Guid Second) SortUsers(Guid a, Guid b) => a.CompareTo(b) < 0 ? (a, b) : (b, a);
}

