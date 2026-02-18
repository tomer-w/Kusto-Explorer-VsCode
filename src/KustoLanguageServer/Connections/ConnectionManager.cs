using Kusto.Cloud.Platform.Data;
using Kusto.Cloud.Platform.Utils;
using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Data.Common.Impl;
using Kusto.Data.Data;
using Kusto.Data.Net.Client;
using Kusto.Data.Utils;
using Kusto.Language.Editor;
using Kusto.Toolkit;
using System.Collections.Immutable;
using System.Data;

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
            return kcsb.Cluster;
        }
        catch
        {
            return clusterOrConnection;
        }
    }

    public async Task<string> GetServerKindAsync(string clusterOrConnection, CancellationToken cancellationToken)
    {
        var connection = this.GetConnection(clusterOrConnection);
        var results = await connection.ExecuteAsync<ShowVersionResult>(".show version").ConfigureAwait(false);
        var version = results.Values?.FirstOrDefault();
        return version != null ? version.ServiceType : "Unknown";
    }

    public class ShowVersionResult
    {
        public string BuildVersion = default!;
        public DateTime BuildTime;
        public string ServiceType = default!;
        public string ProductVersion = default!;
        public string ServiceSubType = default!;
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

            if (connection.Cluster != clusterOrConnection)
                _clusterToBuilderInfoMap = _clusterToBuilderInfoMap.Add(connection.Cluster, info);
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

    private class KustoConnection : IKustoConnection
    {
        private readonly KustoConnectionStringBuilder _builder;

        public KustoConnection(KustoConnectionStringBuilder builder)
        {
            _builder = builder;
        }

        public string Cluster => _builder.Hostname;
        public string? Database => _builder.InitialCatalog;

        public KustoConnection WithInitialCatalog(string? initialCatalog)
        {
            var newBuilder = new KustoConnectionStringBuilder(_builder) { InitialCatalog = initialCatalog };
            return new KustoConnection(newBuilder);
        }

        public KustoConnectionStringBuilder GetBuilder()
        {
            return new KustoConnectionStringBuilder(_builder);
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

        public async Task<ExecuteResult> ExecuteAsync(
            EditString query,
            ImmutableDictionary<string, string>? options,
            ImmutableDictionary<string, string>? parameters,
            CancellationToken cancellationToken
            )
        {
            try
            {
                var properties = CreateClientRequestProperties(options ?? ImmutableDictionary<string, string>.Empty, parameters ?? ImmutableDictionary<string, string>.Empty);
                var resultReader = (Kusto.Language.KustoCode.GetKind(query) == CodeKinds.Command)
                    ? await this.AdminProvider.ExecuteControlCommandAsync(this.Database, query, properties).ConfigureAwait(false)
                    : await this.QueryProvider.ExecuteQueryAsync(this.Database, query, properties, cancellationToken).ConfigureAwait(false);
                var dataSet = KustoDataReaderParser.ParseV1(resultReader, null);
                var mainResult = dataSet?.GetMainResultsOrNull();
                var tables = dataSet != null
                    ? dataSet.Tables.Where(t => t.TableKind == WellKnownDataSet.PrimaryResult).Select(t => (DataTable)t.TableData).ToImmutableList()
                    : null;
                return new ExecuteResult
                {
                    Tables = tables,
                    ChartOptions = mainResult?.VisualizationOptions
                };
            }
            catch (Exception ex)
            {
                return new ExecuteResult
                {
                    Diagnostics = [ErrorDecoder.GetDiagnostic(ex, query)]
                };
            }
        }

        public async Task<ExecuteResult<T>> ExecuteAsync<T>(
            EditString query,
            ImmutableDictionary<string, string>? options,
            ImmutableDictionary<string, string>? parameters,
            CancellationToken cancellationToken
            )
        {
            try
            {
                var results = await ExecuteAsync(query, options, parameters, cancellationToken).ConfigureAwait(false);
                if (results.Tables != null
                    && results.Tables.Count > 0)
                {
                    var reader = new ObjectReader<T>(results.Tables[0].CreateDataReader());
                    return new ExecuteResult<T> { Values = reader.ToImmutableList() };
                }
                else
                {
                    return new ExecuteResult<T> { Values = ImmutableList<T>.Empty };
                }

            }
            catch (Exception e)
            {
                return new ExecuteResult<T>
                {
                    Diagnostics = [ErrorDecoder.GetDiagnostic(e, query)]
                };
            }
        }

        private ClientRequestProperties CreateClientRequestProperties(
            ImmutableDictionary<string, string> options,
            ImmutableDictionary<string, string> parameters)
        {
            var crp = new ClientRequestProperties();

            foreach (var kvp in options)
            {
                SetQueryOption(crp, kvp.Key, kvp.Value);
            }

            crp.SetParameters(parameters);

            return crp;
        }

        private void SetQueryOption(ClientRequestProperties crp, string name, string value)
        {
            if (value != null && value == "##null")
            {
                crp.ClearOption(name);
                return;
            }

            switch (name)
            {
                // Booleans
                case ClientRequestProperties_Debugging.OptionNoExecute:
                case ClientRequestProperties_Debugging.OptionPerfTrace:
                case ClientRequestProperties.OptionValidatePermissions:
                case ClientRequestProperties.OptionQueryResultsApplyGetSchema:
                case ClientRequestProperties.OptionNoTruncation:
                case ClientRequestProperties.OptionDeferPartialQueryFailures:
                case ClientRequestProperties.OptionNoRequestTimeout:
                case ClientRequestProperties.OptionAllowProjectionAndExtensionUnderSearch:
                case ClientRequestProperties.OptionRequestCalloutDisabled:
                case ClientRequestProperties_FaultInjection.OptionDebugQueryExecutionEnableExpiry:
                case ClientRequestProperties_FaultInjection.OptionDebugQueryExecutionEnableOom:
                case ClientRequestProperties.OptionDoNotImpersonate:
                    crp.SetOption(name, Boolean.Parse(value!));
                    break;

                // Long
                case ClientRequestProperties.OptionTruncationMaxSize:
                case ClientRequestProperties.OptionTruncationMaxRecords:
                case ClientRequestProperties.OptionTakeMaxRecords:
                case ClientRequestProperties.OptionMaxMemoryConsumptionPerIterator:
                case ClientRequestProperties.OptionMaxMemoryConsumptionPerQueryPerNode:
                case ClientRequestProperties_FaultInjection.OptionDebugQueryPlanBurnCpuMsec:
                case ClientRequestProperties.OptionMaxOutputColumns:
                case ClientRequestProperties.OptionMaxEntitiesToUnion:
                case ClientRequestProperties.OptionSqlMaxStringSize:
                    crp.SetOption(name, CslLongLiteral.Parse(value!));
                    break;

                // TimeSpan
                case ClientRequestProperties.OptionServerTimeout:
                    if (CslTimeSpanLiteral.TryParse(value, out var timeSpan))
                    {
                        crp.SetOption(name, timeSpan);
                    }
                    else
                    {
                        value = value.TrimBalancedSingleAndDoubleQuotes();
                        crp.SetOption(name, ExtendedTimeSpan.Parse(value));
                    }
                    return;

                // DateTime
                case ClientRequestProperties.OptionQueryDateTimeScopeFrom:
                case ClientRequestProperties.OptionQueryDateTimeScopeTo:
                case ClientRequestProperties.OptionQueryNow:
                    if (CslDateTimeLiteral.TryParse(value, out var dateTime))
                    {
                        crp.SetOption(name, dateTime);
                    }
                    else
                    {
                        value = value.TrimBalancedSingleAndDoubleQuotes();
                        crp.SetOption(name, ExtendedDateTime.ParseInexactUtc(value));
                    }
                    break;

                // All others are strings
                default:
                    crp.SetOption(name, value);
                    break;
            }
        }
    }
}
