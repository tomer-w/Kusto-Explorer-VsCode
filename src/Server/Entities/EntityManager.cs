// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Data.Common;
using Kusto.Language;

namespace Kusto.Vscode;

public class EntityManager : IEntityManager
{
    private readonly ISchemaManager _schemaManager;
    private readonly IOptionsManager _optionsManager;

    public EntityManager(
        ISchemaManager schemaSource, 
        IOptionsManager optionsManager)
    {
        _schemaManager = schemaSource;
        _optionsManager = optionsManager;
    }

    public async Task<string?> GetDefinition(EntityId id, CancellationToken cancellationToken)
    {
        if (id.ClusterName != null
            && id.DatabaseName != null)
        {
            var builder = new KqlBuilder(_optionsManager.FormattingOptions);

            switch (id.EntityType)
            {
                case EntityType.Table:
                    var tableInfo = (await _schemaManager.GetTableInfosAsync(id.ClusterName, id.DatabaseName, id.EntityName, cancellationToken).ConfigureAwait(false)).FirstOrDefault();
                    if (tableInfo != null)
                    {
                        builder.WriteCreateTableCommand(tableInfo);
                        return builder.Text;
                    }
                    break;
                case EntityType.MaterializedView:
                    var mvInfo = (await _schemaManager.GetMaterializedViewInfosAsync(id.ClusterName, id.DatabaseName, id.EntityName, cancellationToken).ConfigureAwait(false)).FirstOrDefault();
                    if (mvInfo != null)
                    {
                        builder.WriteCreateMaterializedViewCommand(mvInfo);
                        return builder.Text;
                    }
                    break;
                case EntityType.Function:
                    var funInfo = (await _schemaManager.GetFunctionInfosAsync(id.ClusterName, id.DatabaseName, id.EntityName, cancellationToken).ConfigureAwait(false)).FirstOrDefault();
                    if (funInfo != null)
                    {
                        builder.WriteCreateFunctionCommand(funInfo);
                        return builder.Text;
                    }
                    break;
                case EntityType.EntityGroup:
                    var egInfo = (await _schemaManager.GetEntityGroupInfosAsync(id.ClusterName, id.DatabaseName, id.EntityName, cancellationToken).ConfigureAwait(false)).FirstOrDefault();
                    if (egInfo != null)
                    {
                        builder.WriteCreateEntityGroupCommand(egInfo);
                        return builder.Text;
                    }
                    break;
                case EntityType.Graph:
                    var gmInfo = (await _schemaManager.GetGraphModelInfosAsync(id.ClusterName, id.DatabaseName, id.EntityName, cancellationToken).ConfigureAwait(false)).FirstOrDefault();
                    if (gmInfo != null)
                    {
                        builder.WriteCreateGraphModelCommand(gmInfo);
                        return builder.Text;
                    }
                    break;
                case EntityType.ExternalTable:
                    await BuildExternalTableDefinitionAsync(builder, id.ClusterName, id.DatabaseName, id.EntityName, cancellationToken).ConfigureAwait(false);
                    return builder.Text;
                default:
                    break;
            }
        }

        return null;
    }

    private async Task BuildExternalTableDefinitionAsync(KqlBuilder builder, string clusterName, string databaseName, string name, CancellationToken cancellationToken)
    {
        var etInfoEx = await _schemaManager.GetExternalTableInfoExAsync(clusterName, databaseName, name, cancellationToken).ConfigureAwait(false);
        if (etInfoEx != null)
        {
            builder.WriteCreateExternalTableCommand(etInfoEx);
        }
    }

    public Task<string?> GetQueryExpression(EntityId id, IDocument? document, CancellationToken cancellationToken)
    {
        var result = id.EntityType switch
        {
            EntityType.Cluster => GetClusterExpression(id.EntityName),
            EntityType.Database => GetDatabaseExpression(id.EntityName),
            EntityType.Table => $"{GetDatabasePrefix()}{KustoFacts.BracketNameIfNecessary(id.EntityName)}",
            EntityType.ExternalTable => $"{GetDatabasePrefix()}external_table({KustoFacts.GetSingleQuotedStringLiteral(id.EntityName)})",
            EntityType.MaterializedView => $"{GetDatabasePrefix()}materialized_view({KustoFacts.GetSingleQuotedStringLiteral(id.EntityName)})",
            EntityType.Function => $"{GetDatabasePrefix()}{KustoFacts.BracketNameIfNecessary(id.EntityName)}()",
            EntityType.EntityGroup => $"{GetDatabasePrefix()}entity_group({KustoFacts.GetSingleQuotedStringLiteral(id.EntityName)})",
            EntityType.Graph => $"{GetDatabasePrefix()}graph({KustoFacts.GetSingleQuotedStringLiteral(id.EntityName)})",
            EntityType.StoredQueryResult => $"{GetDatabasePrefix()}stored_query_result({KustoFacts.GetSingleQuotedStringLiteral(id.EntityName)})",
            _ => null
        };

        return Task.FromResult(result);

        string GetClusterExpression(string name)
        {
            return $"cluster({KustoFacts.GetSingleQuotedStringLiteral(name)})";
        }

        string GetClusterPrefix()
        {
            if (id.ClusterName != null
                && document != null 
                && document.Globals.Cluster.Name != id.ClusterName)
            {
                return $"{GetClusterExpression(id.ClusterName)}.";
            }
            return "";
        }

        string GetDatabaseExpression(string name)
        {
            return $"{GetClusterPrefix()}database({KustoFacts.GetSingleQuotedStringLiteral(name)})";
        }

        string GetDatabasePrefix()
        {
            if (id.ClusterName != null
                && id.DatabaseName != null 
                && document != null 
                && (document.Globals.Cluster.Name != id.ClusterName || document.Globals.Database.Name != id.DatabaseName))
            {
                return $"{GetDatabaseExpression(id.DatabaseName)}.";
            }
            return "";
        }
    }
}