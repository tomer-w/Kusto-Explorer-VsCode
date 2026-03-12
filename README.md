# Kusto Explorer for VS Code

A VS Code extension for the Kusto Query Language (KQL)

## Features

- Syntax highlighting
- Intellisense (auto completions)
- Hover tips
- Code Actions (refactorings, quick fixes)
- Diagnostics (errors/warnings)
- Query formatting
- Query execution
- Charting
- Connection management

## Usage

1. Open or create a `.kql` file

2. Add or open a server in the connections section of the explorer panel
    ```
    CONNECTIONS
    ├── 📁 Production
    │   ├── 🗄️ mycluster.eastus.kusto.windows.net
    │   │   ├── 📊 MyDatabase
    │   │   ├── 📊 LogsDatabase
    │   │   └── 📊 TelemetryDB
    │   └── 🗄️ analytics.westus.kusto.windows.net
    │       └── 📊 AnalyticsDB
    ├── 📁 Development
    │   └── 🗄️ devcluster.kusto.windows.net
    │       └── 📊 TestDatabase
    └── 🗄️ help.kusto.windows.net
        └── 📊 Samples
    ```

3. Select a database for the the document under the server item.
    ```
    CONNECTIONS
    ├── 📁 Production
    │   ├── 🗄️ mycluster.eastus.kusto.windows.net
    │   │   ├── 📊 MyDatabase
    │   │   ├── 📊 LogsDatabase
    │   │   └── 📊 TelemetryDB
    │   └── 🗄️ analytics.westus.kusto.windows.net
    │       └── 📊 AnalyticsDB
    ├── 📁 Development
    │   └── 🗄️ devcluster.kusto.windows.net
    │       └── 📊 TestDatabase
    └── 🗄️ help.kusto.windows.net
        └── ✓ 📊 Samples  (default)
    ```

    The document will now be associated with the server and database each time you open it.
    You can change this association at any time by selecting a different database.

4. Write or edit your query
    ```
    StormEvents
    | where StartTime > ago(7d)
    | summarize EventCount = count() by State
    | top 10 by EventCount desc
    | render barchart
     ```

5. Press F5 to run the query

    The results of the query will appear in the Results panel.
    ```
    RESULTS (10 rows)

    State          EventCount
    ─────────────  ──────────
    Texas          280
    California     240
    Oklahoma       200
    Kansas         180
    Florida        160
    Nebraska       140
    Iowa           120
    Missouri       100
    Louisiana      80
    Arkansas       60
    ```

   If the query includes a render operator, a chart is displayed in its own panel.

    ```
    State          EventCount
    ────────────────────────────────────────────────────
    Texas          ████████████████████████████ 280
    California     ████████████████████████ 240
    Oklahoma       ████████████████████ 200
    Kansas         ██████████████████ 180
    Florida        ████████████████ 160
    Nebraska       ██████████████ 140
    Iowa           ████████████ 120
    Missouri       ██████████ 100
    Louisiana      ████████ 80
    Arkansas       ██████ 60
    ```

## Requirements

- VS Code 1.75.0 or higher

## Creating the VSIX installer

1. Must have vsce installed (npm install -g @vscode/vsce)
2. run `npm run package` on command line within `src/Client` folder to build the .vsix file

## Installing the VSIX manually

Run `code --install-extension <vsix file> [--force]` on command line.

## Uninstalling the extension manually

Run `code --uninstall-extension Microsoft.kusto-explorer-vscode` on command line.

## Launching in VS Code debug mode (without installing VSIX)

1. Open `src\Client` folder in VS Code.
2. Build the client side using `compile` command in explorer panel `NPM SCRIPTS`
3. Build the server side using `build-debug-server` in explorer panel `NPM SCRIPTS`
4. Press F5 to launch the extension in a new VS Code window with debugging enabled.

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
