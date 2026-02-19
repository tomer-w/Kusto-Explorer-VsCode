using System.Runtime.CompilerServices;
using Kusto.Language.Symbols;

namespace Kusto.Symbols;

// temporary workaround until folder property is added to the actual symbols in Kusto.Language
public static class SymbolFolderExtensions
{
    private static readonly ConditionalWeakTable<Symbol, string> _symbolFolderMap = 
        new ConditionalWeakTable<Symbol, string>();

    internal static void SetFolder(Symbol symbol, string folder)
    {
        _symbolFolderMap.AddOrUpdate(symbol, folder);
    }

    internal static string? GetFolder(this Symbol symbol)
    {
        if (_symbolFolderMap.TryGetValue(symbol, out var folder))
        {
            return folder;
        }
        return null;
    }

    extension (TableSymbol table)
    {
        public string Folder => GetFolder(table) ?? string.Empty;
    }

    extension (FunctionSymbol function)
    {
        public string Folder => GetFolder(function) ?? string.Empty;
    }

    extension (EntityGroupSymbol entityGroup)
    {
        public string Folder => GetFolder(entityGroup) ?? string.Empty;
    }

    extension (GraphModelSymbol graphModel)
    {
        public string Folder => GetFolder(graphModel) ?? string.Empty;
    }
}
