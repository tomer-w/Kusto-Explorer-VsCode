using System.Collections.Immutable;
using System.Data;
using Kusto.Data.Utils;
using Kusto.Language;
using Kusto.Language.Editor;

namespace Kusto.Lsp;

public interface IQueryManager
{
    /// <summary>
    /// Runs the query at the specified position in the script.
    /// </summary>
    Task<RunResult?> RunQueryAsync(
        Document document, 
        TextRange range, 
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
    public EditString? Query { get; init; }

    /// <summary>
    /// The resulting <see cref="DataTable"/>
    /// </summary>
    public DataTable? Data { get; init; }

    /// <summary>
    /// The chart options if the query results contain a render command.
    /// </summary>
    public ChartVisualizationOptions? ChartOptions { get; init; }
    
    /// <summary>
    /// The final query options, if the query is a command that alters the global query options.
    /// </summary>
    public ImmutableDictionary<string, string>? QueryOptions { get; init; }

    /// <summary>
    /// The find query parameters, if the query is a command that alters the global query parameters.
    /// </summary>
    public ImmutableDictionary<string, string>? QueryParameters { get; init; }

    /// <summary>
    /// The resulting cluster
    /// </summary>
    public string? Cluster { get; init; }

    /// <summary>
    /// The resulting database
    /// </summary>
    public string? Database { get; init; }

    /// <summary>
    /// The error if the query failed.
    /// </summary>
    public Diagnostic? Error { get; init; }
};

