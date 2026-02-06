
var server = new Kusto.Lsp.KustoLspServer(
    Console.OpenStandardInput(), 
    Console.OpenStandardOutput(),
    args
    );

await server.Run();