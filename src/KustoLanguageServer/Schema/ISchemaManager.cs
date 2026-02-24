namespace Kusto.Lsp;

public interface ISchemaManager : ISchemaSource
{
    /// <summary>
    /// Refreshes the cached schema for the given cluster and database. 
    /// If database is null, refreshes the all the databases in the cluster.
    /// </summary>
    Task RefreshAsync(string clusterName, string? databaseName, CancellationToken cancellationToken);
}
