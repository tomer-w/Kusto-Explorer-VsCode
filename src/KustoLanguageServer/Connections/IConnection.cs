using System.Collections.Immutable;
using System.Data;
using Kusto.Data;
using Kusto.Data.Utils;
using Kusto.Language;
using Kusto.Language.Editor;

namespace Kusto.Lsp;

public interface IConnection
{
    /// <summary>
    /// The cluster (host name of server)
    /// </summary>
    string Cluster { get; }

    /// <summary>
    /// The default database, optional
    /// </summary>
    string? Database { get; }

    /// <summary>
    /// Gets the equivalent connection, but referring to the specified cluster.
    /// </summary>
    IConnection WithCluster(string clusterName);

    /// <summary>
    /// Gets the equivalent connection, but referring the specified database.
    /// </summary>
    IConnection WithDatabase(string databaseName);

    /// <summary>
    ///Gets the equivalent connection, but referring to the specified cluster and database
    /// </summary>
    IConnection WithClusterAndDatabase(string clusterName, string? databaseName)
    {
        var result = WithCluster(clusterName);
        if (databaseName != null)
            result = result.WithDatabase(databaseName);
        return result;
    }

    /// <summary>
    /// Executes a query over the connection.
    /// </summary>
    public Task<ExecuteResult> ExecuteAsync(
        EditString query,
        ImmutableDictionary<string, string>? options = null,
        ImmutableDictionary<string, string>? parameters = null,
        CancellationToken cancellationToken = default
        );

    /// <summary>
    /// Execute a query over the connection, returning the typed results.
    /// </summary>
    public Task<ExecuteResult<T>> ExecuteAsync<T>(
        EditString query,
        ImmutableDictionary<string, string>? options = null,
        ImmutableDictionary<string, string>? parameters = null,
        CancellationToken cancellationToken = default
        );

    /// <summary>
    /// Gets the kind of server this connection is connected to.
    /// </summary>
    public Task<string> GetServerKindAsync(CancellationToken cancellationToken);
}

/// <summary>
/// A connection that has access for a <see cref="KustoConnectionStringBuilder"/>
/// </summary>
public interface IKustoConnection : IConnection
{
    /// <summary>
    /// Gets a copy of the underying connection string builder
    /// </summary>
    public KustoConnectionStringBuilder GetBuilder();
}

public record ExecuteResult
{
    public ImmutableList<DataTable>? Tables { get; init; }
    public ChartVisualizationOptions? ChartOptions { get; init; }
    public ImmutableList<Diagnostic>? Diagnostics { get; init; }
}

public record ExecuteResult<T>
{
    public ImmutableList<T>? Values { get; init; }
    public ImmutableList<Diagnostic>? Diagnostics { get; init; }
}