using Kusto.Language.Editor;

namespace Kusto.Lsp;

public interface IOptionsManager
{
    /// <summary>
    /// Refresh the options from settings.
    /// </summary>
    Task RefreshAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Raised when the options have changed.
    /// </summary>
    event EventHandler? OptionsChanged;

    /// <summary>
    /// The default domain for cluster names.
    /// </summary>
    string DefaultDomain { get; }

    /// <summary>
    /// The current formatting options
    /// </summary>
    FormattingOptions FormattingOptions { get; }
}
