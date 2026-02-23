using Kusto.Language.Editor;

namespace Kusto.Lsp;

public interface IOptionsManager
{
    /// <summary>
    /// Refresh the options from settings.
    /// </summary>
    Task RefreshAsync(CancellationToken cancellationToken);

    /// <summary>
    /// The default domain for cluster names.
    /// </summary>
    string DefaultDomain { get; }

    /// <summary>
    /// The current formatting options
    /// </summary>
    FormattingOptions FormattingOptions { get; }
}
