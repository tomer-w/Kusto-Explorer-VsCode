using Kusto.Data.Common;
using Kusto.Toolkit;

namespace Kusto.Lsp;

public interface IConnection
{
    /// <summary>
    /// The host name of the server/cluster
    /// </summary>
    string Hostname { get; }

    /// <summary>
    /// The default database
    /// </summary>
    string? InitialCatalog { get; }

    /// <summary>
    /// The <see cref="ICslQueryProvider"/> associated with this connection.
    /// </summary>
    public ICslQueryProvider QueryProvider { get; }

    /// <summary>
    /// The <see cref="ICslAdminProvider"/> associated with this connection
    /// </summary>
    public ICslAdminProvider AdminProvider { get; }

    /// <summary>
    /// The <see cref="SymbolLoader"/> associated with this connection.
    /// </summary>
    public SymbolLoader SymbolLoader { get; }
}