using System.Data;
using Kusto.Data.Utils;
using Kusto.Language.Editor;

namespace Kusto.Lsp;

public interface IQueryManager
{
    /// <summary>
    /// Runs the query at the specified position in the script.
    /// </summary>
    Task<QueryResult?> RunQueryAsync(Uri scriptId, TextRange range, CancellationToken cancellationToken);
}

public record QueryResult(DataTable? Data, ChartVisualizationOptions? ChartOptions, string? Error);

