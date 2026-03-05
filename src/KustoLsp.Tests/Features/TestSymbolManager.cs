// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Lsp;
using System.Collections.Immutable;

namespace KustoLspTests;

[TestClass]
public class TestSymbolManager
{
    [TestMethod]
    public async Task TestLoadSamples()
    {
        var connectionManager = new ConnectionManager();
        connectionManager.GetOrAddConnection("help.kusto.windows.net");
        var schemaSource = new ServerSchemaSource(connectionManager);
        var schemaManager = new SchemaManager(schemaSource, TestStorage.Instance, logger: null);
        var optionsManager = new OptionsManager(new TestSettingsSource());
        var symbolManager = new SymbolManager(schemaManager, optionsManager);
        await symbolManager.EnsureDatabaseAsync("help.kusto.windows.net", "Samples", null, CancellationToken.None);
        Assert.HasCount(1, symbolManager.Globals.Clusters);
        var help = symbolManager.Globals.GetCluster("help.kusto.windows.net");
        Assert.IsNotNull(help);
        var samples = help.GetDatabase("Samples");
        Assert.IsNotNull(samples);
        Assert.AreNotEqual(0, samples.Tables.Count);
    }

    class TestSettingsSource : ISettingSource
    {
        public static readonly TestSettingsSource Instance = new TestSettingsSource();

#pragma warning disable CS0067
        public event EventHandler? SettingsChanged;
#pragma warning restore CS0067

        public Task<T> GetSettingAsync<T>(Setting<T> setting, CancellationToken cancellation)
        {
            return Task.FromResult(setting.DefaultValue);
        }

        public Task<ImmutableDictionary<string, object?>> GetSettingsAsync(IReadOnlyList<Setting> settings, CancellationToken cancellationToken)
        {
            return Task.FromResult(ImmutableDictionary<string, object?>.Empty);
        }
    }

    class TestStorage : IStorage
    {
        public static readonly TestStorage Instance = new TestStorage();

        public Task<T?> GetValueAsync<T>(string key, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<T?>(default);
        }

        public Task SetValueAsync<T>(string key, T? value, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }
    }
}
