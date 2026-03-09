// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;
using System.Data;
using Kusto.Data.Utils;
using Kusto.Language;
using Kusto.Language.Editor;

namespace Kusto.Lsp;

public interface IQueryManager
{
    /// <summary>
    /// Validates a query and returns any diagnostics.
    /// </summary>
    Task<IReadOnlyList<Diagnostic>> ValidateQueryAsync(
        string query,
        string clusterName,
        string? databaseName,
        CancellationToken cancellationToken);

    /// <summary>
    /// Runs the query text against the specified cluster and database.
    /// </summary>
    Task<RunResult?> RunQueryAsync(
        EditString query,
        string clusterName,
        string? databaseName,
        ImmutableDictionary<string, string> queryOptions,
        ImmutableDictionary<string, string> queryParameters,
        CancellationToken cancellationToken
        );
}

/// <summary>
/// The result of running a document query.
/// </summary>
public record RunResult
{
    /// <summary>
    /// The query text that was ultimately executed.
    /// This is a portion of the document text.
    /// </summary>
    public required EditString Query { get; init; }

    /// <summary>
    /// The result of executing the query, including any relevant diagnostics.
    /// </summary>
    public ExecuteResult? ExecuteResult { get; init; }

    /// <summary>
    /// The final query options, if the query alterated the global query options.
    /// </summary>
    public ImmutableDictionary<string, string>? QueryOptions { get; init; }

    /// <summary>
    /// The final query parameters, if the query altered the global query parameters.
    /// </summary>
    public ImmutableDictionary<string, string>? QueryParameters { get; init; }

    /// <summary>
    /// The resulting connection string.
    /// </summary>
    public string? Connection { get; init; }

    /// <summary>
    /// The resulting cluster
    /// </summary>
    public string? Cluster { get; init; }

    /// <summary>
    /// The resulting database
    /// </summary>
    public string? Database { get; init; }

    /// <summary>
    /// The error if the run failed.
    /// </summary>
    public Diagnostic? Error { get; init; }
};
