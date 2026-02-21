using System.Collections.Immutable;

namespace Kusto.Lsp;

public class ConnectionSettings
{
    public static Setting<ImmutableList<string>> Connections = 
        new ArraySetting<string>("kusto.connections", ImmutableList<string>.Empty);
}