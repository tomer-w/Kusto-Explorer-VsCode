using Kusto.Data;
using Kusto.Toolkit;
using System.Collections.Immutable;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text.Json.Serialization;
using LSP = Microsoft.VisualStudio.LanguageServer.Protocol;

namespace Kusto.Lsp;

public class ConnectionManager : IConnectionManager
{
    private ImmutableDictionary<string, BuilderInfo> _clusterToBuilderInfoMap =
        ImmutableDictionary<string, BuilderInfo>.Empty;

    private class BuilderInfo
    {
        public required KustoConnectionStringBuilder Connection { get; set; }

        public ImmutableDictionary<string, KustoConnectionStringBuilder> DatabaseConnections =
            ImmutableDictionary<string, KustoConnectionStringBuilder>.Empty;
    }

    public string GetClusterName(string clusterOrConnection)
    {
        try
        {
            var kcsb = GetConnection(clusterOrConnection);
            return kcsb.Hostname;
        }
        catch
        {
            return clusterOrConnection;
        }
    }


    public KustoConnectionStringBuilder GetConnection(string clusterOrConnection, string? database = null)
    {
        KustoConnectionStringBuilder connection;

        if (!_clusterToBuilderInfoMap.TryGetValue(clusterOrConnection, out var info))
        {
            connection = new KustoConnectionStringBuilder(clusterOrConnection);

            // if is not explicitly a connection string, add federated security
            if (!clusterOrConnection.Contains(";"))
            {
                connection.FederatedSecurity = true;
            }

            info = new BuilderInfo { Connection = connection };

            _clusterToBuilderInfoMap = _clusterToBuilderInfoMap.Add(clusterOrConnection, info);

            if (connection.Hostname != clusterOrConnection)
                _clusterToBuilderInfoMap = _clusterToBuilderInfoMap.Add(connection.Hostname, info);
        }
        else
        {
            connection = info.Connection;
        }

        if (database != null)
        {
            if (!info.DatabaseConnections.TryGetValue(database, out var databaseConnection))
            {
                databaseConnection = new KustoConnectionStringBuilder(connection) { InitialCatalog = database };
                ImmutableInterlocked.Update(ref info.DatabaseConnections, _map => _map.SetItem(database, databaseConnection));
            }
            connection = databaseConnection;
        }

        return connection;
    }

#if false
    public record ServerConfiguration
    {
        [JsonProperty("servers")]
        public required ImmutableList<ServerOrFolder> Servers { get; init; }
    }

    [JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
    [JsonDerivedType(typeof(Server), "server")]
    [JsonDerivedType(typeof(Folder), "folder")]
    public abstract record ServerOrFolder
    {
    }

    public record Server : ServerOrFolder
    {
        [JsonProperty("name")]
        public required string Name { get; init; }

        [JsonProperty("connection")]
        public required string Connection { get; init; }
    }

    public record Folder : ServerOrFolder
    {
        [JsonProperty("servers")]
        public required ImmutableList<Server> Servers { get; init; }
    }
#endif
}
