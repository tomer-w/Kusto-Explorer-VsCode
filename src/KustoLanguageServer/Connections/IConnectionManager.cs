// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

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
        return TryGetConnection(clusterName, databaseName, null, out connection);
    }

    /// <summary>
    /// Gets the connection base on the cluster name and the default database,
    /// relative to a context cluster.
    /// </summary>
    bool TryGetConnection(string clusterName, string? databaseName, string? contextCluster, [NotNullWhen(true)] out IConnection? connection)
    {
        if (contextCluster != null && TryGetConnection(contextCluster, out connection))
        {
            connection = connection.WithCluster(clusterName);
            if (databaseName != null)
                connection = connection.WithDatabase(databaseName);
        }
        else if (TryGetConnection(clusterName, out connection))
        {
            if (databaseName != null)
                connection = connection.WithDatabase(databaseName);
        }

        return connection != null;
    }
}
