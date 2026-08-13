using System.Security.Cryptography;
using EncuentraYA.Application;
using EncuentraYA.Domain;

namespace EncuentraYA.Infrastructure;

public sealed class PasswordService : IPasswordService
{
    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 120_000, HashAlgorithmName.SHA256, 32);
        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }
    public bool Verify(string password, string stored)
    {
        var parts = stored.Split('.');
        if (parts.Length != 2) return false;
        var actual = Rfc2898DeriveBytes.Pbkdf2(password, Convert.FromBase64String(parts[0]), 120_000, HashAlgorithmName.SHA256, 32);
        return CryptographicOperations.FixedTimeEquals(actual, Convert.FromBase64String(parts[1]));
    }
}

public sealed class MatchingService : IMatchingService
{
    public int CalculateScore(ItemReport lost, ItemReport found)
    {
        var score = lost.Category == found.Category ? 35 : 0;
        var lostWords = Words(lost.Title + " " + lost.Description);
        var foundWords = Words(found.Title + " " + found.Description);
        var union = lostWords.Union(foundWords).Count();
        if (union > 0) score += (int)Math.Round(30d * lostWords.Intersect(foundWords).Count() / union);
        if (Normalize(lost.Location).Contains(Normalize(found.Location)) || Normalize(found.Location).Contains(Normalize(lost.Location))) score += 20;
        var days = Math.Abs((lost.EventDate.Date - found.EventDate.Date).TotalDays);
        score += days <= 1 ? 15 : days <= 3 ? 10 : days <= 7 ? 5 : 0;
        return Math.Clamp(score, 0, 100);
    }
    private static HashSet<string> Words(string value) => value.ToLowerInvariant().Split([' ', ',', '.', '-', '/', '\n'], StringSplitOptions.RemoveEmptyEntries).Where(x => x.Length > 2).ToHashSet();
    private static string Normalize(string value) => value.Trim().ToLowerInvariant();
}

public sealed class LocalImageStorageService(string webRoot) : IImageStorageService
{
    private static readonly IReadOnlyDictionary<string, string> AllowedTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["image/jpeg"] = ".jpg",
        ["image/png"] = ".png",
        ["image/webp"] = ".webp"
    };
    public async Task<string> SaveAsync(Stream stream, string fileName, string contentType, CancellationToken ct)
    {
        if (!AllowedTypes.TryGetValue(contentType, out var extension))
            throw new InvalidOperationException("Solo se permiten imágenes JPG, PNG o WebP.");

        var header = new byte[12];
        var bytesRead = await stream.ReadAsync(header.AsMemory(0, header.Length), ct);
        if (!HasValidSignature(contentType, header.AsSpan(0, bytesRead)))
            throw new InvalidOperationException("El contenido del archivo no corresponde a una imagen válida.");
        if (!stream.CanSeek)
            throw new InvalidOperationException("No se pudo validar el archivo recibido.");
        stream.Position = 0;

        // Never trust a client-provided extension; derive it from the accepted MIME type.
        var safeName = $"{Guid.NewGuid():N}{extension}";
        var folder = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(folder);
        await using var output = File.Create(Path.Combine(folder, safeName));
        await stream.CopyToAsync(output, ct);
        return $"/uploads/{safeName}";
    }

    private static bool HasValidSignature(string contentType, ReadOnlySpan<byte> bytes) => contentType.ToLowerInvariant() switch
    {
        "image/jpeg" => bytes.Length >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF,
        "image/png" => bytes.Length >= 8 && bytes[..8].SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }),
        "image/webp" => bytes.Length >= 12 && bytes[..4].SequenceEqual("RIFF"u8) && bytes[8..12].SequenceEqual("WEBP"u8),
        _ => false
    };
}
