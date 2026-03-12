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

### Packaging the Extension

```bash
cd src/Client
npm run package
```

This will create a `.vsix` file that can be installed in VS Code.

## Project Structure

- `src/Server/` - Vs Code extension Server (C#)
- `src/Client/` - VS Code extension Client (TypeScript)

## Reporting Issues

Please use [GitHub Issues](https://github.com/microsoft/Kusto-Language-Server/issues) to report bugs or request features.

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
