using EncuentraYA.Domain;

namespace EncuentraYA.Application;

public interface IPasswordService
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public interface ITokenService { string Create(User user); }
public interface IImageStorageService { Task<string> SaveAsync(Stream stream, string fileName, string contentType, CancellationToken ct); }
public interface IMatchingService { int CalculateScore(ItemReport lost, ItemReport found); }
