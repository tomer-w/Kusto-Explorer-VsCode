using System.Collections.Immutable;

namespace Kusto.Lsp;

public class ConnectionSettings
{
    public static Setting<string> DefaultDomain =
        new Setting<string>("kusto.defaultDomain", ".kusto.windows.net");

    public static readonly ImmutableList<Setting> All =
        [
            DefaultDomain
        ];
}