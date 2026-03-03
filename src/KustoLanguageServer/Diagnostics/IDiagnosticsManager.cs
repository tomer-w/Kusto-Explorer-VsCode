// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

namespace Kusto.Lsp;

public interface IDiagnosticsManager
{
    /// <summary>
    /// An event raised when new diagnostics are available for a script.
    /// </summary>
    event EventHandler<DiagnosticInfo>? DiagnosticsUpdated;
}
