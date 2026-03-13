# Kusto Explorer (VS Code Extension)

Edit, run and chart Kusto queries (KQL).
Explore databases and query results.

## Get Started
- Open or create a `.kql` file in VS Code
- Adjust placement of connection panel (it will appear at bottom of list)
- Add a server connection and select a default database for the document
- Write a Kusto query or consult copilot for help writing one
- Press F5 to execute the query and view results in the results panel
- Use the chart button in the results panel to create a chart for your result data
- Edit the chart options to customize the chart type, axes, legend and more
- Add another query to the kql document, rinse and repeat
- Save your results and charts as a .kqr file to share with others or re-open later

## Query Editor (.kql documents)
- Syntax and semantic coloring of query text
- Autocompletion (Intellisense)
- Hover tips
- Pretty Printing (formatting)
- Goto definition and find all references for functions, tables, columns, and more
- Code actions and quick fixes for common issues and refactorings
- Copy colorized query text to the clipboard for pasting into other documents
- Have mutliple independent queries in the same document, separated by a blank line.

## Results Panel (bottom panel)
- Copy contents of cells or entire table to clipboard
- Drag and drop a table into your document as a KQL datatable expression
- Chart your data (it will open in a results viewer tab)

## Results Viewer (.kqr documents)
- Shows both result data and chart in the same view
- Copy the chart as an image to clipboard for either light-mode or dark-mode pasting.
- Copy the data to clipboard just like results panel.
- Edit the chart options to customize the chart type, axes, legend and more
- Save to a .kqr file to share with others or re-open later

## Requirements
- VS Code 1.9.0 or higher