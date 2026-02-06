namespace Kusto.Lsp;

public class ConnectionSettings
{
    public static Setting<string[]> Connections = 
        new ArraySetting<string>("kusto.connections", Array.Empty<string>());
}