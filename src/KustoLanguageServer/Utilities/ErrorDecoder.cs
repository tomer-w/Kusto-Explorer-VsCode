using Kusto.Cloud.Platform.Utils;
using Kusto.Data.Exceptions;
using Kusto.Language;
using Kusto.Language.Editor;
using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;

namespace Kusto.Lsp;

public class ErrorDecoder
{
    /// <summary>
    /// Gets a <see cref="Diagnostic"/> corresponding to the given exception and query.
    /// </summary>
    public static Diagnostic GetDiagnostic(Exception exception, EditString query)
    {
        var details = GetErrorDetails(exception, query);

        var dx = new Diagnostic(
            code: details.ErrorCode,
            category: DiagnosticCategory.Correctness,
            severity: DiagnosticSeverity.Error,
            description: details.RecoveryAction,
            message: details.Message 
            );

        if (details.LineOffset is { } lineOffset
            && details.CharacterOffset is { } charOffset
            && query.OriginalText.TryGetTextPosition(lineOffset - 1, charOffset - 1, out var position))
        {
            var len = details.Token != null ? details.Token.Length : 1;
            dx = dx.WithLocation(position, len);
        }
        else
        {
            var originalStartPosition = query.GetOriginalPosition(0, PositionBias.Right);
            var originalEndPosition = query.GetOriginalPosition(query.CurrentText.Length, PositionBias.Left);
            dx = dx.WithLocation(originalStartPosition, originalEndPosition - originalStartPosition);
        }

        return dx;
    }

    public static KustoErrorDetails GetErrorDetails(Exception exception, EditString query)
    {
        var details = KustoErrorDetails.FromException(exception);
        details = FindLineAndPosition(details, query);
        return ConvertToOriginalLineAndPosition(details, query);
    }

    /// <summary>
    /// Updates the error details with line/position information found inside the error message if possible.
    /// </summary>
    private static KustoErrorDetails FindLineAndPosition(KustoErrorDetails details, EditString query)
    {
        if (details.LineOffset == null || details.CharacterOffset == null)
        {
            // ResolveErrorPosition will search for line/position info in message text if it is missing from details
            if (KustoQueryErrorResolver.TryResolveErrorPositions(query.CurrentText, details, out var errorPositions))
            {
                var position = errorPositions.Select(ep => ep.Position).FirstOrDefault();
                if (Kusto.Language.Parsing.TextFacts.TryGetLineAndOffset(query.CurrentText, position, out var line, out var lineOffset))
                {
                    details = details.WithLinePosition(line, lineOffset - 1);
                }
            }
        }

        return details;
    }

    /// <summary>
    /// Coverts the error detail's current line and position info to its position within the original text.
    /// </summary>
    private static KustoErrorDetails ConvertToOriginalLineAndPosition(KustoErrorDetails details, EditString query)
    {
        if (details.LineOffset == null || details.CharacterOffset == null)
        {
            details = FindLineAndPosition(details, query);
        }

        if (details.LineOffset != null && details.CharacterOffset != null)
        {
            // Does this Line/Position not make any sense?
            // Note: some line offsets for queries after commands may have gotten incorrectly encoded as an offset to the token start
            // or some approximation of it (due to removal of whitespace and/or bad math).
            // This is a work around (temporary) to improve visual error reporting
            if (!(Kusto.Language.Parsing.TextFacts.TryGetPosition(query.CurrentText, details.LineOffset.Value, details.CharacterOffset.Value, out var offsetInCurrentText)
                  && offsetInCurrentText < query.CurrentText.Length)
                && !string.IsNullOrEmpty(details.Token)
                && details.LineOffset.Value < query.CurrentText.Length)
            {
                // use the lineOffset as a starting position to search for the token nearby.
                // TODO: possibly parse the command to avoid finding matches inside comments, etc.
                var tokenStart = query.CurrentText.IndexOf(details.Token, details.LineOffset.Value);
                if (tokenStart > 0
                    && Kusto.Language.Parsing.TextFacts.TryGetLineAndOffset(query.CurrentText, tokenStart, out var trueLine, out var trueLinePosition))
                {
                    details = details.WithLinePosition(trueLine, trueLinePosition);
                }
            }

            if (details.LineOffset is { } lineOffset
                && details.CharacterOffset is { } characterOffset
                && Kusto.Language.Parsing.TextFacts.TryGetPosition(query.CurrentText, lineOffset, characterOffset, out offsetInCurrentText)
                && offsetInCurrentText < query.CurrentText.Length)
            {
                // convert text offset back to position in the unmodified original text
                var offsetInOriginalText = query.GetOriginalPosition(offsetInCurrentText);
                if (Kusto.Language.Parsing.TextFacts.TryGetLineAndOffset(query.OriginalText, offsetInOriginalText, out var originalLine, out var originalLinePosition))
                {
                    // save line Position as 1-based to match similar info in issues pane.
                    return details.WithLinePosition(originalLine, originalLinePosition);
                }
            }
        }

        return details;
    }

    internal sealed class KustoQueryErrorResolver
    {
        public sealed class ErrorPosition
        {
            public int Position { get; init; }
            public int TokenLength { get; init; }
        }

        // Syntax error: Command '.show schem' could not be parsed: at token: 'schem' [line:position=1:6]. Parser error: A recognition error occurred.
        // Kusto.DataNode.Csl.CslSemanticError: Failed to resolve entity ["KustoLogs"]
        private static Regex s_syntaxErrorPositionRegex1 = new Regex(@"Syntax error(?!.*Syntax error):\s*'(?<Token>.*?)'.+\[line:position=(?<Line>\d+):(?<Position>\d+)\]", RegexOptions.Compiled);
        private static Regex s_syntaxErrorPositionRegex2 = new Regex(@"(at token: '(?<Token>.*?)' )?\[line:position=(?<Line>\d+):(?<Position>\d+)\]", RegexOptions.Compiled);
        private static Regex s_syntaxErrorPositionRegex3 = new Regex(@"\[line:position=(?<Line>\d+):(?<Position>\d+)\]", RegexOptions.Compiled);
        private static Regex[] s_syntaxErrorPositionRegexes = new[]
        {
            s_syntaxErrorPositionRegex1,
            s_syntaxErrorPositionRegex2,
            s_syntaxErrorPositionRegex3,
        };
        private static Regex s_semanticErrorPositionRegex = new Regex(@"Failed to resolve entity '(?<Token>.+?)'", RegexOptions.Compiled);

        public static bool TryResolveErrorPositions(string command, KustoErrorDetails errorDetails, [NotNullWhen(true)] out IReadOnlyList<ErrorPosition>? errorPositions)
        {
            errorPositions = null;

            if (string.IsNullOrEmpty(command) || errorDetails == null)
            {
                return false;
            }

            if (errorDetails.CharacterOffset != null || errorDetails.LineOffset != null)
            {
                errorPositions = [CreateErrorPosition(command, errorDetails.CharacterOffset ?? 0, errorDetails.LineOffset ?? 0, errorDetails.Token)];
                return true;
            }

            return TryResolveErrorPosition(command, errorDetails.FullMessage, out errorPositions);
        }

        public static bool TryResolveErrorPosition(string command, string errorString, [NotNullWhen(true)] out IReadOnlyList<ErrorPosition>? errorPositions)
        {
            if (string.IsNullOrEmpty(command) || string.IsNullOrEmpty(errorString))
            {
                errorPositions = null;
                return false;
            }

            return TryResolveSyntaxErrorPosition(command, errorString, out errorPositions)
                || TryResolveSemanticErrorPosition(command, errorString, out errorPositions);
        }

        private static bool TryResolveSemanticErrorPosition(string command, string errorString, [NotNullWhen(true)] out IReadOnlyList<ErrorPosition>? errorPositions)
        {
            errorPositions = null;

            var match = s_semanticErrorPositionRegex.Match(errorString);
            if (!match.Success)
            {
                return false;
            }

            string token = match.Groups["Token"].ToString();
            if (string.IsNullOrWhiteSpace(token))
            {
                return false;
            }

            var regexTokenString = Regex.Escape(@"\b" + token + @"\b");
            var regexTokenMatch = new Regex(regexTokenString);
            var matches = regexTokenMatch.Matches(command);
            if (matches.SafeFastNone())
            {
                return false;
            }

            List<ErrorPosition> positions = new List<ErrorPosition>();
            foreach (Match m in matches)
            {
                var ep =
                new ErrorPosition()
                {
                    Position = m.Index,
                    TokenLength = token.Length
                };
                positions.Add(ep);
            }

            errorPositions = positions;
            return true;
        }

        private static bool TryResolveSyntaxErrorPosition(string command, string errorString, [NotNullWhen(true)] out IReadOnlyList<ErrorPosition>? errorPositions)
        {
            errorPositions = null;

            Match? match = null;
            foreach (var regex in s_syntaxErrorPositionRegexes)
            {
                match = regex.Match(errorString);
                if (match.Success)
                {
                    break;
                }
            }

            if (match == null || !match.Success)
            {
                return false;
            }

            int pos = 0;
            int line = 0;

            if (!Int32.TryParse(match.Groups["Position"].ToString(), out pos))
            {
                return false;
            }

            // Try resolve line. If not found, assume line=1;
            Int32.TryParse(match.Groups["Line"].ToString(), out line);
            string token = match.Groups["Token"].ToString();

            errorPositions = [CreateErrorPosition(command, pos, line, token)];
            return true;
        }

        private static ErrorPosition CreateErrorPosition(
            string command,
            int characterOffset,
            int lineOffset,
            string? token)
        {
            int tokenLen = 1;
            if (!string.IsNullOrEmpty(token))
            {
                // If error happens on the last character of the command (e.g. unfinished command:
                //   KustoLogs | where Timestamp > ago(12) and (RootActivityId == "63d42d6d-9ead-4d6b-8f6a-9ab610895128"
                // ... --> correct the error poitner to point on the last character of the command
                if (characterOffset > command.Length - 1)
                {
                    tokenLen = 1;
                    characterOffset = command.Length - 1;
                }
                else
                {
                    tokenLen = token.Length;
                }
            }
            else
            {
                // If token is empty - and the error points of the last character of the command (unfinished command),
                // then - correct the error pointer to point on the last character of the command
                if (characterOffset > command.Length)
                {
                    characterOffset = command.Length;
                }
            }

            // Fix error position to according to 'line'
            int errorLineStartPosition = command.NthIndexOf('\n', lineOffset - 1);
            if (errorLineStartPosition < 0)
            {
                errorLineStartPosition = 0;
            }
            else
            {
                errorLineStartPosition++; // Move right after new line
            }

            return new ErrorPosition { Position = errorLineStartPosition + characterOffset, TokenLength = tokenLen };
        }
    }
}

public sealed class KustoErrorDetails
{
    public const string EmptyClientRequestId = "<empty>";

    /// <summary>
    /// Id of the client request that caused the error, if available. 
    /// This is used for correlating errors to specific requests in case of multiple concurrent requests. 
    /// It may be empty if the error is not associated with a specific request or if the id is not available. 
    /// </summary>
    public string? ClientRequestId { get; }

    public string ErrorType { get; }
    public string ErrorCode { get; }
    public string Message { get; }
    public string FullMessage { get; }
    public string? RecoveryAction { get; }
    public string? Token { get; }
    public int? LineOffset { get; }
    public int? CharacterOffset { get; }

    private KustoErrorDetails(
        string? clientRequestId,
        string errorType,
        string errorCode,
        string message,
        string fullMessage,
        string? recoveryAction,
        string? token = null,
        int? lineOffset = null,
        int? positionOffset = null)
    {
        this.ClientRequestId = clientRequestId ?? EmptyClientRequestId;
        this.ErrorType = errorType;
        this.ErrorCode = errorCode;
        this.Message = message;
        this.FullMessage = fullMessage;
        this.RecoveryAction = recoveryAction;
        this.Token = token;
        this.LineOffset = lineOffset;
        this.CharacterOffset = positionOffset;
    }

    public KustoErrorDetails WithLinePosition(int lineOffset, int positionOffset)
    {
        return new KustoErrorDetails(
            clientRequestId: this.ClientRequestId,
            errorType: this.ErrorType,
            errorCode: this.ErrorCode,
            message: this.Message,
            fullMessage: this.FullMessage,
            recoveryAction: this.RecoveryAction,
            token: this.Token,
            lineOffset: lineOffset,
            positionOffset: positionOffset);
    }

    public static KustoErrorDetails FromException(Exception error, string? clientRequestId = null)
    {
        var fullMessage = error.MessageEx();
        var errorType = error.GetType().Name;

        switch (error)
        {
            case KustoClientException err:
                return new KustoErrorDetails(
                    clientRequestId: err.ClientRequestId ?? clientRequestId,
                    errorType: errorType,
                    errorCode: String.Empty,
                    message: err.ErrorMessage ?? error.Message,
                    fullMessage: fullMessage,
                    recoveryAction: GetRecoveryAction(err.IsPermanent)
                    );

            case RelopSemanticException err:
                return new KustoErrorDetails(
                    clientRequestId: err.ClientRequestId ?? clientRequestId,
                    errorType: errorType,
                    errorCode: err.ErrorCode,
                    message: err.ErrorMessage ?? error.Message,
                    fullMessage: fullMessage,
                    recoveryAction: "Fix semantic errors by rewriting the query.");

            case SyntaxException err:
                return new KustoErrorDetails(
                    clientRequestId: err.ClientRequestId ?? clientRequestId,
                    errorType: errorType,
                    errorCode: err.ErrorCode,
                    message: err.Message,
                    fullMessage: fullMessage,
                    recoveryAction: "Fix syntax errors by rewriting the query.",
                    token: err.Token,
                    lineOffset: err.Line >= 0 ? err.Line : (int?)null,
                    positionOffset: err.CharacterPositionInLine >= 0 ? err.CharacterPositionInLine : (int?)null
                    );

            case KustoBadRequestException err:
                return new KustoErrorDetails(
                    clientRequestId: err.ClientRequestId ?? clientRequestId,
                    errorType: errorType,
                    errorCode: err.ErrorCode,
                    message: err.ErrorMessage ?? error.Message,
                    fullMessage: fullMessage,
                    recoveryAction: GetRecoveryAction(err.IsPermanent));

            case KustoRequestException err:
                var message = err.ErrorMessage ?? error.Message;

                if (!string.IsNullOrWhiteSpace(message))
                {
                    try
                    {
                        var asJson = Newtonsoft.Json.JsonConvert.DeserializeObject(message) as Newtonsoft.Json.Linq.JObject;
                        if (asJson != null)
                        {
                            message = asJson["error"]!["@message"]!.ToString();
                        }
                    }
                    catch { }
                }

                return new KustoErrorDetails(
                    clientRequestId: err.ClientRequestId ?? clientRequestId,
                    errorType: errorType,
                    errorCode: err.ErrorCode,
                    message: message,
                    fullMessage: fullMessage,
                    recoveryAction: GetRecoveryAction(err.IsPermanent));

            case KustoServiceException err:
                return new KustoErrorDetails(
                    clientRequestId: err.ClientRequestId ?? clientRequestId,
                    errorType: errorType,
                    errorCode: err.ErrorCode,
                    message: err.ErrorMessage ?? error.Message,
                    fullMessage: fullMessage,
                    recoveryAction: GetRecoveryAction(err.IsPermanent));

#if false
                case System.ServiceModel.FaultException<PlatformExceptionDetail> err:
                    return new KustoErrorDetails(
                        clientRequestId: err.Detail.CreationContext.ActivityContext?.ClientRequestId ?? clientRequestId,
                        errorType: errorType,
                        erroCode: String.Empty,
                        message: err.Detail.Message,
                        fullMessage: fullMessage,
                        recoveryAction: GetRecoveryAction(err.Detail.IsPermanent));
#endif
            default:
                break;
        }

        var socketTimedOut = false;
        var connectFailure = false;
        foreach (var ex in error.FlattenInnerExceptions())
        {
            if (ex is System.Net.Sockets.SocketException sex)
            {
                socketTimedOut = sex.SocketErrorCode == System.Net.Sockets.SocketError.TimedOut;
            }
            if (ex is System.Net.WebException wex)
            {
                connectFailure = wex.Status == System.Net.WebExceptionStatus.ConnectFailure;
            }
        }

        // In .NET Framework, we have: System.Net.Http.HttpRequestException --> System.Net.WebException --> System.Net.Sockets.SocketException.
        // The WebException is omitted in .NET Core or later, so we don't look for it.
        connectFailure = true;

        if (connectFailure && socketTimedOut)
        {
            // We failed to connect and the failure is because the remote endpoint is not responding, even not with NAK.
            // This means that the hostname does resolve to an IP address that nobody is listening or allows us to connect.
            return new KustoErrorDetails(
                clientRequestId: clientRequestId,
                errorType: errorType,
                errorCode: "FailedToConnect_TimedOut",
                message: error.MessageEx(),
                fullMessage: error.MessageEx(forceNesting: true), // Nesting allows the user to see the IP address we're trying to connect to
                recoveryAction: "Dial any relevant VPN if needed and retry."
                );
        }

        return new KustoErrorDetails(
            clientRequestId: clientRequestId,
            errorType: errorType,
            errorCode: String.Empty,
            message: error.Message,
            fullMessage: fullMessage,
            recoveryAction: null);
    }

    private static string GetRecoveryAction(bool isPermanent)
    {
        return isPermanent ?
            "Error is permanent, retrying will not help" :
            "Error may be transient, retrying may result in successful request";
    }
}

