using System.Collections.Immutable;
using System.Runtime.CompilerServices;
using Kusto.Language;
using Kusto.Language.Editor;

namespace Kusto.Lsp;

public record DiagnosticInfo(Uri Id, string Text, ImmutableList<Diagnostic> Diagnostics);

public class DiagnosticsManager : IDiagnosticsManager
{
    private readonly IDocumentManager _documentManager;
    private readonly IResultsManager _resultsManager;

    public DiagnosticsManager(
        IDocumentManager scriptManager,
        IResultsManager resultsManager)
    {
        _documentManager = scriptManager;
        _resultsManager = resultsManager;

        _documentManager.DocumentAdded += (s, id) =>
        {
            RecomputeDiagnostics(id);
        };

        _documentManager.DocumentChanged += (s, id) =>
        {
            // TODO: find a way to delay this if the document is not currently visible in the editor
            RecomputeDiagnostics(id);
        };

        _resultsManager.ResultsChanged += (s, document) =>
        {
            // results for this document changed, could be new diagnostics.
            RecomputeDiagnostics(document.Id);
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

                // add normal diagnostics
                var dx = document.GetDiagnostics(waitForAnalysis: true, useThisCancellationToken);
                if (dx.Count > 0)
                {
                    diagnostics.AddRange(dx.Where(d => d.Severity != DiagnosticSeverity.Hidden));
                }

                // add analyzer diagnostics
                var adx = document.GetAnalyzerDiagnostics(waitForAnalysis: true, useThisCancellationToken);
                if (adx.Count > 0)
                {
                    diagnostics.AddRange(adx.Where(d => d.Severity != DiagnosticSeverity.Hidden));
                }

                // add any diagnostics from the last query results
                foreach (var range in document.GetSectionRanges())
                {
                    if (_resultsManager.TryGetLastResultId(document, range.Start, out var resultId)
                        && _resultsManager.TryGetCachedResultById(resultId, out var result)
                        && result.Diagnostics != null
                        && result.Diagnostics.Count > 0)
                    {
                        diagnostics.AddRange(result.Diagnostics);
                    }
                }

                useThisCancellationToken.ThrowIfCancellationRequested();

                var newDiagnostics = diagnostics.ToImmutableList();
                state.Diagnostics = newDiagnostics;
                SendDiagnosticsUpdated(new DiagnosticInfo(documentId, document.Text, newDiagnostics));
            });
        }
    }
}
