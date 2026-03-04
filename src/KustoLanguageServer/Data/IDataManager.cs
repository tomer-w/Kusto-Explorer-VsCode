
namespace Kusto.Lsp;

public interface IDataManager
{
    /// <summary>
    /// Persists the data with the given key.
    /// </summary>
    Task SetDataAsync<T>(string key, T? data, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the persisted data for the key.
    /// </summary>
    Task<T?> GetDataAsync<T>(string key, CancellationToken cancellationToken = default);
}
