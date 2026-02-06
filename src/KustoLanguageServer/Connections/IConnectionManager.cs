using Kusto.Data;

namespace Kusto.Lsp;

public interface IConnectionManager
{
    string GetClusterName(string clusterOrConnection);
    KustoConnectionStringBuilder GetConnection(string clusterOrConnection, string? database = null);
}
