// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;
using System.Runtime.Serialization;

namespace Kusto.Vscode;

public interface ISchemaSource
{
    /// <summary>
    /// Gets the cluster schema including all the database names, etc.
    /// Does not include all the database schemas.
    /// </summary>
    Task<ClusterInfo?> GetClusterInfoAsync(string clusterName, string? contextCluster, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the database schema including all entity definitions.
    /// </summary>
    Task<DatabaseInfo?> GetDatabaseInfoAsync(string clusterName, string databaseName, string? contextCluster, CancellationToken cancellationToken);

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

    /// <summary>
    /// Gets the extended information for an external table.
    /// </summary>
    Task<ExternalTableInfoEx?> GetExternalTableInfoExAsync(string clusterName, string databaseName, string name, CancellationToken cancellationToken);
}

[DataContract]
public class ClusterInfo
{
    [DataMember(Name = "databases")]
    public ImmutableList<DatabaseName> Databases { get; init; }
        = ImmutableList<DatabaseName>.Empty;

    [DataMember(Name = "plugins")]
    public ImmutableList<string> Plugins { get; init; }
        = ImmutableList<string>.Empty;
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
    public ImmutableList<TableInfo> Tables { get; init; }
        = ImmutableList<TableInfo>.Empty;

    [DataMember(Name = "externalTables")]
    public ImmutableList<ExternalTableInfo> ExternalTables { get; init; }
        = ImmutableList<ExternalTableInfo>.Empty;

    [DataMember(Name = "materializedViews")]
    public ImmutableList<MaterializedViewInfo> MaterializedViews { get; init; }
        = ImmutableList<MaterializedViewInfo>.Empty;

    [DataMember(Name = "functions")]
    public ImmutableList<FunctionInfo> Functions { get; init; }
        = ImmutableList<FunctionInfo>.Empty;

    [DataMember(Name = "entityGroups")]
    public ImmutableList<EntityGroupInfo> EntityGroups { get; init; }
         = ImmutableList<EntityGroupInfo>.Empty;

    [DataMember(Name = "graphModels")]
    public ImmutableList<GraphModelInfo> GraphModels { get; init; }
         = ImmutableList<GraphModelInfo>.Empty;

    [DataMember(Name = "storedQueryResults")]
    public ImmutableList<StoredQueryResultInfo> StoredQueryResults { get; init; }   
        = ImmutableList<StoredQueryResultInfo>.Empty;
}

[DataContract]
public class TableInfo
{
    [DataMember(Name = "name")]
    public required string Name { get; init; }

    [DataMember(Name = "columns")]
    public ImmutableList<ColumnInfo> Columns { get; init; }
        = ImmutableList<ColumnInfo>.Empty;

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
    public ImmutableList<ColumnInfo> Columns { get; init; }
        = ImmutableList<ColumnInfo>.Empty;

    [DataMember(Name = "description")]
    public string? Description { get; init; }

    [DataMember(Name = "folder")]
    public string? Folder { get; init; }
}

public class ExternalTableInfoEx
{
    /// <summary>
    /// The name of the external table
    /// </summary>
    public required string Name { get; init; }

    [DataMember(Name = "columns")]
    public ImmutableList<ColumnInfo> Columns { get; init; }
        = ImmutableList<ColumnInfo>.Empty;

    public string? Folder { get; init; }
    public string? Description { get; init; }

    /// <summary>
    /// The type of external table stored: blob, sql
    /// </summary>
    public required string Type { get; init; }

    /// <summary>
    /// Any properties assign to the external table
    /// </summary>
    public ImmutableDictionary<string, object> Properties { get; init; } 
        = ImmutableDictionary<string, object>.Empty;

    /// <summary>
    /// Any connection strings used by the external table
    /// </summary>
    public ImmutableList<string> ConnectionStrings { get; init; } 
        = ImmutableList<string>.Empty;

    /// <summary>
    /// Any partitions defined for the external table.
    /// </summary>
    public ImmutableList<ExternalTablePartition> Partitions { get; init; } 
        = ImmutableList<ExternalTablePartition>.Empty;

    /// <summary>
    /// The path format - related to partitions
    /// </summary>
    public string? PathFormat { get; init; }
}

public class ExternalTablePartition
{
    /// <summary>
    /// The name of the partition
    /// </summary>
    public required string Name { get; init; }

    // this is the type bin, startofday, startofweek, startofmonth, startofyear
    public string? Function { get; init; }

    /// <summary>
    /// The associated column that is arg0 of the function
    /// </summary>
    public string? ColumnName { get; init; }

    /// <summary>
    /// The additional value that is arg1 of the function
    /// </summary>
    public string? PartitionBy { get; init; }

    public required int Ordinal { get; init; }
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
    public ImmutableList<ColumnInfo> Columns { get; init; }
         = ImmutableList<ColumnInfo>.Empty;

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
    public string Parameters { get; init; } = "()";

    [DataMember(Name = "body")]
    public string Body { get; init; } = "";

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
    public ImmutableList<string> Entities { get; init; }
        = ImmutableList<string>.Empty;

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
    public ImmutableList<string> Snapshots { get; init; }
         = ImmutableList<string>.Empty;

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
    public ImmutableList<ColumnInfo> Columns { get; init; }
        = ImmutableList<ColumnInfo>.Empty;

    [DataMember(Name = "description")]
    public string? Description { get; init; }

    [DataMember(Name = "folder")]
    public string? Folder { get; init; }
}