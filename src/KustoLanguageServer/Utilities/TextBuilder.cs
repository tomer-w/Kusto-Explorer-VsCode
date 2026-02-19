using System.Text;

namespace Kusto.Lsp;

public abstract class TextBuilder
{
    private StringBuilder _builder = new StringBuilder();
    private string _lineStartIndentation = "";
    private const string _indent = "    ";
    private bool _isLineStart = true;

    /// <summary>
    /// The built text.
    /// </summary>
    public string Text => _builder.ToString();

    /// <summary>
    /// Writes text.
    /// If the text contains new lines, each line is written separately.
    /// </summary>
    public void Write(string text)
    {
#if false
        if (text.Contains('\n'))
        {
            var lines = text.ReplaceLineEndings("\n").Split('\n');
            for (int i = 0; i < lines.Length; i++)
            {
                if (i < lines.Length - 1)
                    WriteLine(lines[i]);
                else
                    Write(lines[i]);
            }
        }
        else
#endif
        {
            if (_isLineStart)
            {
                _builder.Append(_lineStartIndentation);
                _isLineStart = false;
            }

            _builder.Append(text);
        }
    }

    /// <summary>
    /// Writes a line of text.
    /// Any following text will be on a new line.
    /// Will add a new line even if text is null and was already at the start of a line.
    /// </summary>
    public void WriteLine(string? text = null)
    {
        if (text != null)
            Write(text);
        _builder.AppendLine();
        _isLineStart = true;
    }

    /// <summary>
    /// Writes text on a new line.
    /// It will not add a new line if already at the start of a line.
    /// </summary>
    public void WriteOnNewLine(string? text = null)
    {
        if (!_isLineStart)
        {
            WriteLine();
        }

        if (text != null)
            Write(text);
    }

    /// <summary>
    /// Writest a line of text that starts on a new line and ends with a new line.
    /// </summary>
    public void WriteLineOnNewLine(string text)
    {
        WriteOnNewLine();
        WriteLine(text);
    }

    /// <summary>
    /// Writes a line of text nested one indentation level.
    /// </summary>
    public void WriteLineNested(string text)
    {
        WriteNested(() => WriteLine(text));
    }

    /// <summary>
    /// Writes nested text within an increased indentation level.
    /// </summary>
    public void WriteNested(Action action)
    {
        var oldLineStartIndentation = _lineStartIndentation;
        _lineStartIndentation = _lineStartIndentation + _indent;
        WriteOnNewLine();
        action();
        WriteOnNewLine();
        _lineStartIndentation = oldLineStartIndentation;
    }

    /// <summary>
    /// Writes nested text within open and close strings, each on their own line.
    /// </summary>
    public void WriteNested(string open, string close, Action action)
    {
        WriteLineOnNewLine(open);
        WriteNested(action);
        WriteLineOnNewLine(close);
    }

    private List<string> _blocks = default!;

    /// <summary>
    /// Call this to write multiple blocks, each separated by a blank line.
    /// Calls to WriteBlock within the action will create separate blocks.
    /// </summary>
    public void WriteLineSeparatedBlocks(Action action)
    {
        var oldBuilder = _builder;
        var oldBlocks = _blocks;
        _builder = new StringBuilder();
        _blocks = new List<string>();

        action();

        _builder = oldBuilder;

        if (_blocks.Count > 0)
        {
            _builder.Append(string.Join(Environment.NewLine, _blocks));
        }

        _blocks = oldBlocks;
    }

    /// <summary>
    /// Call this to write a block of text, within a call to WriteLineSeparatedBlocks.
    /// </summary>
    public void WriteBlock(Action action)
    {
        // any writes outside of WriteBlock is treated as a separate block
        if (_builder.Length > 0)
        {
            _blocks.Add(_builder.ToString());
            _builder.Clear();
        }

        action();

        if (_builder.Length > 0)
        {
            _blocks.Add(_builder.ToString());
            _builder.Clear();
        }
    }

    /// <summary>
    /// Writes a blank line between each action
    /// </summary>
    protected void WriteLineSeparated(params Action[] actions)
    {
        WriteLineSeparatedBlocks(() =>
        {
            foreach (var action in actions)
            {
                WriteBlock(action);
            }
        });
    }
}
