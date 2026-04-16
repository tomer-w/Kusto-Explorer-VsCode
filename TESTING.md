# Test Strategy

This document describes the testing approach for this VS Code extension, including
what is tested, what is intentionally excluded, and why.

## Guiding Principles

- **Test logic with clear inputs and outputs.** Pure functions, state machines,
  encoders, queues, and managers with injectable dependencies are high-value targets.
- **Don't test glue code.** Thin wiring that just connects VS Code APIs to our logic
  adds mock maintenance cost without catching real bugs.
- **Don't lock in questionable behavior.** Ported or heuristic code that guesses at
  structure (e.g., parsing unpredictable server error messages) should not have its
  quirks enshrined in tests.
- **Prefer real dependencies over mocks when practical.** For example, `DiagnosticsManager`
  tests use a real `DocumentManager` with actual Kusto Language parsing rather than
  mocking the `IDocument` interface.

## Server Tests (C# / MSTest)

Run: `dotnet run --project ServerTests/ServerTests.csproj`

### Tested

| Area | What's covered |
|---|---|
| **TaskQueue** | Sequential execution, cancellation, async overloads, concurrent callers |
| **LatestRequestQueue** | Cancels previous task, combined token cancellation, rapid requests |
| **SemanticTokenEncoder** | Delta encoding, token type mapping, modifier bitmask, unknown types |
| **KqlBuilder** | Table/function/view/graph model generation, `WriteSpaced` spacing rules |
| **ErrorDecoder** | Syntax/semantic error position extraction, `EditString` offset mapping |
| **ConnectionFacts** | Connection string parsing and classification |
| **ClientDirectiveExtensions** | Query directive parsing |
| **DeclarationFinder** | Symbol declaration location resolution |
| **DocumentManager** | Document add/remove/update, text changes, connection updates, globals |
| **DiagnosticsManager** | Event firing on add/change, valid/invalid query diagnostics, multi-doc |
| **ConnectionManager** | Server CRUD, document connection resolution, schema refresh |
| **OptionsManager** | Settings change propagation |
| **SchemaManager** | Schema loading and caching |

### Intentionally Not Tested

| Area | Reason |
|---|---|
| **LspServer** | Integration surface — requires a running LSP client/server pair. Covered indirectly by the managers it delegates to. |
| **LspExtensions** | Data contract classes with no logic. |
| **Server.cs event handlers** | Thin wiring between LSP server and managers. |
| **ErrorDecoder heuristics (exhaustive)** | Ported from Kusto Explorer. Tests cover the main paths, but exhaustively testing every regex branch would lock in behavior that is likely wrong for edge cases. The code is a best-effort attempt to extract error positions from varied server error formats. |

## Client Tests (TypeScript / Vitest)

Run: `cd Client && npx vitest run`

### Unit Tests

| Area | What's covered |
|---|---|
| **chartProvider** | `hexToRgba`, `isNumericType`, `isDateTimeType`, `getColumnRef`, `getColumnRefByIndex` |
| **chartEditorProvider** | Chart option defaults, HTML generation, message handling |
| **clipboard** | Copy formatting for tables, columns, cells |
| **connectionManager** | Connection CRUD, document connection resolution, display names |
| **dataTableProvider** | Table rendering, column sorting, filtering |
| **entityDefinitionProvider** | Entity definition content retrieval |
| **historyManager** | History file read/write (async), entry management, max entries |
| **html** | HTML escaping utilities |
| **importManager** | Import flow, connection resolution, server detection |
| **markdown** | Markdown table generation |
| **plotlyChartProvider** | Plotly trace generation, chart type mapping, series handling |
| **resultsCache** | Result storage, retrieval, eviction |
| **scratchPadManager** | File creation, ordering, reconciliation |
| **timePivotChartProvider** | View lifecycle, edge cases (no data, no datetime, zero range), range/point modes |

### Integration Tests

Run: `npm run compile && npm run compile:integration && vscode-test`

| Area | What's covered |
|---|---|
| **connectionsPanel** | Panel rendering, connection display |
| **extension** | Activation, command registration |
| **historyPanel** | Panel rendering, history display |
| **queryEditor** | Editor decorations, query separators |
| **resultsViewer** | Results display, chart rendering |
| **scratchPadPanel** | Panel rendering |

### Intentionally Not Unit Tested

| Area | Reason |
|---|---|
| **compositeChartProvider** | Delegates to `PlotlyChartProvider` and `TimePivotChartProvider` based on chart type — both are individually tested. The composition logic is a single `if` branch. |
| **connectionStatusBar** | Thin wiring: subscribes to events, calls `vscode.window.createStatusBarItem`, updates text. Would require mocking `StatusBarItem`, `activeTextEditor`, and `onDidChangeActiveTextEditor` — all missing from the test mock and not worth adding for code with no branching logic beyond null checks. |
| **connectionsPanel** | Tree view provider that mostly delegates to `connectionManager`. The interesting logic is in `connectionManager` (tested). The panel itself is VS Code `TreeDataProvider` glue. Covered by integration tests. |
| **copilot** | Copilot chat participant registration — pure VS Code API wiring with module-level state. |
| **dotnet** | Runtime detection and process spawning — requires filesystem and process access. |
| **server** | LSP client wrapper — thin delegation to `vscode-languageclient`. |
| **webview** | Webview panel management — VS Code API surface with no testable logic. |
| **resultsViewer** | Large module that orchestrates webviews, charts, and result display. Core logic (chart providers, results cache, data table) is tested through its extracted components. Covered by integration tests. |
| **queryEditor** | Editor decoration logic. Covered by integration tests. |
| **importer** | File parsing and import orchestration. The interesting parts (connection resolution, server detection) are tested via `importManager`. |

## Adding New Tests

When adding tests, prefer:

1. **Unit tests for pure logic** — anything that takes inputs and produces outputs
   without side effects.
2. **Integration tests for UI wiring** — anything that requires VS Code APIs
   (webviews, tree views, status bars, editors).
3. **Skip tests for trivial delegation** — if a module just forwards calls to an
   already-tested dependency, a test adds maintenance cost without value.

If a reviewer requests tests for a module listed in the "Intentionally Not Tested"
sections above, point them to this document and discuss whether the cost/benefit
has changed.
