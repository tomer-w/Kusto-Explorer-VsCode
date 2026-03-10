// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Diagnostics.CodeAnalysis;
using System.Reflection;

using Kusto.Language;
using Kusto.Language.Editor;
using Kusto.Language.Symbols;

namespace Kusto.Lsp;

public static class KustoCodeServiceExtensions
{
    private delegate bool TryGetBoundCodeDelegate(Kusto.Language.Utils.CancellationToken cancellationToken, bool waitForAnalysis, out KustoCode code);

    /// <summary>
    /// Gets the parsed and analyzed <see cref="KustoCode"/> for this code service, if available.
    /// </summary>
    /// <remarks>TODO: remove this when exposed in Kusto.Language</remarks>
    public static bool TryGetCode(this CodeService service, CancellationToken cancellationToken, [NotNullWhen(true)] out KustoCode? code)
    {
        if (service is OffsetCodeService oks)
            service = (CodeService)typeof(OffsetCodeService).GetField("_service", BindingFlags.NonPublic | BindingFlags.Instance)!.GetValue(service)!;

        if (service is KustoCodeService kcs
            && typeof(KustoCodeService).GetMethod("TryGetBoundCode", BindingFlags.NonPublic | BindingFlags.Instance) is { } method)
        {
            var tryGetBoundCode = (TryGetBoundCodeDelegate)Delegate.CreateDelegate(typeof(TryGetBoundCodeDelegate), kcs, method);
            return tryGetBoundCode(cancellationToken, true, out code);
        }

        code = null;
        return false;
    }

    /// <summary>
    /// Gets the referenced symbol at the given document position.
    /// </summary>
    /// <remarks>TODO: remove this when exposed in Kusto.Language</remarks>
    public static Symbol? GetReferencedSymbol(this CodeService service, int position, CancellationToken cancellationToken)
    {
        if (service.TryGetCode(cancellationToken, out var code))
        {
            var token = code.GetTokenWithAffinity(position);
            if (token != null)
            {
                var node = token.Parent;
                while (node != null)
                {
                    if (node.ReferencedSymbol != null)
                        return node.ReferencedSymbol;

                    // if parent has save span as this one, 
                    // check parent.
                    if (node.Parent.TextStart == node.TextStart
                        && node.Parent.Width == node.Width)
                    {
                        node = node.Parent;
                        continue;
                    }
                    break;
                }
            }
        }

        return null;
    }

    public static Symbol? GetResultType(this CodeService service, int position, CancellationToken cancellationToken)
    {
        if (service.TryGetCode(cancellationToken, out var code))
        {
            var token = code.GetTokenWithAffinity(position);
            if (token != null)
            {
                var node = token.Parent;
                while (node != null)
                {
                    if (node is Kusto.Language.Syntax.Expression expr)
                        return expr.ResultType;

                    // if parent has save span as this one, 
                    // check parent.
                    if (node.Parent.TextStart == node.TextStart
                        && node.Parent.Width == node.Width)
                    {
                        node = node.Parent;
                        continue;
                    }
                    break;
                }
            }
        }
        return null;
    }

    public static Symbol? GetQueryResultType(this CodeService service, int position, CancellationToken cancellationToken)
    {
        if (service.TryGetCode(cancellationToken, out var code))
        {
            return code.ResultType;
        }
        return null;
    }
}