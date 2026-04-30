# Contributing to Kusto Explorer (VS Code Extension)

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b my-feature`)
3. Make your changes
4. Run tests and ensure the build passes
5. Submit a pull request

## Repository Structure

| Path | Description |
|------|-------------|
| `KustoExplorerVscode.slnx` | Visual Studio solution for the entire extension |
| `src/Client` | TypeScript VS Code extension (UI, LSP client, extension features) |
| `src/Server` | C# LSP server (Kusto parser integration, code services) |
| `src/ServerTests` | C# tests for the server |

### Client

The Client is written in TypeScript and contains the VS Code extension code, including the UI components, LSP client and other extension features that are not dependent on the Kusto parser library.

### Server

The Server is written in C# to interact with the .NET version of the Kusto parser library for better typing performance. It primarily contains LSP handlers and redirects requests to the parser library's code services.

## Development Setup

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Visual Studio Code](https://code.visualstudio.com/)

### Building the Language Server

```bash
cd src/Server
dotnet build
```

### Building the VS Code Extension

```bash
cd src/Client
npm install
npm run compile
```

### Running Locally

1. Open the repository in VS Code
2. Press `F5` to launch the Extension Development Host
3. Open a `.kql` file to activate the extension

## Debugging

### Debugging the Client

1. Open the `src/Client` folder in VS Code
2. Build the client using the `compile` task in the **NPM SCRIPTS** explorer panel
3. Build the server using `build-debug-server` in the same panel
4. Press **F5** to launch the Extension Development Host with debugging enabled

### Debugging the Server

1. Launch the extension in debug mode (above) — the server starts automatically
2. Attach to the server process:
   - **Visual Studio** — open `KustoExplorerVscode.slnx` and attach to the `dotnet.exe` process for the extension
   - **VS Code** — from the repo root, run `Debug: Attach to a .NET 5+ or .NET Core process` (`Ctrl+Shift+P`) and select the `Server` process

## Packaging

```bash
# Requires vsce: npm install -g @vscode/vsce
cd src/Client
npm run package
```

This will create a `.vsix` file that can be installed in VS Code.

### Manual Install / Uninstall

```bash
code --install-extension <vsix-file> [--force]
code --uninstall-extension ms-kusto.kusto-explorer-vscode
```

## Reporting Issues

Please use [GitHub Issues](https://github.com/microsoft/Kusto-Explorer-VsCode/issues) to report bugs or request features.

When reporting a bug, please include:
- VS Code version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Any relevant error messages from the Output panel (Kusto channel)

## Pull Request Guidelines

- Keep changes focused and atomic
- Follow existing code style and conventions
- Update documentation if needed
- Ensure the build passes before submitting
