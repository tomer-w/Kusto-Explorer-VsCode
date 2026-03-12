// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Data.Common;

namespace Kusto.Vscode;

/// <summary>
/// Provides information about entities beyond what the <see cref="ISchemaManager"/> provides.
/// </summary>
public interface IEntityManager
{
    /// <summary>
    /// Gets the definition of the entity as KQL text
    /// </summary>
    Task<string?> GetDefinition(EntityId id, CancellationToken cancellationToken);

    /// <summary>
    /// Gets KQL text referring to the entity in a query with the document as context.
    /// </summary>
    Task<string?> GetQueryExpression(EntityId id, IDocument? document, CancellationToken cancellationToken);
}

/// <summary>
/// The identity of an item in the database, such as a table, function, or materialized view.
/// The ClusterName and DatabaseName will describe the cluster and database the entity is contained in.
/// A database can be an entity, the <see cref="EntityName"/> will be the name of the database.
/// A cluster can be an entity, the <see cref="EntityName"/> will be the name of the cluster.
/// </summary>
public record struct EntityId
{
    /// <summary>
    /// The kind of entity: table, function, etc.
    /// </summary>
    public required EntityType EntityType { get; init; }

    /// <summary>
    /// The name of the entity
    /// </summary>
    public required string EntityName { get; init; }

    /// <summary>
    /// The cluster of the entity
    /// </summary>
    public string? ClusterName { get; init; }

    /// <summary>
    /// The database the entity is defined in.
    /// </summary>
    public string? DatabaseName { get; init; }
}