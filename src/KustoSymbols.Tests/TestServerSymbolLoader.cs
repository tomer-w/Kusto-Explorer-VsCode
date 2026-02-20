using System.Collections.Immutable;
using Kusto.Data;
using Kusto.Language.Symbols;
using Kusto.Symbols;

namespace Tests
{
    public class TestServerSymbolLoader : ServerSymbolLoader
    {
        private readonly object[] _results;

        public TestServerSymbolLoader(params object[] results)
            : base(new KustoConnectionStringBuilder())
        {
            _results = results;
        }

        public override Task<DatabaseSymbol> LoadDatabaseAsync(string databaseName, string? clusterName = null, CancellationToken cancellationToken = default)
        {
            var result = _results.OfType<DatabaseSymbol>().FirstOrDefault();
            if (result != null)
                return Task.FromResult(result);
            return base.LoadDatabaseAsync(databaseName, clusterName, cancellationToken);
        }

        public override Task<ImmutableList<DatabaseName>> LoadDatabaseNamesAsync(string? clusterName = null, CancellationToken cancellationToken = default)
        {
            var result = _results.OfType<IEnumerable<DatabaseName>>().FirstOrDefault()?.ToImmutableList();
            if (result != null)
                return Task.FromResult(result);
            return base.LoadDatabaseNamesAsync(clusterName, cancellationToken);
        }

        protected override Task<DatabaseName> GetBothDatabaseNamesAsync(string cluster, string databaseNameOrPrettyName, CancellationToken cancellationToken)
        {
            var result = _results.OfType<DatabaseName>().FirstOrDefault();
            if (result != null)
                return Task.FromResult(result);
            return base.GetBothDatabaseNamesAsync(cluster, databaseNameOrPrettyName, cancellationToken);
        }

        protected override Task<ImmutableList<T>> ExecuteControlCommandAsync<T>(string cluster, string database, string command, CancellationToken cancellationToken)
        {
            foreach (var result in _results)
            {
                if (result is IEnumerable<T> typedResult)
                    return Task.FromResult(typedResult.ToImmutableList());
            }

            return Task.FromResult(ImmutableList<T>.Empty);
        }
    }
}
