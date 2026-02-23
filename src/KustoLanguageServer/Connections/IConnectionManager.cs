using System.Diagnostics.CodeAnalysis;

namespace Kusto.Lsp;

public interface IConnectionManager
{
    /// <summary>
    /// Gets or adds a connection given a connection string.
    /// </summary>
    IConnection GetOrAddConnection(string connectionStrings);

    /// <summary>
    /// Gets the connection based on the cluster name.
    /// </summary>
    bool TryGetConnection(string clusterName, [NotNullWhen(true)] out IConnection? connection);

    /// <summary>
    /// Gets the connection based on the cluster name and default database.
    /// </summary>
    bool TryGetConnection(string clusterName, string? databaseName, [NotNullWhen(true)] out IConnection? connection)
    {
        if (TryGetConnection(clusterName, out connection))
        {
            if (databaseName != null)
                connection = connection.WithDatabase(databaseName);
            return true;
        }

        connection = null;
        return false;
    }
}
