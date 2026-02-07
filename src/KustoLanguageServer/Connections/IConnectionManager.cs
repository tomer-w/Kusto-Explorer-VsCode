using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Toolkit;

namespace Kusto.Lsp;

public interface IConnectionManager
{
    string GetClusterName(string clusterOrConnection);
    IConnection GetConnection(string clusterOrConnection, string? database = null);
}

public interface IConnection
{
    string Hostname { get; }
    string? InitialCatalog { get; }

    public ICslQueryProvider QueryProvider { get; }
    public ICslAdminProvider AdminProvider { get; }
    public SymbolLoader SymbolLoader { get; }
}