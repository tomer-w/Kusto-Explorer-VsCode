using Kusto.Language.Editor;

namespace Kusto.Lsp;

public interface IOptionsManager
{
    Task<FormattingOptions> GetFormattingOptionsAsync(CancellationToken cancellationToken);
}
