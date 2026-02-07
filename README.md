# Kusto Language Server

A VS Code language server extension for Kusto Query Language (KQL)

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
    | render barchar
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

1. Must have svce installed (npm install -g @vscode/vsce)
2. run `npm run package` on command line within VsCodeExtension folder to build the .vsix file

## Installing the VSIX manually

Run `code --install-extension <vsix file> [--force]` on command line.