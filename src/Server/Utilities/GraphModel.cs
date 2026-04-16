// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Kusto.Vscode;

// disable nullability to allow construction of target instances before deserializing into them
#nullable disable
public class GraphModel
{
    public string Schema;
    public GraphModelDefinition Definition;

    public static bool TryParse(string text, out GraphModel model)
    {
        model = JsonConvert.DeserializeObject<GraphModel>(text);
        return model != null;
    }

    public override string ToString()
    {
        return JsonConvert.SerializeObject(this);
    }

    public IReadOnlyList<string> GetEdgeQueries() =>
        _edgeQueries ??= Definition?.Steps?.OfType<GraphModelEdgeStep>()?.Select(step => step.Query).ToArray() ?? Array.Empty<string>();
    private IReadOnlyList<string> _edgeQueries;

    public IReadOnlyList<string> GetNodeQueries() =>
        _nodeQueries ??= Definition?.Steps?.OfType<GraphModelNodeStep>()?.Select(step => step.Query).ToArray() ?? Array.Empty<string>();
    private IReadOnlyList<string> _nodeQueries;
}

public class GraphModelDefinition
{
    public GraphModelStep[] Steps;
}

[JsonConverter(typeof(GraphModelStepConverter))]
public abstract class GraphModelStep
{
    public string Query;
    public string[] Labels;
    public string LabelsIdColumn;
}

public sealed class GraphModelNodeStep : GraphModelStep
{
    public string NodeColumn;
}

public sealed class GraphModelEdgeStep : GraphModelStep
{
    public string SourceColumn;
    public string TargetColumn;
}
#nullable restore

public class GraphModelStepConverter : JsonConverter
{
    public override bool CanConvert(Type objectType) =>
        objectType == typeof(GraphModelStep);

    public override object? ReadJson(JsonReader reader, Type objectType, object? existingValue, JsonSerializer serializer)
    {
        var obj = JObject.Load(reader);
        var kind = (string?)obj["Kind"];

        GraphModelStep step = kind switch
        {
            "AddNodes" => new GraphModelNodeStep(),
            "AddEdges" => new GraphModelEdgeStep(),
            // unexpected kind; json is bad or outdated, must fail entire deserialization
            _ => throw new InvalidOperationException($"Unknown graph model step kind: {kind}")
        };

        serializer.Populate(obj.CreateReader(), step);

        return step;
    }

    public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
    {
        if (value is GraphModelStep step)
        {
            var obj = JObject.FromObject(value);
            var kind = step switch
            {
                GraphModelNodeStep => "AddNodes",
                GraphModelEdgeStep => "AddEdges",
                _ => throw new InvalidOperationException($"Unknown graph model step type: '{step.GetType().Name}'")
            };
            obj.AddFirst(new JProperty("Kind", kind));
            obj.WriteTo(writer);
        }
        else
        {
            throw new NotSupportedException($"The value is not type GraphModelStep");
        }
    }
}

