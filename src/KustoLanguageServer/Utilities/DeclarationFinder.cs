// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Language;
using Kusto.Language.Editor;
using Kusto.Language.Symbols;
using Kusto.Language.Syntax;
using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;

namespace Kusto.Lsp;

public static class DeclarationFinder
{
    /// <summary>
    /// Find the where the symbol is declared.
    /// </summary>
    public static ImmutableList<DeclarationLocation> GetSourceDeclarations(
        GlobalState globals,
        SyntaxNode root,
        Symbol symbol
        )
    {
        var locations = new List<DeclarationLocation>();

        // is it a column of a known table?
        if (symbol is ColumnSymbol column)
        {
            if (globals.GetTable(column) is { } table)
            {
                // declared in a database table
                return [new DeclarationLocation { Entity = table }];
            }

            // is this column because of a union or a join rename?
            if (column.OriginalColumns.Count > 0)
            {
                // try all original columns
                foreach (var oc in column.OriginalColumns)
                {
                    locations.AddRange(GetSourceDeclarations(globals, root, oc));
                }
            }
        }
    
        // look for the database function it is declared in.
        var visited = new HashSet<SyntaxNode>();
        var queue = new Queue<(SyntaxNode node, Symbol? symbol)>();
        queue.Enqueue((root, null));

        while (queue.Count > 0)
        {
            var segment = queue.Dequeue();

            SyntaxElement.WalkNodes(
                segment.node,
                fnBefore:
                    node =>
                    {
                        if (node.ReferencedSymbol == symbol
                            && node is NameDeclaration)
                        {
                            locations.Add(new DeclarationLocation { Range = new TextRange(node.TextStart, node.Width), Entity = segment.symbol });
                        }
                        else if (node.ReferencedSymbol is FunctionSymbol fs
                            && globals.IsDatabaseFunction(fs)
                            && node.GetCalledFunctionBody() is { } body)
                        {
                            if (visited.Add(body))
                                queue.Enqueue((body, fs));
                        }
                    },
                fnAfter: node =>
                {
                    if (node.Alternates != null)
                    {
                        foreach (var alt in node.Alternates)
                        {
                            if (visited.Add(alt))
                            {
                                queue.Enqueue((alt, segment.symbol));
                            }
                        }
                    }
                }
                );
        }

        return locations.ToImmutableList();
    }

    /// <summary>
    /// Gets the local declaration node for the symbol,
    /// if it exists.
    /// </summary>
    public static bool TryGetLocalDeclaration(
        SyntaxNode root, 
        Symbol symbol, 
        [NotNullWhen(true)] out SyntaxNode? declaration)
    {
        SyntaxNode? result = null;

        SyntaxElement.WalkNodes(
            root,
            fnBefore: 
                node =>
                {
                    if (node is NameDeclaration nd
                        && nd.ReferencedSymbol == symbol)
                    {
                        result = nd;
                        return;
                    }
                },
            fnAfter: node =>
                {
                    if (node.Alternates != null)
                    {
                        foreach (var alt in node.Alternates)
                        {
                            if (TryGetLocalDeclaration(alt, symbol, out result))
                            {
                                return;
                            }
                        }
                    }
                },
            fnDescend: node => 
                result == null   // keep looking until we find a result
            );

        declaration = result;
        return result != null;
    }

    /// <summary>
    /// Gets the local declaration node for the symbol,
    /// if it exists.
    /// </summary>
    public static ImmutableList<SyntaxNode> GetLocalDeclarations(
        string text,
        GlobalState globals,
        string name)
    {
        var code = KustoCode.ParseAndAnalyze(text, globals);
        return GetLocalDeclarations(code.Syntax, name);
    }

    /// <summary>
    /// Gets the local declaration node for the symbol,
    /// if it exists.
    /// </summary>
    public static ImmutableList<SyntaxNode> GetLocalDeclarations(
        SyntaxNode root,
        string name)
    {
        var declarations = new List<SyntaxNode>();
        Walk(root);
        return declarations.ToImmutableList();

        void Walk(SyntaxNode root)
        {
            SyntaxElement.WalkNodes(
                root,
                fnBefore:
                    node =>
                    {
                        if (node is NameDeclaration nd
                            && nd.Name.SimpleName == name)
                        {
                            declarations.Add(nd);
                        }
                    },
                fnAfter: node =>
                {
                    if (node.Alternates != null)
                    {
                        foreach (var alt in node.Alternates)
                        {
                            Walk(alt);
                        }
                    }
                }
                );
        }
    }
}
