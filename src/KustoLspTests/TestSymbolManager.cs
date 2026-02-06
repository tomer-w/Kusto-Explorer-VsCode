using System;
using System.Collections.Generic;
using System.Text;

namespace KustoLspTests;

[TestClass]
public class TestSymbolManager
{
    [TestMethod]
    public async Task TestLoadSamples()
    {
        var connectionManager = new Kusto.Lsp.ConnectionManager();
        var symbolManager = new Kusto.Lsp.SymbolManager(connectionManager);
        await symbolManager.LoadSymbolsAsync("help.kusto.windows.net", "Samples", CancellationToken.None);
    }
}
