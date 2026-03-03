// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;

namespace Kusto.Lsp;

public interface ISettingSource
{
    event EventHandler? SettingsChanged;
    Task<T> GetSettingAsync<T>(Setting<T> setting, CancellationToken cancellation);
    Task<ImmutableDictionary<string, object?>> GetSettingsAsync(IReadOnlyList<Setting> settings, CancellationToken cancellationToken);
}
