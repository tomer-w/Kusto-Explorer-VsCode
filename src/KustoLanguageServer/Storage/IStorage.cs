
namespace Kusto.Lsp;

/// <summary>
/// A fast persistent key-value store
/// </summary>
public interface IStorage
{
    /// <summary>
    /// Persists the value with the given key.
    /// </summary>
    Task SetValueAsync<T>(string key, T? value, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the persisted value for the key.
    /// </summary>
    Task<T?> GetValueAsync<T>(string key, CancellationToken cancellationToken = default);
}
