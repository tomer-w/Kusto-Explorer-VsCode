using System.Runtime.Serialization;

namespace Microsoft.VisualStudio.LanguageServer.Protocol;

[DataContract]
public class PrepareRenameParams : TextDocumentPositionParams
{
}

[DataContract]
public class RenameRange
{
    [DataMember(Name = "range")]
    public required Range Range { get; set; }

    [DataMember(Name = "placeholder")]
    public string? PlaceHolder { get; set; }
}

