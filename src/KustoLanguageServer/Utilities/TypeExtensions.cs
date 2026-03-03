// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

namespace Kusto.Lsp;

public static class TypeExtensions
{
    extension (Type type)
    {
        public bool CanBeNull =>
            !type.IsValueType
            || (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>));
    }
}
