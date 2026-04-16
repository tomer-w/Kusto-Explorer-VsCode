// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Language.Symbols;
using System.Collections.Immutable;

namespace Kusto.Vscode;

public static class InfoToSymbolExtensions
{
    public static DatabaseSymbol ToSymbol(this DatabaseInfo info) =>
        new DatabaseSymbol(
            info.Name,
            info.AlternateName,
            info.Tables.Select(t => (Symbol)t.ToSymbol())
                .Concat(info.ExternalTables.Select(t => t.ToSymbol()))
                .Concat(info.MaterializedViews.Select(m => m.ToSymbol()))
                .Concat(info.Functions.Select(f => f.ToSymbol()))
                .Concat(info.EntityGroups.Select(e => e.ToSymbol()))
                .Concat(info.GraphModels.Select(e => e.ToSymbol()))
                .Concat(info.StoredQueryResults.Select(s => s.ToSymbol()))
            );

    public static TableSymbol ToSymbol(this TableInfo info) =>
        new TableSymbol(info.Name, info.Columns.ToSymbols(), info.Description);

    public static ExternalTableSymbol ToSymbol(this ExternalTableInfo info) =>
        new ExternalTableSymbol(info.Name, info.Columns.ToSymbols(), info.Description);

    public static MaterializedViewSymbol ToSymbol(this MaterializedViewInfo info) =>
        new MaterializedViewSymbol(info.Name, info.Columns.ToSymbols(), info.Query, info.Description);

    public static ImmutableList<ColumnSymbol> ToSymbols(this IEnumerable<ColumnInfo> infos) =>
        infos.Select(ToSymbol).ToImmutableList();

    public static ColumnSymbol ToSymbol(this ColumnInfo info) =>
        new ColumnSymbol(info.Name, ScalarTypes.GetSymbol(info.Type), info.Description);
     
    public static FunctionSymbol ToSymbol(this FunctionInfo info) =>
        new FunctionSymbol(info.Name, info.Parameters, info.Body, info.Description);

    public static EntityGroupSymbol ToSymbol(this EntityGroupInfo info)
    {
        var definition = string.Join(", ", info.Entities);
        return new EntityGroupSymbol(info.Name, definition, info.Description);
    }

    public static GraphModelSymbol ToSymbol(this GraphModelInfo info)
    {
        if (GraphModel.TryParse(info.Model, out var model))
        {
            return new GraphModelSymbol(info.Name, model.GetEdgeQueries(), model.GetNodeQueries(), info.Snapshots);
        }
        else
        {
            return new GraphModelSymbol(info.Name, snapshots: info.Snapshots);
        }
    }

    public static StoredQueryResultSymbol ToSymbol(this StoredQueryResultInfo info) =>
        new StoredQueryResultSymbol(info.Name, info.Columns.ToSymbols());
}