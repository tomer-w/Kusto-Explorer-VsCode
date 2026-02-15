using System.Data;
using System.Reflection;

namespace Kusto.Lsp;

public class HtmlBuilder : TextBuilder
{
    public HtmlOptions Options { get; }

    public HtmlBuilder(HtmlOptions? options = null)
    {
        this.Options = options ?? HtmlOptions.Default;
    }

    public void WriteTagNested(string tag, string attributes, Action content)
    {
        this.WriteOnNewLine();
        this.WriteStartTag(tag, attributes);
        this.WriteLine();
        this.WriteNested(content);
        this.WriteOnNewLine();
        this.WriteEndTag(tag);
    }

    public void WriteTagNested(string tag, string attributes, string content) =>
        WriteTagNested(tag, attributes, () => Write(content));

    public void WriteTagInline(string tag, string attributes, Action content)
    {
        this.WriteStartTag(tag, attributes);
        content();
        this.WriteEndTag(tag);
    }

    public void WriteTagInline(string tag, string attributes, string content) =>
        WriteTagInline(tag, attributes, () => Write(content));

    public void WriteStartTag(string tag, string attributes)
    {
        if (string.IsNullOrWhiteSpace(attributes))
        {
            this.Write($"<{tag}>");
        }
        else
        {
            this.Write($"<{tag} {attributes}>");
        }
    }

    public void WriteEndTag(string tag)
    {
        this.WriteLine($"</{tag}>");
    }

    public void WriteHtml(Action content)
    {
        this.WriteTagNested("html", this.Options.HtmlAttributes, content);
    }

    public void WriteHtml(Action? head, Action? body)
    {
        this.WriteHtml(() =>
        {
            if (head != null)
                WriteHead(head);
            if (body != null)
                WriteBody(body);
        });
    }

    public void WriteHead(Action content)
    {
        this.WriteTagNested("head", this.Options.HeaderAttributes, content);
    }

    public void WriteHead(string content)
    {
        this.WriteHead(() => Write(content));
    }

    public void WriteBody(Action content)
    {
        this.WriteTagNested("body", this.Options.BodyAttributes, content);
    }

    public void WriteBody(string content)
    {
        this.WriteBody(() => Write(content));
    }

    public void WriteH1(Action content)
    {
        this.WriteTagInline("h1", "", content);
        this.WriteLine();
    }

    public void WriteH1(string text)
    {
        this.WriteH1(() => this.Write(text));
    }

    public void WriteBold(Action content)
    {
        this.WriteTagNested("b", "", content);
    }

    public void WriteBold(string text)
    {
        this.WriteBold(() => this.Write(text));
    }

    public void WriteTable(Action content)
    {
        this.WriteTagNested("table", this.Options.TableAttributes, content);
    }

    public void WriteTableHeadingRow(Action content)
    {
        this.WriteTagNested("tr", this.Options.TableHeadingRowAttributes, content);
    }

    public void WriteTableDetailRow(Action content)
    {
        this.WriteTagNested("tr", this.Options.TableDetailRowAttributes, content);
    }

    public void WriteTableRowHeading(Action content)
    {
        this.WriteTagInline("th", this.Options.TableRowHeadingAttributes, content);
    }

    public void WriteTableRowDetail(Action content)
    {
        this.WriteTagInline("td", this.Options.TableRowDetailAttributes, content);
    }

    public void WriteTable(DataTable table)
    {
        WriteTable(() =>
        {
            WriteTableHeadingRow(() =>
            {
                foreach (DataColumn column in table.Columns)
                {
                    WriteTableRowHeading(() =>
                    {
                        Write(System.Net.WebUtility.HtmlEncode(column.ColumnName));
                    });
                }
            });

            foreach (DataRow row in table.Rows)
            {
                WriteTableDetailRow(() =>
                {
                    foreach (var item in row.ItemArray)
                    {
                        WriteTableRowDetail(() =>
                        {
                            Write(System.Net.WebUtility.HtmlEncode(item?.ToString() ?? string.Empty));
                        });
                    }
                });
            }
        });
    }
}


public record HtmlOptions
{
    public string HtmlAttributes { get; set; } = "";
    public string HeaderAttributes { get; set; } = "";
    public string BodyAttributes { get; set; } = "";
    public string TableAttributes { get; init; } = "border=\"1\" style=\"border-collapse: collapse; width: fit-content;\"";
    public string TableHeadingRowAttributes = "";
    public string TableDetailRowAttributes = "";
    public string TableRowDetailAttributes { get; init; } = "style=\"padding: 4px; white-space: nowrap; overflow-x: auto; max-width: 500px;\"";
    public string TableRowHeadingAttributes { get; init; } = "style=\"padding: 4px; font-weight: bold;\"";

    public static readonly HtmlOptions Default = new HtmlOptions();
}
