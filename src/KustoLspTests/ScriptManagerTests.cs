namespace KustoLspTests;

[TestClass]
public sealed class ScriptManagerTests
{
    [TestMethod]
    public async Task TestAddScript()
    {
        //var connectionManager = new Kusto.Lsp.ConnectionManager();
        //var symbolManager = new Kusto.Lsp.SymbolManager(connectionManager);
        //var scriptManager = new Kusto.Lsp.ScriptManager(symbolManager, connectionManager);

        //var taskSource = new TaskCompletionSource();

        //// expect to receive ScriptChanged event
        //scriptManager.ScriptChanged += (sender, uri) =>
        //{
        //    Assert.IsTrue(scriptManager.TryGetScript(uri, out var script));
        //    Assert.IsNotNull(script);
        //    Assert.IsNotEmpty(script.Globals.Clusters);
        //    Assert.IsNotEmpty(script.Globals.Database.Tables);
        //    taskSource.SetResult();
        //};

        //scriptManager.AddScript(new Uri("inmemory://script1"), "let T = datatable(x:int)[1,2,3]; T | summarize sum(x);");

        //await taskSource.Task;
    }
}
