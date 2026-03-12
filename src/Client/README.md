# Kusto Explorer (VS Code Extension)

Edit, run and chart Kusto queries (KQL).
Explore databases and query results.

## Features

- KQL Documents
  - IntelliSense (auto completions)
  - Syntax and Semantic coloring
  - Semantic Copy/Paste
    - Copy query text as colorized html
  - Hover Tips
    - Describes item under the mouse cursor
    - Shows related diagnostics
  - Syntax highlighting
    - Highlights references to the same item
    - Highlights balanced parentheses, brackets and braces
  - Goto Definition
    - Goto the declaration location of items declared in your query or as part of the database
  - Find All References
    - Find all references to an item in your query
  - Diagnostics (errors/warnings)
    - All kusto diagnostics appear in VS Code Problems tab
  - Formatting
    - Pretty print a single query using Format button above first line of query
    - Pretty print the entire document using VS Code's Format Document (ALT-SHIFT-F).
    - Adjust format settings in VS Code `Settings/Extensions/Kusto`
  - Query execution
    - Place the caret inside the query and press F5
  - Code Actions
    - Quick fixes are indicated by ellipses beneath the related item, and are accissible within the hover tip.
    - Refactorings are indicated by a lightbulb menu that appears after clicking on related text item.
    - CoPilot also makes suggestions and offers fixes in the same UI.
- Connection panel
  - Add and remove server connections
  - Add and remove server group folders
  - Drag and drop server into and out of groups folders
  - Assign a connection to a KQL document by selecting a database
  - Explore database contents and view entity definitions
- Results Panel
  - View and explorer the tabular results of queries 
  - Tab through multiple result tables
  - Copy a table as html and markdown
  - Copy a table as a Kusto datatable expression
- Chart Panel
  - View chart as result of query with render operator
  - Copy charts as SVG, PNG and bitmap
- Chat Panel
  - Ask CoPilot questions using @kusto in the chat interface

## Usage

1. Open a `.kql` or `.csl` file
2. Select or add a connection in the connections view of the explorer panel
3. Select a default database for the the document under the connection item
4. Write your query
5. Press F5 to execute

## Requirements

- VS Code 1.9.0 or higher

