namespace KustoLspTests;

[TestClass]
public class TestSymbolManager
{
    [TestMethod]
    public async Task TestLoadSamples()
    {
        var connectionManager = new Kusto.Lsp.ConnectionManager();
        var symbolManager = new Kusto.Lsp.SymbolManager(connectionManager);
        await symbolManager.EnsureSymbolsAsync("help.kusto.windows.net", "Samples", CancellationToken.None);
    }
}
