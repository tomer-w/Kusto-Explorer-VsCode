# Kusto Explorer for VS Code

- Edit, run and chart Kusto queries (KQL)
- Explore databases and query results
- Consult copilot to help create, run and diagnose your queries
- Works just like the Kusto Explorer desktop app and Azure Data Explorer
- Runs on Windows, Mac and Linux

## Downloading and Using the Extension

- Install from within VS Code: [Kusto Explorer]
- Or download VSIX from [GitHub Releases](https://github.com/microsoft/Kusto-Explorer-VsCode/releases)
- [How to Use the Extension](src/Client/README.md)

----

## Using this Repository

- KustoExplorerVscode.slnx - Visual Studio solution file for the entire extension
- src/Client - TypeScript vscode extension
- src/Server - C# LSP Server
- src/ServerTests - C# Tests for the server codebase

### Client
The Client is written in TypeScript and contains the VS Code extension code, including the UI components, LSP client and other extension features.
that are not dependent on the Kusto parser library.

### Server
The Server is written in C# to interact with the dotnet version of the Kusto parser library for better typing performance.
It primarily contains just LSP handlers and redirects requests to the parser library's code services.
Some other custom features are also implemented here, but eventually most of these will move out to be handled by the client with the goal of leaving only code service related features in the server codebase.

### Debugging the Client
1. Open `src\Client` folder in VS Code
2. Build the client side using `compile` command in explorer panel `NPM SCRIPTS`
3. Build the server side using `build-debug-server` in explorer panel `NPM SCRIPTS`
4. Press F5 to launch the extension in a new VS Code window with debugging enabled

### Debugging the Server
1. Run the extension in debug mode as described above, which will also launch the server in debug mode
2. Attach to the server process using one of the following:
   - **Visual Studio**: Open `KustoExplorerVscode.slnx` and attach to the dotnet.exe process associated with the extension
   - **VS Code**: Open the repository root folder, then run command `Debug: Attach to a .NET 5+ or .NET Core process` (Ctrl+Shift+P) and select the `Server` process

### Creating the VSIX installer

1. Must have vsce installed (npm install -g @vscode/vsce)
2. run `npm run package` on command line within `src/Client` folder to build the .vsix file

### Installing the VSIX manually

Run `code --install-extension <vsix file> [--force]` on command line.

### Uninstalling the extension manually

Run `code --uninstall-extension Microsoft.kusto-explorer-vscode` on command line.

----

## Contributing

This project welcomes contributions and suggestions. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Security

If you believe you have found a security vulnerability in this repository, please report it to us through coordinated disclosure.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them to the Microsoft Security Response Center (MSRC) at [https://msrc.microsoft.com/create-report](https://msrc.microsoft.com/create-report).

For more information, see [SECURITY.md](SECURITY.md) or visit [Microsoft's Security Policy](https://github.com/microsoft/Kusto-Explorer-VsCode/security/policy).

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

