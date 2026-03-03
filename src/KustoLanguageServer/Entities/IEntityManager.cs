// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Diagnostics.CodeAnalysis;
using Kusto.Data.Common;

namespace Kusto.Lsp;

public interface IEntityManager
{
    /// <summary>
    /// Gets the definition of the entity as text to display 
    /// </summary>
    Task<string?> GetDefinition(EntityId id, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the text of a KQL expression that references the entity in a query.
    /// </summary>
    Task<string?> GetQueryExpression(EntityId id, IDocument? document, CancellationToken cancellationToken);
}

public record struct EntityId
{
    /// <summary>
    /// The kind of entity: table, function, 
    /// </summary>
    public required EntityType EntityType { get; init; }

    /// <summary>
    /// The name of the entity
    /// </summary>
    public required string EntityName { get; init; }

    /// <summary>
    /// The cluster of the entity
    /// </summary>
    public string? Cluster { get; init; }

    /// <summary>
    /// The database the entity is defined in.
    /// </summary>
    public string? Database { get; init; }
}