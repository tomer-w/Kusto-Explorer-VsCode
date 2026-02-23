using System.Collections.Immutable;
using System.Runtime.Serialization;

namespace Kusto.Lsp;

public interface ISchemaSource
{
    /// <summary>
    /// Gets the cluster schema including all the database names, etc.
    /// Does not include all the database schemas.
    /// </summary>
    Task<ClusterInfo?> GetClusterInfoAsync(string clusterName, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the database schema including all entity definitions.
    /// </summary>
    Task<DatabaseInfo?> GetDatabaseInfoAsync(string clusterName, string databaseName, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the database table entities
    /// </summary>
    Task<ImmutableList<TableInfo>> GetTableInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the database external table entities
    /// </summary>
    Task<ImmutableList<ExternalTableInfo>> GetExternalTableInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the database materialized views entities
    /// </summary>
    Task<ImmutableList<MaterializedViewInfo>> GetMaterializedViewInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the database function entities
    /// </summary>
    Task<ImmutableList<FunctionInfo>> GetFunctionInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the database entity group entities
    /// </summary>
    Task<ImmutableList<EntityGroupInfo>> GetEntityGroupInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the database graph model entities
    /// </summary>
    Task<ImmutableList<GraphModelInfo>> GetGraphModelInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the database stored query result entities
    /// </summary>
    Task<ImmutableList<StoredQueryResultInfo>> GetStoredQueryResultInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken);
}

[DataContract]
public class ClusterInfo
{
    [DataMember(Name = "databases")]
    public ImmutableList<DatabaseName> Databases 
    { 
        get => field ?? ImmutableList<DatabaseName>.Empty;
        init;
    }

    [DataMember(Name = "plugins")]
    public ImmutableList<string> Plugins
    {
        get => field ?? ImmutableList<string>.Empty;
        init;
    }
}

[DataContract]
public class DatabaseName
{
    [DataMember(Name = "name")]
    public required string Name { get; init; }

    [DataMember(Name = "alternateName")]
    public required string AlternateName { get; init; }
}

[DataContract]
public class DatabaseInfo
{
    [DataMember(Name = "name")]
    public required string Name { get; init; }

    [DataMember(Name = "alternateName")]
    public string? AlternateName { get; init; }

    [DataMember(Name = "tables")]
    public ImmutableList<TableInfo> Tables 
    {
        get => field ?? ImmutableList<TableInfo>.Empty;
        init; 
    }

    [DataMember(Name = "externalTables")]
    public ImmutableList<ExternalTableInfo> ExternalTables 
    {
        get => field ?? ImmutableList<ExternalTableInfo>.Empty;
        init; 
    }

    [DataMember(Name = "materializedViews")]
    public ImmutableList<MaterializedViewInfo> MaterializedViews
    {
        get => field ?? ImmutableList<MaterializedViewInfo>.Empty;
        init;
    }

    [DataMember(Name = "functions")]
    public ImmutableList<FunctionInfo> Functions 
    {
        get => field ?? ImmutableList<FunctionInfo>.Empty;
        init;
    }

    [DataMember(Name = "entityGroups")]
    public ImmutableList<EntityGroupInfo> EntityGroups 
    {
        get => field ?? ImmutableList<EntityGroupInfo>.Empty;
        init;
    }

    [DataMember(Name = "graphModels")]
    public ImmutableList<GraphModelInfo> GraphModels 
    {
        get => field ?? ImmutableList<GraphModelInfo>.Empty;
        init;
    }

    [DataMember(Name = "storedQueryResults")]
    public ImmutableList<StoredQueryResultInfo> StoredQueryResults
    {
        get => field ?? ImmutableList<StoredQueryResultInfo>.Empty;
        init;
    }
}

[DataContract]
public class TableInfo
{
    [DataMember(Name = "name")]
    public required string Name { get; init; }

    [DataMember(Name = "columns")]
    public ImmutableList<ColumnInfo> Columns
    {
        get => field ?? ImmutableList<ColumnInfo>.Empty;
        init;
    }

    [DataMember(Name = "description")]
    public string? Description { get; init; }

    [DataMember(Name = "folder")]
    public string? Folder { get; init; }
}

[DataContract]
public class ExternalTableInfo
{
    [DataMember(Name = "name")]
    public required string Name { get; init; }

    [DataMember(Name = "columns")]
    public ImmutableList<ColumnInfo> Columns
    {
        get => field ?? ImmutableList<ColumnInfo>.Empty;
        init;
    }

    [DataMember(Name = "description")]
    public string? Description { get; init; }

    [DataMember(Name = "folder")]
    public string? Folder { get; init; }
}

[DataContract]
public class MaterializedViewInfo
{
    [DataMember(Name = "name")]
    public required string Name { get; init; }

    [DataMember(Name = "source")]
    public required string Source { get; init; }

    [DataMember(Name = "query")]
    public required string Query { get; init; }

    [DataMember(Name = "columns")]
    public ImmutableList<ColumnInfo> Columns
    {
        get => field ?? ImmutableList<ColumnInfo>.Empty;
        init;
    }

    [DataMember(Name = "description")]
    public string? Description { get; init; }

    [DataMember(Name = "folder")]
    public string? Folder { get; init; }
}

[DataContract]
public class ColumnInfo
{
    [DataMember(Name = "name")]
    public required string Name { get; init; }

    [DataMember(Name = "type")]
    public required string Type { get; init; }

    [DataMember(Name = "description")]
    public string? Description { get; init; }
}

[DataContract]
public class FunctionInfo
{
    [DataMember(Name = "name")]
    public required string Name { get; init; }

    [DataMember(Name = "parameters")]
    public string Parameters 
    {
        get => field ?? "()";
        init; 
    }

    [DataMember(Name = "body")]
    public string Body 
    { 
        get => field ?? ""; 
        init; 
    }

    [DataMember(Name = "description")]
    public string? Description { get; init; }

    [DataMember(Name = "folder")]
    public string? Folder { get; init; }
}

[DataContract]
public class EntityGroupInfo
{
    [DataMember(Name = "name")]
    public required string Name { get; init; }

    [DataMember(Name = "entities")]
    public ImmutableList<string> Entities 
    { 
        init;
        get => field ?? ImmutableList<string>.Empty;
    }

    [DataMember(Name = "description")]
    public string? Description { get; init; }

    [DataMember(Name = "folder")]
    public string? Folder { get; init; }
}

[DataContract]
public class GraphModelInfo
{
    [DataMember(Name = "name")]
    public required string Name { get; init; }

    [DataMember(Name = "model")]
    public required string Model { get; init; }

    [DataMember(Name = "snapshots")]
    public ImmutableList<string> Snapshots 
    { 
        get => field ?? ImmutableList<string>.Empty; 
        init; 
    }

    [DataMember(Name = "description")]
    public string? Description { get; init; }

    [DataMember(Name = "folder")]
    public string? Folder { get; init; }
}

[DataContract]
public class StoredQueryResultInfo
{
    [DataMember(Name = "name")]
    public required string Name { get; init; }

    [DataMember(Name = "columns")]
    public ImmutableList<ColumnInfo> Columns 
    {
        get => field ?? ImmutableList<ColumnInfo>.Empty;
        init;
    }

    [DataMember(Name = "description")]
    public string? Description { get; init; }

    [DataMember(Name = "folder")]
    public string? Folder { get; init; }
}