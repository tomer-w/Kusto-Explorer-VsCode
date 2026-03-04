// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Newtonsoft.Json.Linq;
using System.Collections.Immutable;

namespace Kusto.Lsp;

public abstract class Setting
{
    public string Name { get; }

    protected Setting(string name)
    {
        Name = name;
    }
}

public class Setting<T> : Setting
{
    public T DefaultValue { get; }

    public Setting(string name, T defaultValue) : base(name)
    {
        this.DefaultValue = defaultValue;
    }

    public virtual T GetValue(ImmutableDictionary<string, object?> settings)
    {
        if (settings.TryGetValue(this.Name, out var value))
        {
            if (value is T tvalue)
            {
                return tvalue;
            }
            else if (value == null && typeof(T).CanBeNull())
            {
                return (T)value!;
            }
            else
            {
                try
                {
                    return (T)Convert.ChangeType(value, typeof(T))!;
                }
                catch
                {
                    return this.DefaultValue;
                }
            }
        }

        return this.DefaultValue;
    }

    public virtual ImmutableDictionary<string, object?> WithValue(ImmutableDictionary<string, object?> settings, T value)
    {
        return settings.SetItem(this.Name, value!);
    }
}

public class ArraySetting<T> : Setting<ImmutableList<T>>
{
    public ArraySetting(string name, ImmutableList<T> defaultValue) : base(name, defaultValue)
    {
    }

    public override ImmutableList<T> GetValue(ImmutableDictionary<string, object?> settings)
    {
        if (settings.TryGetValue(this.Name, out var value))
        {
            if (value is JArray jarray)
            {
                return jarray.ToObject<ImmutableList<T>>() ?? this.DefaultValue;
            }
            else if (value is IEnumerable<T> enumerable)
            {
                return enumerable.ToImmutableList();
            }
        }

        return this.DefaultValue;
    }
}

public class StringMappedSetting<T> : Setting<T>
    where T : notnull
{
    private readonly ImmutableDictionary<string, T> _map;
    private readonly ImmutableDictionary<T, string> _reverseMap;

    public StringMappedSetting(string name, T defaultValue, ImmutableDictionary<string, T> valueMapping)
        : base(name, defaultValue)
    {
        _map = valueMapping;
        _reverseMap = valueMapping.ToImmutableDictionary(kv => kv.Value, kv => kv.Key);
    }

    public override T GetValue(ImmutableDictionary<string, object?> settings)
    {
        if (settings.TryGetValue(this.Name, out var value)
            && value is string strValue
            && _map.TryGetValue(strValue, out var mappedValue))
        {
            return mappedValue;
        }

        return this.DefaultValue;
    }

    public override ImmutableDictionary<string, object?> WithValue(ImmutableDictionary<string, object?> settings, T value)
    {
        if (_reverseMap.TryGetValue(value, out var strValue))
        {
            return settings.SetItem(this.Name, strValue);
        }
        return settings;
    }
}
