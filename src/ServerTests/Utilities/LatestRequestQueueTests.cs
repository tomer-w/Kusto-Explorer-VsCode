// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Vscode;

namespace Tests.Utilities;

[TestClass]
public class LatestRequestQueueTests
{
    [TestMethod]
    public async Task Run_SingleAction_Executes()
    {
        var queue = new LatestRequestQueue();
        var executed = false;

        await queue.Run(async ct =>
        {
            await Task.Yield();
            executed = true;
        });

        Assert.IsTrue(executed);
    }

    [TestMethod]
    public async Task Run_NewRequest_CancelsPreviousRequest()
    {
        var queue = new LatestRequestQueue();
        var firstStarted = new TaskCompletionSource<bool>();
        var firstCancelled = new TaskCompletionSource<bool>();
        var secondCompleted = new TaskCompletionSource<bool>();

        // First request: signals when started, then waits until cancelled
        var firstTask = queue.Run(async ct =>
        {
            firstStarted.SetResult(true);
            try
            {
                await Task.Delay(Timeout.Infinite, ct);
            }
            catch (OperationCanceledException)
            {
                firstCancelled.SetResult(true);
                throw;
            }
        });

        // Wait for first task to actually be running
        await firstStarted.Task.WaitAsync(TimeSpan.FromSeconds(5));

        // Second request: should cancel the first
        var secondTask = queue.Run(async ct =>
        {
            await Task.Yield();
            secondCompleted.SetResult(true);
        });

        // First task should have been cancelled
        var wasCancelled = await firstCancelled.Task.WaitAsync(TimeSpan.FromSeconds(5));
        Assert.IsTrue(wasCancelled);

        // Second task should complete
        var didComplete = await secondCompleted.Task.WaitAsync(TimeSpan.FromSeconds(5));
        Assert.IsTrue(didComplete);

        await secondTask;
    }

    [TestMethod]
    public async Task Run_ExternalCancellation_CancelsAction()
    {
        var queue = new LatestRequestQueue();
        var cts = new CancellationTokenSource();

        var actionStarted = new TaskCompletionSource<bool>();

        var task = queue.Run(cts.Token, async ct =>
        {
            actionStarted.SetResult(true);
            await Task.Delay(Timeout.Infinite, ct);
        });

        await actionStarted.Task.WaitAsync(TimeSpan.FromSeconds(5));

        cts.Cancel();

        try
        {
            await task.WaitAsync(TimeSpan.FromSeconds(5));
            Assert.Fail("Expected TaskCanceledException");
        }
        catch (TaskCanceledException) { }
    }

    [TestMethod]
    public async Task Run_RapidRequests_OnlyLastCompletes()
    {
        var queue = new LatestRequestQueue();
        var completedIndex = -1;

        // Fire 10 rapid requests — only the last should complete
        Task? lastTask = null;
        for (int i = 0; i < 10; i++)
        {
            var index = i;
            lastTask = queue.Run(async ct =>
            {
                await Task.Delay(10, ct);
                Interlocked.Exchange(ref completedIndex, index);
            });
        }

        await lastTask!;

        // The last request (index 9) should be the one that completed
        Assert.AreEqual(9, completedIndex);
    }
}
