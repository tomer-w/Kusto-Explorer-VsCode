using System.ComponentModel;
using System.Diagnostics.CodeAnalysis;
using System.Collections.Immutable;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using Kusto.Cloud.Platform.Data;
using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Data.Data;
using Kusto.Data.Net.Client;
using Kusto.Language;
using Kusto.Language.Symbols;

namespace Kusto.Symbols;

using static SymbolFacts;

/// <summary>
/// A <see cref="SymbolLoader"/> that retrieves schema symbols from a Kusto server.
/// </summary>
public class ServerSymbolLoader : SymbolLoader
{
    private readonly KustoConnectionStringBuilder _defaultConnection;
    private readonly string _defaultClusterName;
    private readonly string _defaultDomain;

    private ImmutableDictionary<string, ICslAdminProvider> _dataSourceToAdminProviderMap =
        ImmutableDictionary<string, ICslAdminProvider>.Empty;
    
    private ImmutableDictionary<string, KustoConnectionStringBuilder> _clusterToBuidlerMap =
        ImmutableDictionary<string, KustoConnectionStringBuilder>.Empty;

    private ImmutableDictionary<string, ImmutableHashSet<string>> _clusterToBadDbNameMap = 
        ImmutableDictionary<string, ImmutableHashSet<string>>.Empty;

    /// <summary>
    /// Creates a new <see cref="SymbolLoader"/> instance.
    /// </summary>
    /// <param name="clusterConnection">The cluster connection.</param>
    /// <param name="defaultDomain">The domain used to convert short cluster host names into full cluster host names.
    /// This string must start with a dot.  If not specified, the default domain is ".Kusto.Windows.Net"
    /// </param>
    public ServerSymbolLoader(KustoConnectionStringBuilder clusterConnection, string? defaultDomain = null)
    {
        if (clusterConnection == null)
            throw new ArgumentNullException(nameof(clusterConnection));

        _defaultConnection = clusterConnection;
        _defaultClusterName = GetHost(clusterConnection);
        _defaultDomain = String.IsNullOrEmpty(defaultDomain)
            ? KustoFacts.KustoWindowsNet
            : defaultDomain;
    }

    public override string DefaultDomain => _defaultDomain;
    public override string DefaultCluster => _defaultClusterName;

    /// <summary>
    /// The default database specified in the connection
    /// </summary>
    public string DefaultDatabase => _defaultConnection.InitialCatalog;

    /// <summary>
    /// Dispose any open resources.
    /// </summary>
    public override void Dispose()
    {
        // Disposes any open admin providers.
        var providers = _dataSourceToAdminProviderMap.Values;
        _dataSourceToAdminProviderMap = ImmutableDictionary<string, ICslAdminProvider>.Empty;

        foreach (var provider in providers)
        {
            provider.Dispose();
        }
    }

    /// <summary>
    /// Loads a list of database names for the specified cluster.
    /// If the cluster name is not specified, the loader's default cluster name is used.
    /// Returns null if the cluster is not found.
    /// </summary>
    public override async Task<ImmutableList<DatabaseName>> LoadDatabaseNamesAsync(string? clusterName = null, CancellationToken cancellationToken = default)
    {
        clusterName = string.IsNullOrEmpty(clusterName)
            ? _defaultClusterName
            : GetFullHostName(clusterName, _defaultDomain);

        var databases = await ExecuteControlCommandAsync<DatabaseNamesResult>(
            clusterName, database: "", 
            ".show databases | project DatabaseName, PrettyName",
            cancellationToken)
            .ConfigureAwait(false);

        return databases?.Select(d => new DatabaseName(d.DatabaseName, d.PrettyName)).ToImmutableList()
            ?? ImmutableList<DatabaseName>.Empty;
    }

    private bool IsBadDatabaseName(string clusterName, string databaseName)
    {
        return _clusterToBadDbNameMap.TryGetValue(clusterName, out var badDbNames)
            && badDbNames.Contains(databaseName);
    }

    private void AddBadDatabaseName(string clusterName, string databaseName)
    {
        if (!_clusterToBadDbNameMap.TryGetValue(clusterName, out var badDbNames))
        {
            badDbNames = ImmutableInterlocked.AddOrUpdate(
                ref _clusterToBadDbNameMap, 
                clusterName,
                _cluster => [databaseName],
                (_cluster, hset) => hset.Add(databaseName)
                );
        }

        badDbNames.Add(databaseName);
    }

    /// <summary>
    /// Loads the corresponding database's schema and returns a new <see cref="DatabaseSymbol"/> initialized from it.
    /// If the cluster name is not specified, the loader's default cluster name is used.
    /// Returns null if the database is not found.
    /// </summary>
    public override async Task<DatabaseSymbol> LoadDatabaseAsync(string databaseName, string? clusterName = null, CancellationToken cancellationToken = default)
    {
        if (databaseName == null)
            throw new ArgumentNullException(nameof(databaseName));

        clusterName = string.IsNullOrEmpty(clusterName)
            ? _defaultClusterName
            : GetFullHostName(clusterName, _defaultDomain);

        // if we've already determined this database name is bad, then bail out
        if (IsBadDatabaseName(clusterName, databaseName))
            throw GetInvalidDatabaseException(databaseName);

        var dbName = await GetBothDatabaseNamesAsync(clusterName, databaseName, cancellationToken).ConfigureAwait(false);
        if (dbName == null)
        {
            AddBadDatabaseName(clusterName, databaseName);
            throw GetInvalidDatabaseException(databaseName);
        }

        var tables = await LoadTablesAsync(clusterName, dbName.Name, cancellationToken).ConfigureAwait(false);
        var externalTables = await LoadExternalTablesAsync(clusterName, dbName.Name, cancellationToken).ConfigureAwait(false);
        var materializedViews = await LoadMaterializedViewsAsync(clusterName, dbName.Name, cancellationToken).ConfigureAwait(false);
        var functions = await LoadFunctionsAsync(clusterName, dbName.Name, cancellationToken).ConfigureAwait(false);
        var entityGroups = await LoadEntityGroupsAsync(clusterName, dbName.Name, cancellationToken).ConfigureAwait(false);
        var graphModels = await LoadGraphModelAsync(clusterName, dbName.Name, cancellationToken).ConfigureAwait(false);

        var members = new List<Symbol>();
        if (tables != null)
            members.AddRange(tables);
        if (externalTables != null)
            members.AddRange(externalTables);
        if (materializedViews != null)
            members.AddRange(materializedViews);
        if (functions != null)
            members.AddRange(functions);
        if (entityGroups != null)
            members.AddRange(entityGroups);
        if (graphModels != null)
            members.AddRange(graphModels);

        var databaseSymbol = new DatabaseSymbol(dbName.Name, dbName.PrettyName, members);
        return databaseSymbol;
    }

    private static Exception GetInvalidDatabaseException(string databaseName) =>
        new InvalidOperationException($"Invalid database name: {databaseName}");

    /// <summary>
    /// Returns the database name and pretty name given either the database name or the pretty name.
    /// </summary>
    protected virtual async Task<DatabaseName> GetBothDatabaseNamesAsync(string cluster, string databaseNameOrPrettyName, CancellationToken cancellationToken)
    {
        var dbInfos = await ExecuteControlCommandAsync<DatabaseNamesResult>(
            cluster,
            databaseNameOrPrettyName,
            $".show database identity | project DatabaseName, PrettyName",
            cancellationToken)
            .ConfigureAwait(false);

        var dbInfo = dbInfos?.FirstOrDefault();
        if (dbInfo == null)
            throw GetInvalidDatabaseException(databaseNameOrPrettyName);

        return new DatabaseName(dbInfo.DatabaseName, dbInfo.PrettyName);
    }

    protected virtual async Task<ImmutableList<TableSymbol>> LoadTablesAsync(string cluster, string database, CancellationToken cancellationToken)
    {
        // get table schema from .show database xxx cslschema
        var tableSchemas = await ExecuteControlCommandAsync<LoadTablesResult>(
            cluster, database,
            $".show database {KustoFacts.GetBracketedName(database)} cslschema | project TableName, Schema, Folder, DocString",
            cancellationToken)
            .ConfigureAwait(false);

        return tableSchemas?.Select(CreateTableSymbol).ToImmutableList()
            ?? ImmutableList<TableSymbol>.Empty;
    }

    private static TableSymbol CreateTableSymbol(LoadTablesResult tableSchema)
    {
        var symbol = new TableSymbol(tableSchema.TableName, "(" + tableSchema.Schema + ")", tableSchema.DocString);
        SymbolFolderExtensions.SetFolder(symbol, tableSchema.Folder);
        return symbol;
    }

    protected virtual async Task<ImmutableList<TableSymbol>> LoadExternalTablesAsync(string cluster, string database, CancellationToken cancellationToken)
    {
        // get external tables from .show external tables and .show external table xxx cslschema
        var externalTables = await ExecuteControlCommandAsync<LoadExternalTablesResult1>(
            cluster, database, 
            ".show external tables | project TableName, Folder, DocString", 
            cancellationToken);

        if (externalTables == null)
            return ImmutableList<TableSymbol>.Empty;

        var externalTableSymbols = new List<TableSymbol>();

        foreach (var et in externalTables)
        {
            var et2 = (await ExecuteControlCommandAsync<LoadExternalTablesResult2>(
                cluster, database,
                $".show external table {KustoFacts.GetBracketedName(et.TableName)} cslschema | project TableName, Schema",
                cancellationToken)
                .ConfigureAwait(false))
                .FirstOrDefault();

            if (et2 != null)
            {
                var etSymbol = CreateExternalTableSymbol(et, et2);
                externalTableSymbols.Add(etSymbol);
            }           
        }

        return externalTableSymbols.ToImmutableList();
    }

    private static ExternalTableSymbol CreateExternalTableSymbol(LoadExternalTablesResult1 et, LoadExternalTablesResult2 et2)
    {
        var symbol = new ExternalTableSymbol(et.TableName, "(" + et2.Schema + ")", et.DocString);
        SymbolFolderExtensions.SetFolder(symbol, et.Folder);
        return symbol;
    }

    protected virtual async Task<ImmutableList<TableSymbol>> LoadMaterializedViewsAsync(string cluster, string databaseName, CancellationToken cancellationToken)
    {
        // get materialized views from .show materialized-views and .show materialized-view xxx cslschema
        var materializedViews = await ExecuteControlCommandAsync<LoadMaterializedViewsResult1>(
            cluster, databaseName,
            ".show materialized-views | project Name, Query, Folder, DocString",
            cancellationToken)
            .ConfigureAwait(false);

        if (materializedViews == null)
            return ImmutableList<TableSymbol>.Empty;

        var materializedViewSymbols = new List<TableSymbol>();

        foreach (var mv in materializedViews)
        {
            // unfortunately, there is not way to get the schema of all materialized views in one command
            // THOUGHT: should this be calculated like a function instead, and then we would not need to do N+1 calls to get the schema for each materialized view?
            var mv2 = (await ExecuteControlCommandAsync<LoadMaterializedViewsResult2>(
                cluster, databaseName, 
                $".show materialized-view {KustoFacts.GetBracketedName(mv.Name)} cslschema | project TableName, Schema", 
                cancellationToken)
                .ConfigureAwait(false))
                .FirstOrDefault();

            if (mv2 != null)
            {
                var mvSymbol = CreateMaterializedViewSymbol(mv, mv2);
                materializedViewSymbols.Add(mvSymbol);
            }
        }

        return materializedViewSymbols.ToImmutableList();
    }

    private static MaterializedViewSymbol CreateMaterializedViewSymbol(LoadMaterializedViewsResult1 mv, LoadMaterializedViewsResult2 mv2)
    {
        var symbol = new MaterializedViewSymbol(mv.Name, "(" + mv2.Schema + ")", mv.Query, mv.DocString);
        SymbolFolderExtensions.SetFolder(symbol, mv.Folder);
        return symbol;
    }

    protected virtual async Task<ImmutableList<FunctionSymbol>> LoadFunctionsAsync(string cluster, string databaseName, CancellationToken cancellationToken)
    {
        // get functions for .show functions
        var functionSchemas = await ExecuteControlCommandAsync<LoadFunctionsResult>(
            cluster, databaseName, 
            ".show functions | project Name, Parameters, Body, Folder, DocString", 
            cancellationToken)
            .ConfigureAwait(false);

        return functionSchemas?.Select(CreateFunctionSymbol).ToImmutableList()
            ?? ImmutableList<FunctionSymbol>.Empty;
    }

    private static FunctionSymbol CreateFunctionSymbol(LoadFunctionsResult fun)
    {
        var fs = new FunctionSymbol(fun.Name, fun.Parameters, fun.Body, fun.DocString);
        SymbolFolderExtensions.SetFolder(fs, fun.Folder);
        return fs;
    }

    protected virtual async Task<ImmutableList<EntityGroupSymbol>> LoadEntityGroupsAsync(string cluster, string databaseName, CancellationToken cancellationToken)
    {
        // get entity groups via .show entity_groups
        var entityGroups = await ExecuteControlCommandAsync<LoadEntityGroupsResult>(
            cluster, databaseName, 
            ".show entity_groups | project Name, Entities",
            cancellationToken)
            .ConfigureAwait(false);

        return entityGroups?.Select(eg => new EntityGroupSymbol(eg.Name, eg.Entities)).ToImmutableList()
            ?? ImmutableList<EntityGroupSymbol>.Empty;
    }

    protected virtual async Task<ImmutableList<GraphModelSymbol>> LoadGraphModelAsync(string cluster, string databaseName, CancellationToken cancellationToken)
    {
        var graphModels = await ExecuteControlCommandAsync<LoadGraphModelResult>(
            cluster, databaseName,
            ".show graph_models details | project Name, Model",
            cancellationToken)
            .ConfigureAwait(false);

        var graphModelSnapshots = await ExecuteControlCommandAsync<LoadGraphModelSnapshotsResult>(
            cluster, databaseName,
            ".show graph_snapshots * | summarize Snapshots=make_list(Name) by ModelName",
            cancellationToken)
            .ConfigureAwait(false);

        var snapshotMap = graphModelSnapshots?.ToImmutableDictionary(snaps => snaps.ModelName, snaps => snaps.Snapshots)
            ?? ImmutableDictionary<string, string>.Empty;

        return graphModels?.Select(gm => CreateGraphModel(gm.Name, gm.Model, snapshotMap[gm.Name])).ToImmutableList()
            ?? ImmutableList<GraphModelSymbol>.Empty;
    }

    private GraphModelSymbol CreateGraphModel(string name, string model, string snapshots)
    {
        var snapshotNames = JsonConvert.DeserializeObject<string[]>(snapshots);

        if (GraphModel.TryParse(model, out var graphModel))
        {
            var symbol = new GraphModelSymbol(
                name,
                edges: graphModel.GetEdgeQueries(),
                nodes: graphModel.GetNodeQueries(),
                snapshots: snapshotNames
                );
            return symbol;
        }
        else
        {
            return new GraphModelSymbol(name, snapshots: snapshotNames);
        }
    }

    /// <summary>
    /// Executes a query or command against a kusto cluster and returns a sequence of result row instances.
    /// </summary>
    protected virtual async Task<ImmutableList<T>> ExecuteControlCommandAsync<T>(string cluster, string database, string command, CancellationToken cancellationToken)
    {
        var connection = GetConnectionBuilder(cluster);
        var provider = GetOrCreateAdminProvider(connection);

        var resultReader = await provider.ExecuteControlCommandAsync(database, command).ConfigureAwait(false);

        var results = KustoDataReaderParser.ParseV1(resultReader, null);

        var primaryResults = results.GetMainResultsOrNull();
        if (primaryResults == null)
            return ImmutableList<T>.Empty;

        var tableReader = primaryResults.TableData.CreateDataReader();
        var objectReader = new ObjectReader<T>(tableReader);
        return objectReader.ToImmutableList();
    }

    /// <summary>
    /// Gets the host name from the connection builder.
    /// </summary>
    private string GetHost(KustoConnectionStringBuilder connection) =>
        connection != null && !string.IsNullOrWhiteSpace(connection.DataSource)
            ? new Uri(connection.DataSource).Host
            : "";

    /// <summary>
    /// Gets or Creates an admin provider instance.
    /// </summary>
    private ICslAdminProvider GetOrCreateAdminProvider(KustoConnectionStringBuilder connection)
    {
        if (!_dataSourceToAdminProviderMap.TryGetValue(connection.DataSource, out var provider))
        {
            provider = ImmutableInterlocked.GetOrAdd(ref _dataSourceToAdminProviderMap, connection.DataSource, KustoClientFactory.CreateCslAdminProvider(connection));
        }

        return provider;
    }

    /// <summary>
    /// Creates a <see cref="ICslAdminProvider"/> for the connection.
    /// </summary>
    protected virtual ICslAdminProvider CreateAdminProvider(KustoConnectionStringBuilder connection)
    {
        return KustoClientFactory.CreateCslAdminProvider(connection);
    }

    private KustoConnectionStringBuilder GetConnectionBuilder(string clusterUriOrName)
    {
        if (!_clusterToBuidlerMap.TryGetValue(clusterUriOrName, out var builder))
        {
            builder = ImmutableInterlocked.GetOrAdd(ref _clusterToBuidlerMap, clusterUriOrName, CreateConnectionBuilder(clusterUriOrName));
        }

        return builder;
    }

    protected virtual KustoConnectionStringBuilder CreateConnectionBuilder(string clusterUriOrName)
    {
        if (string.IsNullOrEmpty(clusterUriOrName)
            || clusterUriOrName == _defaultClusterName)
        {
            return _defaultConnection;
        }

        if (string.IsNullOrWhiteSpace(clusterUriOrName))
        {
            throw new InvalidOperationException("Invalid cluster or uri: " + clusterUriOrName);
        }

        var clusterUri = clusterUriOrName;

        if (!clusterUri.Contains("://"))
        {
            clusterUri = _defaultConnection.ConnectionScheme + "://" + clusterUri;
        }

        clusterUri = KustoFacts.GetFullHostName(clusterUri, _defaultDomain);

        // borrow most security settings from default cluster connection
        var builder = new KustoConnectionStringBuilder(_defaultConnection);
        builder.DataSource = clusterUri;
        builder.ApplicationCertificateBlob = _defaultConnection.ApplicationCertificateBlob;
        builder.ApplicationKey = _defaultConnection.ApplicationKey;
        builder.InitialCatalog = "NetDefaultDB";

        return builder;
    }

#nullable disable
    public class DatabaseNamesResult
    {
        public string DatabaseName;
        public string PrettyName;
    }

    public class LoadTablesResult
    {
        public string TableName;
        public string Schema;
        public string Folder;
        public string DocString;
    }

    public class LoadExternalTablesResult1
    {
        public string TableName;
        public string Folder;
        public string DocString;
    }

    public class LoadExternalTablesResult2
    {
        public string TableName;
        public string Schema;
    }

    public class LoadMaterializedViewsResult1
    {
        public string Name;
        public string Query;
        public string Folder;
        public string DocString;
    }

    public class LoadMaterializedViewsResult2
    {
        public string Name;
        public string Schema;
    }

    public class LoadFunctionsResult
    {
        public string Name;
        public string Parameters;
        public string Body;
        public string Folder;
        public string DocString;
    }

    public class LoadEntityGroupsResult
    {
        public string Name;
        public string Entities;
        public string Folder;
        public string DocString;
    }

    public class LoadGraphModelResult
    {
        public string Name;
        public string Model;
        public string Folder;
        public string DocString;
    }

    public class LoadGraphModelSnapshotsResult
    {
        public string ModelName;
        public string Snapshots;
    }

    public class GraphModel
    {
        public string Schema;
        public GraphModelDefinition Definition;

        public static bool TryParse(string text, out GraphModel model)
        {
            model = JsonConvert.DeserializeObject<GraphModel>(text);
            return model != null;
        }

        public override string ToString()
        {
            return JsonConvert.SerializeObject(this);
        }

        public IReadOnlyList<string> GetEdgeQueries() =>
            _edgeQueries ??= Definition?.Steps?.OfType<GraphModelEdgeStep>()?.Select(step => step.Query).ToArray() ?? Array.Empty<string>();
        private IReadOnlyList<string> _edgeQueries;

        public IReadOnlyList<string> GetNodeQueries() =>
            _nodeQueries ??= Definition?.Steps?.OfType<GraphModelNodeStep>()?.Select(step => step.Query).ToArray() ?? Array.Empty<string>();
        private IReadOnlyList<string> _nodeQueries;
    }

    public class GraphModelDefinition
    {
        public GraphModelStep[] Steps;
    }

    [JsonConverter(typeof(GraphModelStepConverter))]
    public abstract class GraphModelStep
    {
        public string Query;
        public string[] Labels;
        public string LabelsIdColumn;
    }

    public sealed class GraphModelNodeStep : GraphModelStep
    {
        public string NodeColumn;
    }

    public sealed class GraphModelEdgeStep : GraphModelStep
    {
        public string SourceColumn;
        public string TargetColumn;
    }
#nullable restore

    public class GraphModelStepConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType) =>
            objectType == typeof(GraphModelStep);

        public override object? ReadJson(JsonReader reader, Type objectType, object? existingValue, JsonSerializer serializer)
        {
            var obj = JObject.Load(reader);
            var kind = (string?)obj["Kind"];

            GraphModelStep step = kind switch
            {
                "AddNodes" => new GraphModelNodeStep(),
                "AddEdges" => new GraphModelEdgeStep(),
                _ => throw new InvalidOperationException($"Unknown graph model step kind: {kind}")            
            };

            serializer.Populate(obj.CreateReader(), step);

            return step;
        }

        public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
        {
            if (value is GraphModelStep step)
            {
                var obj = JObject.FromObject(value);
                var kind = step switch
                {
                    GraphModelNodeStep => "AddNodes",
                    GraphModelEdgeStep => "AddEdges",
                    _ => throw new InvalidOperationException($"Unknown graph model step type: '{step.GetType().Name}'")
                };
                obj.AddFirst(new JProperty("Kind", kind));
                obj.WriteTo(writer);
            }
            else
            {
                throw new NotSupportedException($"The value is not type GraphModelStep");
            }
        }
    }
}
