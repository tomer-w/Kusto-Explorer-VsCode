// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

namespace Kusto.Lsp;

public static class TypeExtensions
{
    public static bool CanBeNull(this Type type) =>
        !type.IsValueType
        || (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>));
}
