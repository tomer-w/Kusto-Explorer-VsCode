using Newtonsoft.Json;
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

    public virtual T GetValue(IReadOnlyDictionary<string, object> settings)
    {
        if (settings.TryGetValue(this.Name, out var value)
            && value is T tvalue)
        {
            return tvalue;           
        }

        return this.DefaultValue;
    }
}

public class ArraySetting<T> : Setting<T[]>
{
    public ArraySetting(string name, T[] defaultValue) : base(name, defaultValue)
    {
    }

    public override T[] GetValue(IReadOnlyDictionary<string, object> settings)
    {
        if (settings.TryGetValue(this.Name, out var value))
        {
            if (value is JArray jarray)
            {
                return jarray.ToObject<T[]>() ?? this.DefaultValue;
            }
            else if (value is T[] tarray)
            {
                return tarray;
            }
            else if (value is IEnumerable<T> enumerable)
            {
                return enumerable.ToArray();
            }
        }

        return this.DefaultValue;
    }
}

public class StringMappedSetting<T> : Setting<T>
{ 
    public ImmutableDictionary<string, T> ValueMapping { get; }

    public StringMappedSetting(string name, T defaultValue, ImmutableDictionary<string, T> valueMapping)
        : base(name, defaultValue)
    {
        this.ValueMapping = valueMapping;
    }

    public override T GetValue(IReadOnlyDictionary<string, object> settings)
    {
        if (settings.TryGetValue(this.Name, out var value)
            && value is string strValue
            && this.ValueMapping.TryGetValue(strValue, out var mappedValue))
        {
            return mappedValue;
        }

        return this.DefaultValue;
    }
}
