
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

var server = new Kusto.Vscode.Server(
    Console.OpenStandardInput(), 
    Console.OpenStandardOutput(),
    args
    );

await server.Run();