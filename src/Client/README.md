# Kusto Explorer (VS Code Extension)

- Edit, run and chart Kusto queries (KQL)
- Explore databases and query results
- Consult copilot to help create, run and diagnose your queries

## Get Started
- Open or create a `.kql` file in VS Code
- Open Kusto Explorer connections (icon in activity panel on left)
- Add a server connection and select a default database for the document
- Write a Kusto query or consult copilot for help writing one
- Press F5 to execute the query and view results in the results panel
- Use the chart button in the results panel to create a chart for your result data
- Edit the chart options to customize the chart type, axes, legend and more
- Add another query to the kql document, rinse and repeat
- Save your results and charts as a .kqr file to share with others or re-open later

## Kusto Explorer: Connections (icon in activity panel)
- Keep a list of Kusto servers you use to run queries
- Select a server and database to be the default database for your query document
- Explore the entities available in each database

## Query Editor (.kql documents)
- Syntax and semantic coloring of query text
- Autocompletion (Intellisense)
- Hover tips
- Pretty Printing (formatting)
- Goto definition and find all references for functions, tables, columns, and more
- Code actions and quick fixes for common issues and refactorings
- Copy colorized query text to the clipboard for pasting into other documents
- Have multiple independent queries in the same document, separated by a blank line.

## Results Panel (bottom panel)
- Copy contents of cells or entire table to clipboard
- Drag and drop a table into your document as a KQL `datatable` expression
- Chart your data (it will open in a results viewer tab)
- Save the data as a `.kqr` file (Kusto Query Results)

## Chart Panel (with documents)
- Edit the chart options to customize the chart type, axes, legend and more
- Copy the chart as an image to clipboard for either light-mode or dark-mode pasting
- Save chart and data as a `.kqr` file (Kusto Query Result)

## Results Viewer (.kqr documents)
- Shows chart, data and query in one view
- Add a chart if you don't have one yet
- Edit the chart options to customize the chart type, axes, legend and more
- Copy the chart as an image to clipboard for either light-mode or dark-mode pasting
- Copy the data to clipboard just like results panel

## Requirements
- VS Code 1.9.0 or higher