using Kusto.Data;
using Kusto.Language;

namespace Kusto.Lsp;

public interface IConnectionManager
{
    IConnection GetConnection(string clusterOrConnection, string? database = null);

    Task<string> GetServerKindAsync(string clusterOrConnection, CancellationToken cancellationToken);
}
