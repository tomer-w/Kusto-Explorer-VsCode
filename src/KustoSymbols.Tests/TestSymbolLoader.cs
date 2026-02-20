using System.Collections.Immutable;
using Kusto.Language;
using Kusto.Language.Symbols;
using Kusto.Symbols;

namespace Tests
{
    public class TestSymbolLoader : SymbolLoader
    {
        public override string DefaultCluster { get; }
        public override string DefaultDomain { get; }

        private readonly IReadOnlyList<ClusterSymbol> _clusters;

        public TestSymbolLoader(IReadOnlyList<ClusterSymbol> clusters, string? defaultCluster = null, string? defaultDomain = null)
        {
            this.DefaultDomain = defaultDomain ?? KustoFacts.KustoWindowsNet;
            this.DefaultCluster = defaultCluster != null
                ? SymbolFacts.GetFullHostName(defaultCluster, this.DefaultDomain)
                : clusters[0].Name;
            _clusters = clusters;
        }

        public override Task<ImmutableList<DatabaseName>> LoadDatabaseNamesAsync(string? clusterName = null, CancellationToken cancellationToken = default)
        {
            var cluster = _clusters.FirstOrDefault(c => c.Name == clusterName);
            if (cluster != null)
            {
                return Task.FromResult<ImmutableList<DatabaseName>>(
                    cluster.Databases.Select(d => new DatabaseName(d.Name, d.AlternateName)).ToImmutableList()
                    );
            }
            else
            {
                return Task.FromResult(ImmutableList<DatabaseName>.Empty);
            }
        }

        public override Task<DatabaseSymbol> LoadDatabaseAsync(string databaseName, string? clusterName = null, CancellationToken cancellationToken = default)
        {
            clusterName ??= this.DefaultCluster;

            var cluster = _clusters.FirstOrDefault(c => c.Name == clusterName);
            if (cluster != null)
            {
                var db = cluster.GetDatabase(databaseName);
                if (db != null)
                {
                    // make a new instance to behave like server/file loaders
                    db = db.WithMembers(db.Members.ToList());
                }
                return Task.FromResult(db!);
            }

            throw new InvalidOperationException($"Unknown cluster: {clusterName}");
        }
    }
}