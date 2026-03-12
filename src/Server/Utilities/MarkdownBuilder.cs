// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Data;

namespace Kusto.Vscode;

public class MarkdownBuilder : TextBuilder
{
    public void WriteDataTable(DataTable table)
    {
        // Write header row
        WriteOnNewLine("|");
        foreach (DataColumn column in table.Columns)
        {
            Write(" ");
            Write(EscapeMarkdown(column.ColumnName));
            Write(" |");
        }

        // Write separator row
        WriteOnNewLine("|");
        foreach (DataColumn column in table.Columns)
        {
            Write(" --- |");
        }
        WriteLine();

        // Write data rows
        foreach (DataRow row in table.Rows)
        {
            WriteOnNewLine("|");
            foreach (DataColumn column in table.Columns)
            {
                Write(" ");
                var value = row[column];
                var text = value == null || value == DBNull.Value ? "" : value.ToString() ?? "";
                Write(EscapeMarkdown(text));
                Write(" |");
            }
            WriteLine();
        }
    }

    private static string EscapeMarkdown(string text)
    {
        // Escape pipe characters and newlines for markdown table compatibility
        return text
            .Replace("\\", "\\\\")
            .Replace("|", "\\|")
            .Replace("\r\n", " ")
            .Replace("\n", " ")
            .Replace("\r", " ");
    }

}
