# Kusto Explorer (VS Code Extension)

- Edit, run and chart Kusto queries (KQL)
- Explore databases and query results
- Consult copilot to help create, run and diagnose your queries

## Get Started
- Select the Kusto Explorer icon in VS Code activity panel
- Select a scratch pad document, or open/create a `.kql` file
- Connect the query document to a Kusto cluster and database (if not already connected)
	- Add a cluster connection in the *Connections* sidebar (if it does not yet exist)
	- Select a database (below cluster item) to set the active cluster and database for the document
- Write a Kusto query or consult copilot for help writing one
- Press F5 to execute the query and view results in the results panel
- Use the chart button in the results panel to create a chart for your result data
- Edit the chart options to customize the chart type, axes, legend and more
- Add another query to the document or edit the prior one, and run it too
- Revisit prior results in the *History* sidebar

## Connections (sidebar)
- Keep a list of Kusto clusters you use to run queries
- Select a cluster and database to be the defaults for your active query document
- Explore the entities (tables, functions, etc) contained in each database

## Scratch Pads (sidebar)
- Scratch pad documents for jotting down queries without needing to create and name a file

## History (sidebar)
 - Previously executed queries and their results that you can revisit

## Query Editor (query set documents)
- Edit queries like a source code document
- Multiple independent queries in a single document, separated by a blank line
- Intellisense (auto completions, hover tips)
- Formatting (pretty printing)
- Goto definition and find all references for tables, functions, columns and more
- Code actions and quick fixes for common issues and refactorings
- Copy colorized query text to the clipboard for pasting into other documents

## Results Panel (bottom panel)
- Copy contents of cells or entire table to clipboard
- Drag and drop a table into your document as a KQL `datatable` expression
- Add a chart to the results or edit the one you have to customize the chart type, axes, legend and more
- Save the data as a `.kqr` file (Kusto Query Results) to share with others

## Chart Panel (document tab)
- Edit the chart options to customize the chart type, axes, legend and more
- Copy the chart as an image to clipboard for either light-mode or dark-mode pasting
- Save chart and data as a `.kqr` file (Kusto Query Result)

## Results Viewer (document tab)
- View saved `.kqr` files (chart, data and query in one view panel)
- Add a chart if you don't have one yet
- Edit the chart options to customize the chart type, axes, legend and more
- Copy the chart as an image to clipboard for either light-mode or dark-mode pasting
- Copy the data to clipboard just like results panel

## Requirements
- VS Code 1.9.0 or higher

## Repository
- To file issues, explore the sources or contribute: 
 [[GitHub Repository]](https://github.com/microsoft/Kusto-Explorer-VsCode) 