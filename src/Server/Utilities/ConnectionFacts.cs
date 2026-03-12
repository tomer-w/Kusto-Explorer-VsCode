using Kusto.Language;
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

namespace Kusto.Vscode;

public static class ConnectionFacts
{
    /// <summary>
    /// Gets full host name (including domain) from a cluster name or URI.
    /// If the input is already a full host name, it is returned as is.
    /// If the input is a cluster name without a domain, the default domain is appended to it.
    /// If the input is a URI, the host name is extracted.
    /// </summary>
    public static string GetFullHostName(string clusterNameOrUri, string defaultDomain)
    {
        return KustoFacts.GetFullHostName(KustoFacts.GetHostName(clusterNameOrUri), defaultDomain);
    }
}