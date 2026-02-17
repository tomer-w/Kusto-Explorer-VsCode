using System.Diagnostics.CodeAnalysis;
using Kusto.Data.Common;

namespace Kusto.Lsp;

public interface IEntityManager
{
    /// <summary>
    /// Gets a create command that re-creates the existing entity.
    /// </summary>
    Task<string?> GetCreateCommand(EntityId id, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the text of a KQL expression that references the entity in a query.
    /// </summary>
    Task<string?> GetQueryReference(EntityId id, CancellationToken cancellationToken);
}

public record EntityId : IParsable<EntityId>
{
    /// <summary>
    /// The cluster of the entity
    /// </summary>
    public required string Cluster { get; init; }

    /// <summary>
    /// The database the entity is defined in.
    /// </summary>
    public required string Database { get; init; }

    /// <summary>
    /// The kind of entity: table, function, 
    /// </summary>
    public required EntityType EntityType { get; init; }

    /// <summary>
    /// The name of the entity
    /// </summary>
    public required string EntityName { get; init; }

    public override string ToString()
    {
        return $"{Cluster}|{Database}|{EntityType}|{EntityName}";
    }

    public static bool TryParse([NotNullWhen(true)] string? text, IFormatProvider? provider, [NotNullWhen(true)] out EntityId id)
    {
        if (text != null)
        {
            var parts = text.Split("|");
            if (parts.Length == 4
                && ExtendedEntityType.FastTryParse(parts[2], out var entityType))
            {
                id = new EntityId
                {
                    Cluster = parts[0],
                    Database = parts[1],
                    EntityType = entityType,
                    EntityName = parts[3]
                };
                return true;
            }
        }
        id = null!;
        return false;
    }

    public static bool TryParse(string? text, [NotNullWhen(true)] out EntityId? id) =>
        TryParse(text, null, out id);

    public static EntityId Parse(string? text, IFormatProvider? provider = null) =>
        TryParse(text, provider, out var id) ? id : throw new InvalidOperationException($"Invalid symbol id");
}