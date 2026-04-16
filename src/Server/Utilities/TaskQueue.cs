// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

namespace Kusto.Vscode;

/// <summary>
/// Maintains a queue of tasks that run sequentially
/// </summary>
public class TaskQueue
{
    private readonly object _lock = new();
    private Task _head;

    public TaskQueue()
    {
        _head = Task.FromResult(true);
    }

    public Task Run(CancellationToken cancellationToken, Action<CancellationToken> syncAction)
    {
        lock (_lock)
        {
            var task = _head.ContinueWith(_t => syncAction(cancellationToken), cancellationToken, TaskContinuationOptions.RunContinuationsAsynchronously, TaskScheduler.Default);
            _head = task;
            return task;
        }
    }

    public Task Run(Action syncAction)
    {
        return Run(CancellationToken.None, _ => syncAction());
    }

    public Task<T> Run<T>(CancellationToken cancellationToken, Func<CancellationToken, T> syncFunction)
    {
        lock (_lock)
        {
            var task = _head.ContinueWith(_t => syncFunction(cancellationToken), cancellationToken, TaskContinuationOptions.RunContinuationsAsynchronously, TaskScheduler.Default);
            _head = task;
            return task;
        }
    }

    public Task<T> Run<T>(Func<T> syncFunction)
    {
        return Run(CancellationToken.None, _ => syncFunction());
    }

    public Task Run(CancellationToken cancellationToken, Func<CancellationToken, Task> asyncAction)
    {
        lock (_lock)
        {
            var task = _head.ContinueWith(_t => asyncAction(cancellationToken), cancellationToken, TaskContinuationOptions.RunContinuationsAsynchronously, TaskScheduler.Default).Unwrap();
            _head = task;
            return task;
        }
    }

    public Task Run(Func<Task> asyncAction)
    {
        return Run(CancellationToken.None, _ => asyncAction());
    }

    public Task<T> Run<T>(CancellationToken cancellationToken, Func<CancellationToken, Task<T>> asyncFunction)
    {
        lock (_lock)
        {
            var task = _head.ContinueWith(_t => asyncFunction(cancellationToken), cancellationToken, TaskContinuationOptions.RunContinuationsAsynchronously, TaskScheduler.Default).Unwrap();
            _head = task;
            return task;
        }
    }

    public Task<T> Run<T>(Func<Task<T>> asyncFunction)
    {
        return Run<T>(CancellationToken.None, _ => asyncFunction());
    }
}
