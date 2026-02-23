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
        var schemaSource = new ServerSchemaSource(connectionManager);
        var optionsManager = new OptionsManager(new TestSettingsSource());
        var symbolManager = new SymbolManager(schemaSource, optionsManager);
        await symbolManager.EnsureSymbolsAsync("help.kusto.windows.net", "Samples", null, CancellationToken.None);
    }

    class TestSettingsSource : ISettingSource
    {
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
}
