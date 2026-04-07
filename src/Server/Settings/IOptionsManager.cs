// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Language.Editor;

namespace Kusto.Vscode;

public interface IOptionsManager
{
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

    /// <summary>
    /// The default chart options from user settings.
    /// </summary>
    ChartOptions DefaultChartOptions { get; }
}
