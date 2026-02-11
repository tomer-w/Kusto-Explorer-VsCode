using Kusto.Language;

namespace Kusto.Lsp;

public class SymbolLoader : ISymbolLoader
{
    private Kusto.Toolkit.SymbolLoader _loader;
    private Kusto.Toolkit.SymbolResolver _resolver;

    public SymbolLoader(IKustoConnection connection)
    {
        var builder = connection.GetBuilder();
        _loader = new Kusto.Toolkit.ServerSymbolLoader(builder);
        _resolver = new Kusto.Toolkit.SymbolResolver(_loader);
    }

    public static ISymbolLoaderFactory Factory { get; } = new FactoryImpl();

    private class FactoryImpl : ISymbolLoaderFactory
    {
        public ISymbolLoader CreateLoader(IConnection connection)
        {
            return new SymbolLoader((IKustoConnection)connection);
        }
    }

    public Task<GlobalState> AddClusterAsync(GlobalState globals, string clusterName, CancellationToken cancellationToken)
    {
        return _loader.AddClusterAsync(globals, clusterName, cancellationToken);
    }

    public async Task<GlobalState> AddDatabaseAsync(GlobalState globals, string clusterName, string databaseName, CancellationToken cancellationToken)
    {
        var clusterSymbol = globals.GetCluster(clusterName);
        if (clusterSymbol != null)
        {
            var databaseSymbol = clusterSymbol.GetDatabase(databaseName);
            if (databaseSymbol == null || databaseSymbol.IsOpen)
            {
                // NOTE: not useing _loader.AddDatabaseAsync due to behavior bug..  will revert when fixed
                databaseSymbol = await _loader.LoadDatabaseAsync(databaseName, clusterName, cancellationToken: cancellationToken).ConfigureAwait(false);
                if (clusterSymbol != null && databaseSymbol != null)
                {
                    clusterSymbol = clusterSymbol.AddOrUpdateDatabase(databaseSymbol);
                    globals = globals.AddOrReplaceCluster(clusterSymbol);
                }
            }
        }

        return globals;
    }

    public async Task<GlobalState> AddReferencedSymbols(GlobalState globals, Document document, CancellationToken cancellationToken)
    {
        switch (document)
        {
            case MultiQueryDocument mqDoc:
                var newScript = await _resolver.AddReferencedDatabasesAsync(mqDoc.Script, cancellationToken).ConfigureAwait(false);
                return newScript.Globals;
            case SingleQueryDocument sqDoc:
                var newCode = await _resolver.AddReferencedDatabasesAsync(sqDoc.GetCode(), cancellationToken).ConfigureAwait(false);
                return newCode.Globals;
        }
        return globals;
    }
}
