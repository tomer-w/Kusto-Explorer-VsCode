// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

namespace Kusto.Vscode;

public interface ISchemaManager : ISchemaSource
{
    /// <summary>
    /// Clears cluster information from the schema cache.
    /// </summary>
    Task ClearCachedClusterAsync(string clusterName, CancellationToken cancellationToken);

    /// <summary>
    /// Clears database information from the schema cache.
    /// </summary>
    Task ClearCachedDatabaseAsync(string clusterName, string databaseName, CancellationToken cancellationToken);

    /// <summary>
    /// An event fired when the cluster schema has been refreshed on the background.
    /// </summary>
    event ClusterSchemaRefreshedHandler? ClusterRefreshed;

    /// <summary>
    /// An event fired when the database schema has been refreshed on the background.
    /// </summary>
    event DatabaseSchemaRefreshedHandler? DatabaseRefreshed;
}

public delegate void ClusterSchemaRefreshedHandler(string clusterName);
public delegate void DatabaseSchemaRefreshedHandler(string clusterName, string databaseName);



