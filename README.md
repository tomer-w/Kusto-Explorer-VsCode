# Kusto Language Server

A VS Code language server extension for Kusto Query Language (KQL)

## Features

- IntelliSense (completions/hover)
- Syntax highlighting
- Diagnostics (errors/warnings)
- Code formatting
- Query execution
- Charting
- Connection management

## Usage

1. Open a `.kql`, `.csl`, or `.kusto` file
2. Select or add a connection in the connections view of the explorer panel
3. Select a default database for the the document under the connection item
4. Write your query
5. Press F5 to execute

## Requirements

- VS Code 1.75.0 or higher

## Creating the VSIX installer

1. Must have svce installed (npm install -g @vscode/vsce)
2. run `npm run package` to build and package the extension into a .vsix file

## Installing the VSIX 

code --install-extension <vsix file>