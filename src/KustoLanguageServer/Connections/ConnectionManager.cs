using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Data.Net.Client;
using Kusto.Toolkit;
using System.Collections.Immutable;

namespace Kusto.Lsp;

/// <summary>
/// Keeps track of connections to servers and databases, to allow reuse of <see cref="KustoConnectionStringBuilder"/> instances.
/// The consumer of the builder must not modify it.
/// </summary>
public class ConnectionManager : IConnectionManager
{
    private ImmutableDictionary<string, ConnectionInfo> _clusterToBuilderInfoMap =
        ImmutableDictionary<string, ConnectionInfo>.Empty;

    private class ConnectionInfo
    {
        public required KustoConnection Connection { get; set; }

        public ImmutableDictionary<string, KustoConnection> DatabaseConnections =
            ImmutableDictionary<string, KustoConnection>.Empty;
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

    public IConnection GetConnection(string clusterOrConnection, string? database = null)
    {
        KustoConnection connection;

        if (!_clusterToBuilderInfoMap.TryGetValue(clusterOrConnection, out var info))
        {
            var builder = new KustoConnectionStringBuilder(clusterOrConnection);

            // if is not explicitly a connection string, add federated security
            if (!clusterOrConnection.Contains(";"))
            {
                builder.FederatedSecurity = true;
            }

            connection = new KustoConnection(builder);

            info = new ConnectionInfo { Connection = connection  };

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
                databaseConnection = connection.WithInitialCatalog(database);
                ImmutableInterlocked.Update(ref info.DatabaseConnections, _map => _map.SetItem(database, databaseConnection));
            }
            connection = databaseConnection;
        }

        return connection;
    }

    private class KustoConnection : IConnection
    {
        private readonly KustoConnectionStringBuilder _builder;

        public KustoConnection(KustoConnectionStringBuilder builder)
        {
            _builder = builder;
        }

        public string Hostname => _builder.Hostname;
        public string? InitialCatalog => _builder.InitialCatalog;

        public KustoConnection WithInitialCatalog(string? initialCatalog)
        {
            var newBuilder = new KustoConnectionStringBuilder(_builder) { InitialCatalog = initialCatalog };
            return new KustoConnection(newBuilder);
        }

        private ICslQueryProvider? _queryProvider;
        public ICslQueryProvider QueryProvider
        {
            get
            {
                if (_queryProvider == null)
                {
                    Interlocked.CompareExchange(ref _queryProvider, KustoClientFactory.CreateCslQueryProvider(_builder), null);
                }
                return _queryProvider;
            }
        }

        private ICslAdminProvider? _adminProvider;
        public ICslAdminProvider AdminProvider
        {
            get 
            { 
                if (_adminProvider == null)
                {
                    Interlocked.CompareExchange(ref _adminProvider, KustoClientFactory.CreateCslAdminProvider(_builder), null);
                }
                return _adminProvider;
            }
        }

        private SymbolLoader? _symbolLoader;
        public SymbolLoader SymbolLoader
        {
            get
            {
                if (_symbolLoader == null)
                {
                    Interlocked.CompareExchange(ref _symbolLoader, new ServerSymbolLoader(_builder), null);
                }
                return _symbolLoader;
            }
        }
    }
}
