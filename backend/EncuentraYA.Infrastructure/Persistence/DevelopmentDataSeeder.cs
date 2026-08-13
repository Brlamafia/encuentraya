using EncuentraYA.Application;
using EncuentraYA.Domain;
using Microsoft.EntityFrameworkCore;

namespace EncuentraYA.Infrastructure;

public static class SeedData
{
    private static readonly Dictionary<ItemCategory, string> ModernImages = new()
    {
        [ItemCategory.Headphones] = "https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=1200&q=88",
        [ItemCategory.Wallet] = "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=88",
        [ItemCategory.Keys] = "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1200&q=88",
        [ItemCategory.Backpack] = "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=88",
        [ItemCategory.Documents] = "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=88",
        [ItemCategory.Phone] = "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=88",
        [ItemCategory.Other] = "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=88",
        [ItemCategory.Electronics] = "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=1200&q=88",
        [ItemCategory.Clothing] = "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=88",
        [ItemCategory.Accessories] = "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=88"
    };

    public static async Task InitializeAsync(AppDbContext db, IPasswordService passwords)
    {
        var admin = await EnsureUser(db, passwords, "Ana", "Administradora", "admin@encuentraya.local", "Admin123!", UserRole.Administrator);
        var user = await EnsureUser(db, passwords, "Luis", "Campus", "user@encuentraya.local", "Usuario123!", UserRole.User);
        var maria = await EnsureUser(db, passwords, "María", "Santos", "maria@encuentraya.local", "Usuario123!", UserRole.User);

        if (!await db.ItemReports.AnyAsync())
        {
            var now = DateTime.UtcNow;
            db.ItemReports.AddRange(
                NewItem("Audífonos inalámbricos negros", "Audífonos over-ear negros dentro de un estuche rígido con una pequeña marca azul.", ReportType.Lost, ItemCategory.Headphones, "Edificio 4 · Laboratorio 2", now.AddDays(-2), user.Id),
                NewItem("Estuche de audífonos negro", "Encontrado debajo de una mesa. El estuche tiene una marca de color en uno de sus lados.", ReportType.Found, ItemCategory.Headphones, "Edificio 4 · Segundo nivel", now.AddDays(-1), maria.Id, "¿De qué color es la pequeña marca del estuche?"),
                NewItem("Cartera de cuero marrón", "Cartera compacta con varios compartimentos y documentos universitarios.", ReportType.Lost, ItemCategory.Wallet, "Cafetería central", now.AddDays(-4), maria.Id),
                NewItem("Llaves con cinta roja", "Juego de cuatro llaves encontrado junto a las escaleras del pasillo norte.", ReportType.Found, ItemCategory.Keys, "Edificio 2 · Primer nivel", now.AddDays(-1), admin.Id, "¿Qué texto aparece en el llavero?"),
                NewItem("Mochila gris para laptop", "Mochila gris con dos compartimentos, bolsillo acolchado y espacio lateral para botella.", ReportType.Lost, ItemCategory.Backpack, "Biblioteca", now.AddDays(-6), user.Id),
                NewItem("Carnet estudiantil", "Carnet encontrado cerca del área de registro del edificio administrativo.", ReportType.Found, ItemCategory.Documents, "Edificio administrativo", now.AddDays(-2), admin.Id, "Indica los últimos cuatro dígitos de tu matrícula."),
                NewItem("Celular Samsung azul", "Teléfono Galaxy azul con protector transparente y una pequeña marca en la esquina.", ReportType.Lost, ItemCategory.Phone, "Cancha principal", now.AddDays(-3), maria.Id),
                NewItem("Botella térmica verde", "Botella metálica verde con un adhesivo ilustrado en la parte inferior.", ReportType.Found, ItemCategory.Other, "Auditorio", now.AddDays(-1), user.Id, "¿Qué figura tiene el adhesivo?"),
                NewItem("Calculadora científica", "Calculadora científica negra utilizada en las materias de ingeniería.", ReportType.Lost, ItemCategory.Electronics, "Edificio 3 · Aula 204", now.AddDays(-2), user.Id),
                NewItem("Suéter azul marino", "Suéter azul marino talla mediana encontrado después de una clase.", ReportType.Found, ItemCategory.Clothing, "Edificio 1 · Aula 105", now.AddDays(-5), maria.Id, "¿Qué iniciales tiene la etiqueta interior?")
            );
            await db.SaveChangesAsync();
        }

        var seededItems = await db.ItemReports.OrderBy(x => x.CreatedAt).ToListAsync();
        foreach (var item in seededItems.Where(x => string.IsNullOrWhiteSpace(x.ImageUrl) || x.ImageUrl.StartsWith("https://images.unsplash.com")))
            item.ImageUrl = ModernImages.GetValueOrDefault(item.Category, ModernImages[ItemCategory.Other]);

        var lostHeadphones = seededItems.FirstOrDefault(x => x.ReportType == ReportType.Lost && x.Category == ItemCategory.Headphones);
        var foundHeadphones = seededItems.FirstOrDefault(x => x.ReportType == ReportType.Found && x.Category == ItemCategory.Headphones);
        if (lostHeadphones is not null && foundHeadphones is not null && !await db.Matches.AnyAsync(x => x.LostItemReportId == lostHeadphones.Id && x.FoundItemReportId == foundHeadphones.Id))
        {
            var score = new MatchingService().CalculateScore(lostHeadphones, foundHeadphones);
            db.Matches.Add(new ItemMatch { LostItemReportId = lostHeadphones.Id, FoundItemReportId = foundHeadphones.Id, MatchScore = score });
            lostHeadphones.Status = ItemStatus.PotentialMatch;
            foundHeadphones.Status = ItemStatus.PotentialMatch;
        }

        if (!await db.Notifications.AnyAsync(x => x.UserId == user.Id))
            db.Notifications.Add(new Notification { UserId = user.Id, Title = "¡Posible coincidencia!", Message = "Encontramos un reporte que podría coincidir con tus audífonos.", Type = "match", RelatedEntityId = lostHeadphones?.Id });

        var foundKeys = seededItems.FirstOrDefault(x => x.ReportType == ReportType.Found && x.Category == ItemCategory.Keys);
        if (foundKeys is not null)
        {
            var claim = await db.Claims.FirstOrDefaultAsync(x => x.ItemReportId == foundKeys.Id && x.ClaimantUserId == user.Id);
            if (claim is null)
            {
                claim = new Claim { ItemReportId = foundKeys.Id, ClaimantUserId = user.Id, Message = "Las perdí saliendo de clase y la cinta roja coincide.", VerificationAnswer = "ITLA 2026", Status = ClaimStatus.Approved };
                db.Claims.Add(claim);
            }
            else claim.Status = ClaimStatus.Approved;
            foundKeys.Status = ItemStatus.ClaimInProgress;

            var (first, second) = SortUsers(user.Id, admin.Id);
            var conversation = await db.Conversations.Include(x => x.Messages).FirstOrDefaultAsync(x => x.ItemReportId == foundKeys.Id && x.UserOneId == first && x.UserTwoId == second);
            if (conversation is null)
            {
                conversation = new Conversation { ItemReportId = foundKeys.Id, UserOneId = first, UserTwoId = second };
                db.Conversations.Add(conversation);
            }
            if (conversation.Messages.Count == 0)
            {
                conversation.Messages.Add(new Message { SenderId = admin.Id, Content = "Hola, revisé tu reclamación y la respuesta coincide con el objeto encontrado." });
                conversation.Messages.Add(new Message { SenderId = user.Id, Content = "¡Excelente! Puedo pasar por el edificio 2 esta tarde." });
                conversation.Messages.Add(new Message { SenderId = admin.Id, Content = "Perfecto, podemos vernos frente a recepción a las 3:30." });
            }
        }

        await db.SaveChangesAsync();
    }

    private static ItemReport NewItem(string title, string description, ReportType type, ItemCategory category, string location, DateTime date, Guid userId, string? verification = null) =>
        new() { Title = title, Description = description, ReportType = type, Category = category, Location = location, EventDate = date, UserId = userId, PrivateVerificationDetail = verification, ImageUrl = ModernImages.GetValueOrDefault(category) };

    private static async Task<User> EnsureUser(AppDbContext db, IPasswordService passwords, string firstName, string lastName, string email, string password, UserRole role)
    {
        var user = await db.Users.SingleOrDefaultAsync(x => x.Email == email);
        if (user is not null) return user;
        user = new User { FirstName = firstName, LastName = lastName, Email = email, PasswordHash = passwords.Hash(password), Role = role };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return user;
    }

    private static (Guid First, Guid Second) SortUsers(Guid a, Guid b) => a.CompareTo(b) < 0 ? (a, b) : (b, a);
}
