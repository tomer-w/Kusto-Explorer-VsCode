using System.Collections.Immutable;
using System.Runtime.CompilerServices;
using Kusto.Language;
using Kusto.Language.Editor;

namespace Kusto.Lsp;

public record DiagnosticInfo(Uri Id, string Text, ImmutableList<Diagnostic> Diagnostics);

public class DiagnosticsManager : IDiagnosticsManager
{
    private readonly IDocumentManager _documentManager;

    public DiagnosticsManager(IDocumentManager scriptManager)
    {
        _documentManager = scriptManager;

        _documentManager.DocumentAdded += (s, id) =>
        {
            RecomputeDiagnostics(id);
        };

        _documentManager.DocumentChanged += (s, id) =>
        {
            // TODO: find a way to delay this if the document is not currently visible in the editor
            RecomputeDiagnostics(id);
        };
    }

    /// <summary>
    /// An event raised when new diagnostics are available for a script.
    /// </summary>
    public event EventHandler<DiagnosticInfo>? DiagnosticsUpdated;


    private void SendDiagnosticsUpdated(DiagnosticInfo diagnostics)
    {
        if (this.DiagnosticsUpdated != null)
        {
            Task.Run(() => DiagnosticsUpdated?.Invoke(this, diagnostics));
        }
    }

    private readonly ConditionalWeakTable<Uri, DiagnosticsState> _idToDiagnosticState =
        new ConditionalWeakTable<Uri, DiagnosticsState>();

    class DiagnosticsState
    {
        public LatestRequestQueue DiagnosticQueue { get; } = new LatestRequestQueue();

        /// <summary>
        /// Previously computed diagnostics.
        /// </summary>
        public ImmutableList<Diagnostic> Diagnostics { get; set; } = ImmutableList<Diagnostic>.Empty;
    }

    private DiagnosticsState GetDiagnosticState(Uri documentId)
    {
        if (!_idToDiagnosticState.TryGetValue(documentId, out var info))
        {
            info = _idToDiagnosticState.GetOrAdd(documentId, _id => new DiagnosticsState());
        }
        return info;
    }

    private void RecomputeDiagnostics(Uri documentId)
    {
        if (_documentManager.TryGetDocument(documentId, out var document))
        {
            var state = GetDiagnosticState(documentId);

            var _ = state.DiagnosticQueue.Run(async (useThisCancellationToken) =>
            {
                // wait for delay before starting work (to batch up multiple changes)
                await Task.Delay(10, useThisCancellationToken);
                useThisCancellationToken.ThrowIfCancellationRequested();

                var diagnostics = new List<Diagnostic>();

                var dx = document.GetDiagnostics(waitForAnalysis: true, useThisCancellationToken);
                if (dx.Count > 0)
                {
                    diagnostics.AddRange(dx.Where(d => d.Severity != DiagnosticSeverity.Hidden));
                }

                var adx = document.GetAnalyzerDiagnostics(waitForAnalysis: true, useThisCancellationToken);
                if (adx.Count > 0)
                {
                    diagnostics.AddRange(adx.Where(d => d.Severity != DiagnosticSeverity.Hidden));
                }

                useThisCancellationToken.ThrowIfCancellationRequested();

                var newDiagnostics = diagnostics.ToImmutableList();
                state.Diagnostics = newDiagnostics;
                SendDiagnosticsUpdated(new DiagnosticInfo(documentId, document.Text, newDiagnostics));
            });
        }
    }
}
