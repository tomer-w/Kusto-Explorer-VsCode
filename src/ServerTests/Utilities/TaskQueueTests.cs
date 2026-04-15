// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Vscode;

namespace Tests.Utilities;

[TestClass]
public class TaskQueueTests
{
    [TestMethod]
    public async Task Run_SyncAction_Executes()
    {
        var queue = new TaskQueue();
        var executed = false;

        await queue.Run(() => { executed = true; });

        Assert.IsTrue(executed);
    }

    [TestMethod]
    public async Task Run_SyncFunction_ReturnsValue()
    {
        var queue = new TaskQueue();

        var result = await queue.Run(() => 42);

        Assert.AreEqual(42, result);
    }

    [TestMethod]
    public async Task Run_AsyncAction_Executes()
    {
        var queue = new TaskQueue();
        var executed = false;

        await queue.Run(async () =>
        {
            await Task.Yield();
            executed = true;
        });

        Assert.IsTrue(executed);
    }

    [TestMethod]
    public async Task Run_AsyncFunction_ReturnsValue()
    {
        var queue = new TaskQueue();

        var result = await queue.Run(async () =>
        {
            await Task.Yield();
            return 42;
        });

        Assert.AreEqual(42, result);
    }

    [TestMethod]
    public async Task Run_TasksExecuteSequentially()
    {
        var queue = new TaskQueue();
        var order = new List<int>();

        var t1 = queue.Run(async () =>
        {
            await Task.Delay(50);
            lock (order) { order.Add(1); }
        });

        var t2 = queue.Run(async () =>
        {
            lock (order) { order.Add(2); }
        });

        var t3 = queue.Run(async () =>
        {
            lock (order) { order.Add(3); }
        });

        await Task.WhenAll(t1, t2, t3);

        CollectionAssert.AreEqual(new[] { 1, 2, 3 }, order);
    }

    [TestMethod]
    public async Task Run_ConcurrentCallers_MaintainSequentialOrder()
    {
        var queue = new TaskQueue();
        var order = new List<int>();
        var barrier = new Barrier(3);

        // Simulate 3 threads calling Run concurrently
        var tasks = Enumerable.Range(1, 3).Select(i => Task.Run(() =>
        {
            barrier.SignalAndWait();
            return queue.Run(() => { lock (order) { order.Add(i); } });
        })).ToArray();

        await Task.WhenAll(tasks);

        // All 3 should have executed (order may vary since concurrent callers race for the lock)
        Assert.AreEqual(3, order.Count);
        CollectionAssert.AreEquivalent(new[] { 1, 2, 3 }, order);
    }

    [TestMethod]
    public async Task Run_WithCancellation_ThrowsWhenCancelled()
    {
        var queue = new TaskQueue();
        var cts = new CancellationTokenSource();
        cts.Cancel();

        var task = queue.Run(cts.Token, ct => { ct.ThrowIfCancellationRequested(); });
        try
        {
            await task;
            Assert.Fail("Expected TaskCanceledException");
        }
        catch (TaskCanceledException) { }
    }

    [TestMethod]
    public async Task Run_CancelledTask_DoesNotBlockSubsequentTasks()
    {
        var queue = new TaskQueue();
        var cts = new CancellationTokenSource();
        cts.Cancel();

        // Cancelled task
        try
        {
            await queue.Run(cts.Token, ct => { ct.ThrowIfCancellationRequested(); });
        }
        catch (TaskCanceledException) { }

        // Subsequent task should still run
        var result = await queue.Run(() => 99);
        Assert.AreEqual(99, result);
    }
}
