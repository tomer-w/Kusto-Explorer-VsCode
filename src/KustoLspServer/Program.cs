
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

var server = new Kusto.Lsp.KustoLspServer(
    Console.OpenStandardInput(), 
    Console.OpenStandardOutput(),
    args
    );

await server.Run();