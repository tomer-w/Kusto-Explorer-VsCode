// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Language;
using Kusto.Language.Editor;
using Kusto.Language.Parsing;
using Kusto.Language.Symbols;
using Kusto.Language.Syntax;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Immutable;
using static System.Net.Mime.MediaTypeNames;

namespace Kusto.Lsp;

public class KqlBuilder : TextBuilder
{
    private readonly FormattingOptions _options;

    public KqlBuilder(FormattingOptions options)
        : base(options.IndentationSize)
    {
        _options = options;    
    }

    /// <summary>
    /// Does not add space between writes.
    /// </summary>
    private static bool NeverSpace(char prev, char next) => false;

    /// <summary>
    /// Always adds a space between writes.
    /// </summary>
    private static bool AlwaysSpace(char prev, char next) => true;

    /// <summary>
    /// Add a space between writes is neiher sides has whitespace.
    /// </summary>
    private static bool SpaceIfNone(char prev, char next) =>
        !(prev == '\0' || char.IsWhiteSpace(prev)) && !char.IsWhiteSpace(next);

    /// <summary>
    /// Adds a space between writes if both sides would combine as an identifier.
    /// </summary>
    private static bool SpaceIfBothIdentifiers(char prev, char next) =>
        IsKustoIdentifierCharacter(prev) && IsKustoIdentifierCharacter(next);

    private static bool IsKustoIdentifierCharacter(char c)
    {
        return char.IsLetterOrDigit(c) || c == '$' || c == '_';
    }

    /// <summary>
    /// Writes the text using the spacing rule.
    /// </summary>
    public void WriteSpaced(string text, Func<char, char, bool> fnNeedsSpace)
    {
        if (string.IsNullOrEmpty(text))
            return;

        if (fnNeedsSpace(this.LastCharacter, text[0]))
        {
            Write(" ");
        }
                      
        if (IsKustoIdentifierCharacter(this.LastCharacter)
            && IsKustoIdentifierCharacter(text[0]))
        {
            Write(" ");
        }

        Write(text);
    }

    /// <summary>
    /// Writes the text using, adding a space if not whitespace is on either side.
    /// </summary>
    public void WriteSpaced(string text) =>
        WriteSpaced(text, SpaceIfNone);

    private bool _isLineList;
    private int _listCount;
    private string _listSeparator = ",";

    /// <summary>
    /// Writes an element of a list.
    /// You use this nested within a call to <see cref="WriteList"/>
    /// </summary>
    public void WriteListElement(Action action)
    {
        if (_listCount > 0)
        {
            Write(_listSeparator);

            if (_isLineList)
                WriteLine();
            else
                Write(" ");
        }

        action();
        _listCount++;
    }

    /// <summary>
    /// Writes an element of a list.
    /// You use this nested within a call to <see cref="WriteList"/>
    /// </summary>
    public void WriteListElement(string content)
    {
        WriteListElement(() => Write(content));
    }

    /// <summary>
    /// Writes a list of elements, with the separator between them.
    /// The action writes elements by calling <see cref="WriteListElement"/> within the action.
    /// </summary>
    public void WriteList(string separator, Action action)
    {
        var oldIsLineList = _isLineList;
        var oldListCount = _listCount;
        var oldListSeparator = _listSeparator;
        _isLineList = false;
        _listCount = 0;
        _listSeparator = separator;
        action();
        _isLineList = oldIsLineList;
        _listCount = oldListCount;
        _listSeparator = oldListSeparator;
    }

    /// <summary>
    /// Writes a list of elements, each on a different line.
    /// The action writes elements by calling <see cref="WriteListElement"/> within the action.
    /// </summary>
    public void WriteLineSeparatedList(string separator, Action action)
    {
        var oldIsLineList = _isLineList;
        var oldListCount = _listCount;
        _isLineList = true;
        _listCount = 0;
        _listSeparator = separator;
        WriteOnNewLine();
        action();
        _isLineList = oldIsLineList;
        _listCount = oldListCount;
    }

    /// <summary>
    /// Writes a comma separated list.
    /// </summary>
    public void WriteCommaList(Action action) =>
        WriteList(",", action);

    /// <summary>
    /// Writes a line separated comma list
    /// </summary>
    public void WriteLineSeparatedCommaList(Action action) =>
        WriteLineSeparatedList(",", action);


    public void WriteDiagonalNested(string open, string close, Func<char, char, bool> spacingRule, Action action)
    {
        WriteSpaced(open, spacingRule);
        WriteNested(action);
        WriteLineOnNewLine(close);
    }

    public void WriteBracketNested(string open, string close, BrackettingStyle style, Func<char, char, bool> spacingRule, Action action)
    {
        if (style == BrackettingStyle.Diagonal)
        {
            WriteDiagonalNested(open, close, spacingRule, action);
        }
        else
        {
            WriteNested(open, close, action);
        }
    }

    public void WriteParensNested(Action action)
    {
        WriteBracketNested("(", ")", _options.BrackettingStyle, SpaceIfNone, action);
    }

    public void WritefunctionBodyNested(Action action)
    {
        WriteBracketNested("{", "}", _options.FunctionBodyStyle, AlwaysSpace, action);
    }

    public void WriteSchemaNested(Action action)
    {
        WriteBracketNested("(", ")", _options.SchemaStyle, AlwaysSpace, action);
    }

    public void WritePropertyWithClause(IReadOnlyList<(string name, string literal)> props)
    {
        if (props.Count > 0)
        {
            this.WriteOnNewLine($"with");
            this.WriteBracketNested("(", ")", _options.BrackettingStyle, AlwaysSpace, () =>
            {
                this.WriteLineSeparatedCommaList(() =>
                {
                    foreach (var pair in props)
                    {
                        WriteListElement($"{pair.name}={pair.literal}");
                    }
                });
            });
        }
    }

    public void WriteCreateTableCommand(TableInfo info)
    {
        this.Write($".create-merge table {KustoFacts.BracketNameIfNecessary(info.Name, KustoDialect.EngineCommand)}");

        WriteTableSchema(info.Columns);

        var props = GetProperties(info.Folder, info.Description, null);
        this.WritePropertyWithClause(props);
    }

    public void WriteTableSchema(IReadOnlyList<ColumnInfo> columns)
    {
        this.WriteSchemaNested(() =>
        {
            WriteLineSeparatedCommaList(() =>
            {
                foreach (var col in columns)
                {
                    WriteListElement($"{KustoFacts.BracketNameIfNecessary(col.Name, KustoDialect.EngineCommand)}: {col.Type}");
                }
            });
        });
    }

    public void WriteCreateExternalTableCommand(ExternalTableInfoEx info)
    {
        this.Write($".create-or-alter external table {KustoFacts.BracketNameIfNecessary(info.Name, KustoDialect.EngineCommand)}");
        WriteTableSchema(info.Columns);
        var type = info.Type.ToLower();
        WriteLineOnNewLine($"kind = {type}");

        if (type == "delta"
            || type == "sql")
        {
            var connstr = info.ConnectionStrings.Count > 0 ? info.ConnectionStrings[0] : "";
            WriteLineOnNewLine($"({KustoFacts.GetStringLiteral(connstr)})");
        }
        else
        {
            if (info.Partitions.Count > 0)
                WritePartition(info.Partitions[0]);

            var format = info.Properties.TryGetValue("Format", out var fmt) ? fmt.ToString() : "csv";
            WriteLineOnNewLine($"dataformat = {format!.ToLower()}");

            // connection strings
            if (info.ConnectionStrings.Count == 0)
            {
                WriteOnNewLine("('')");
            }
            WriteNested("(", ")", () =>
            {
                WriteLineSeparatedCommaList(() =>
                {
                    foreach (var cs in info.ConnectionStrings)
                    {
                        WriteListElement(KustoFacts.GetStringLiteral(cs));
                    }
                });
            });
        }

        var props = info.Properties.Remove("Format");
        WritePropertyWithClause(GetPropertyLiterals(props));

        void WritePartition(ExternalTablePartition partition)
        {
            var name = KustoFacts.BracketNameIfNecessary(partition.Name, KustoDialect.EngineCommand);
            var columnName = partition.ColumnName != null
                ? KustoFacts.BracketNameIfNecessary(partition.ColumnName, KustoDialect.EngineCommand)
                : null;

            WriteOnNewLine();
            Write($"partition by ({name}: ");
            switch (partition.Function?.ToLower())
            {
                case "bin":
                    Write($"datetime");
                    if (columnName != null && partition.PartitionBy != null)
                        Write($" = bin({columnName}, timespan({partition.PartitionBy}))");
                    break;
                case "startofday":
                case "startofweek":
                case "startofmonth":
                case "startofyear":
                    Write($"datetime");
                    if (columnName != null)
                        Write($" = {partition.Function}({columnName})");
                    break;
                default:
                    Write($"string");
                    if (columnName != null)
                        Write($" = {columnName}");
                    break;
            }
            WriteLine(")");

            if (info.PathFormat != null)
            {
                WriteLineOnNewLine($"pathformat = ({info.PathFormat})");
            }
        }
    }

    public void WriteCreateMaterializedViewCommand(MaterializedViewInfo info)
    {
        var view = KustoFacts.BracketNameIfNecessary(info.Name, KustoDialect.EngineCommand);
        var table = KustoFacts.BracketNameIfNecessary(info.Source, KustoDialect.EngineCommand);
        this.WriteLine($".create-or-alter materialized-view {view} on table {table}");
        WriteNested("{", "}", () => WriteLinesAdjusted(info.Query));
    }

    public void WriteParametersNested(Action action)
    {
        WriteBracketNested("(", ")", _options.FunctionParameterStyle, AlwaysSpace, action);
    }

    public void WriteBodyNested(Action action)
    {
        WriteBracketNested("{", "}", _options.FunctionBodyStyle, AlwaysSpace, action);
    }

    public void WriteCreateFunctionCommand(FunctionInfo info)
    {
        var functionName = KustoFacts.BracketNameIfNecessary(info.Name, KustoDialect.EngineCommand);
        var props = GetProperties(info.Folder, info.Description, null);

        Write(".create-or-alter function");
        
        if (props.Count > 0)
        {
            WriteNested(() =>
            {
                WritePropertyWithClause(props);
            });
            WriteOnNewLine(functionName);
        }
        else
        {
            Write(" ");
            Write(functionName);
        }

        WriteParameterList(Parameter.ParseList(info.Parameters), KustoDialect.EngineCommand);

        var bodyTrimmed = info.Body.Trim();
        if (bodyTrimmed.StartsWith("{") && bodyTrimmed.EndsWith("}"))
        {
            WriteLineOnNewLine(info.Body);
        }
        else
        {
            WriteBodyNested(() => WriteLinesAdjusted(info.Body));
        }
    }

    public void WriteParameterList(IReadOnlyList<Parameter> parameters, KustoDialect dialect)
    {
        if (parameters.Count < 5)
        {
            Write(" (");
            WriteCommaList(() =>
            {
                foreach (var p in parameters)
                {
                    WriteListElement(() => Write(GetParameterDeclaration(p, dialect)));
                }
            });
            Write(")");
        }
        else
        {
            // many parameters, split across multiple lines
            WriteParametersNested(() =>
            {
                WriteLineSeparatedCommaList(() =>
                {
                    foreach (var p in parameters)
                    {
                        WriteListElement(() => Write(GetParameterDeclaration(p, dialect)));
                    }
                });
            });
        }
    }

    public void WriteCreateEntityGroupCommand(EntityGroupInfo info)
    {
        var name = KustoFacts.BracketNameIfNecessary(info.Name, KustoDialect.EngineCommand);
        Write($".create-or-alter entity_group {name}");
        WriteNested("(", ")", () =>
        {
            WriteLineSeparatedCommaList(() =>
            {
                foreach (var e in info.Entities)
                {
                    WriteListElement(e);
                }
            });
        });
    }

    public void WriteCreateGraphModelCommand(GraphModelInfo info)
    {
        var name = KustoFacts.BracketNameIfNecessary(info.Name, KustoDialect.EngineCommand);
        Write($".create-or-alter graph_model {name}");
        if (!info.Model.Contains("```"))
        {
            WriteLineOnNewLine("```");
            Write(info.Model);
            WriteLineOnNewLine("```");
        }
        else if (!info.Model.Contains("~~~"))
        {
            WriteLineOnNewLine("~~~");
            Write(info.Model);
            WriteLineOnNewLine("~~~");
        }
        else
        {
            WriteLineOnNewLine(KustoFacts.GetStringLiteral(info.Model));
        }
    }

    private static string GetParameterDeclaration(Parameter parameter, KustoDialect dialect)
    {
        string text = KustoFacts.BracketNameIfNecessary(parameter.Name, dialect);

        if (parameter.TypeKind == ParameterTypeKind.Declared && parameter.DeclaredTypes.Count == 1)
        {
            if (parameter.DeclaredTypes[0] is TableSymbol table)
            {
                return text + ": " + GetTableSchemaDeclaration(table, dialect);
            }

            if (parameter.DefaultValue != null)
            {
                return $"{text}: {parameter.DeclaredTypes[0].Name} = {parameter.DefaultValue.ToString(IncludeTrivia.Interior)}";
            }

            return KustoFacts.BracketNameIfNecessary(parameter.Name) + ": " + parameter.DeclaredTypes[0].Name;
        }

        if (parameter.TypeKind == ParameterTypeKind.Tabular)
        {
            return text + ": (*)";
        }

        return text + ": dynamic";
    }

    private static string GetTableSchemaDeclaration(TableSymbol table, KustoDialect dialect)
    {
        if (table.Columns.Count == 0)
        {
            return "(*)";
        }

        return "(" + string.Join(", ", table.Columns.Select((ColumnSymbol c) => GetColumnDeclaration(c, dialect))) + ")";
    }

    private static string GetColumnDeclaration(ColumnSymbol column, KustoDialect dialect)
    {
        return KustoFacts.BracketNameIfNecessary(column.Name, dialect) + ": " + column.Type.Name;
    }

    private List<(string name, string literal)> GetProperties(string? folder, string? docstring, JObject? jsonProperties)
    {
        var props = new List<(string name, string literal)>();
        if (!string.IsNullOrWhiteSpace(folder))
            props.Add(("folder", KustoFacts.GetSingleQuotedStringLiteral(folder)));
        if (!string.IsNullOrWhiteSpace(docstring))
            props.Add(("docstring", KustoFacts.GetSingleQuotedStringLiteral(docstring)));
        if (jsonProperties != null)
            AddJsonProperties(props, jsonProperties);
        return props;
    }

    private List<(string name, string literal)> GetPropertyLiterals(ImmutableDictionary<string, object> properties)
    {
        return properties
            .Where(kvp => kvp.Value != null)
            .Select(kvp => (name: kvp.Key, literal: KustoGenerator.GetLiteral(kvp.Value)))
            .ToList();
    }

    private void AddJsonProperties(List<(string name, string literal)> list, JObject properties)
    {
        foreach (var kvp in ((IDictionary<string, JToken>)properties))
        {
            var literal = ToKustoLiteral(kvp.Value);
            list.Add((kvp.Key, literal));
        }
    }

    private static string ToKustoLiteral(JToken token)
    {
        switch (token.Type)
        {
            case JTokenType.String:
                return KustoFacts.GetSingleQuotedStringLiteral(token.ToString());
            case JTokenType.Integer:
            case JTokenType.Float:
                return token.ToString();
            case JTokenType.Boolean:
                return token.ToString().ToLower();
            case JTokenType.Array:
            case JTokenType.Object:
                return $"dynamic({token.ToString()})";
            case JTokenType.Null:
                return "null";
            default:
                throw new NotSupportedException($"Unsupported property value type: {token.Type}");
        }
    }
}
