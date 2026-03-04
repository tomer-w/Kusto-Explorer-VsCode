// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;

namespace Kusto.Lsp;

/// <summary>
/// A source of settings.
/// </summary>
public interface ISettingSource
{
    /// <summary>
    /// An event raised when any of the settings have changed.
    /// </summary>
    event EventHandler? SettingsChanged;

    /// <summary>
    /// Gets the value of a single setting.
    /// </summary>
    Task<T> GetSettingAsync<T>(Setting<T> setting, CancellationToken cancellation);

    /// <summary>
    /// Get the values for many settings as a dictionary.
    /// </summary>
    Task<ImmutableDictionary<string, object?>> GetSettingsAsync(IReadOnlyList<Setting> settings, CancellationToken cancellationToken);
}
