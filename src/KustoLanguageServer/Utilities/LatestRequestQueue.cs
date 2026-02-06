namespace Kusto.Lsp;

/// <summary>
/// A task queue that cancels the previous task when a new task is queued.
/// </summary>
public class LatestRequestQueue
{
    private TaskInfo? _latestTask;

    private record TaskInfo(Task Task, CancellationTokenSource CancellationSource);

    public LatestRequestQueue()
    {
    }

    /// <summary>
    /// Runs the given action asynchronously, canceling any previously running action in the queue.
    /// The cancellation token passed to the action will be canceled when a new action is queued or when the provided cancellation token is canceled.
    /// </summary>
    public Task Run(CancellationToken cancellation, Func<CancellationToken, Task> asyncAction)
    {
        lock (this)
        {
            _latestTask?.CancellationSource.Cancel();
            var cts = new CancellationTokenSource();
            var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(cts.Token, cancellation);
            var task = Task.Run(() => asyncAction(combinedCts.Token), combinedCts.Token);
            _latestTask = new TaskInfo(task, cts);
            return task;
        }
    }

    /// <summary>
    /// Runs the given action asynchronously, canceling any previously running action in the queue.
    /// </summary>
    public Task Run(Func<CancellationToken, Task> asyncAction)
    {
        return Run(CancellationToken.None, asyncAction);
    }
}