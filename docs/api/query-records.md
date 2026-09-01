---
id: query-records
title: Query Records
sidebar_label: Query Records
sidebar_position: 4
---

# Query Records

Reads rows out of a table. This is the endpoint to use for pulling data into your integration -- answering a lookup, syncing a list, or polling for records that changed since the last run.

It is a `POST` even though it only reads. The filter is a JSON document -- a nested `and`/`or` tree with typed values -- and that does not survive a query string without inventing an encoding for nesting, types and `null`. The request body carries the filter shape as-is. Nothing is written.

## Endpoint

```
POST /integration/tables/:table/query
```

## Authentication

Requires a valid API token in the `Authorization` header.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `table` | string | Yes | The internal table name (from [Get Tables](./get-tables)) |

## Request Body

All fields are optional. An empty body `{}` returns the first 50 rows.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `filters` | object | none | A filter group -- see below |
| `select` | string[] | all columns | Column names to return |
| `sort` | object[] | database order | `[{ "field": "fname", "direction": "desc" }]` -- `direction` defaults to `asc` |
| `page` | integer | `1` | Page number, starting at 1 |
| `per_page` | integer | `50` | Rows per page, maximum `200` |

Any other top-level key is rejected with `400`. A misspelled `perPage` gets told, rather than silently returning 50 rows.

### Filter groups

A **group** is `{ "and": [...] }` or `{ "or": [...] }`. Each array item is either a condition or another group, so groups nest:

```json
{
  "filters": {
    "and": [
      { "field": "fstatus", "op": "eq", "value": "open" },
      { "or": [
        { "field": "fcity", "op": "eq", "value": "חיפה" },
        { "field": "fcity", "op": "eq", "value": "תל אביב" }
      ] }
    ]
  }
}
```

### Conditions

A **condition** is `{ "field": <column>, "op": <operator>, "value": <value> }`.

| Operator | `value` shape | Meaning |
|----------|---------------|---------|
| `eq` / `neq` | scalar | Equal / not equal |
| `gt` / `gte` | scalar | Greater than / greater than or equal |
| `lt` / `lte` | scalar | Less than / less than or equal |
| `like` / `not_like` | string | SQL `LIKE` -- use `%` as the wildcard |
| `in` / `not_in` | array of scalars (1--200) | One of / none of |
| `between` | array of exactly 2 scalars | Inclusive range |
| `is_null` / `is_not_null` | omit `value` | Column is / is not `NULL` |

A scalar is a string, number, boolean, or `null`. An object is rejected -- there is no path for handing SQL to this endpoint.

### Limits

| Limit | Value |
|-------|-------|
| Nesting depth | 5 groups |
| Conditions per request | 50 |
| Values in one `in` / `not_in` | 200 |
| Rows per page | 200 |

## Response

| Field | Type | Description |
|-------|------|-------------|
| `table` | string | The table that was read |
| `page` | number | The page returned |
| `per_page` | number | Rows per page in effect |
| `total` | number | Total rows matching the filters, across all pages |
| `records` | array | The rows |

## Examples

### Request

```bash
curl -X POST "https://api.ozari.co.il/integration/tables/tcust/query" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": { "and": [ { "field": "fcity", "op": "eq", "value": "חיפה" } ] },
    "select": ["fid", "fname", "fphone"],
    "sort": [{ "field": "fname" }],
    "per_page": 2
  }'
```

### Response

```json
{
  "success": true,
  "table": "tcust",
  "page": 1,
  "per_page": 2,
  "total": 17,
  "records": [
    { "fid": 12, "fname": "אבי כהן", "fphone": "050-1234567" },
    { "fid": 45, "fname": "בני לוי", "fphone": "052-7654321" }
  ]
}
```

### One record by primary key

```json
{ "filters": { "and": [ { "field": "fid", "op": "eq", "value": 12 } ] } }
```

### Polling for what changed

```json
{
  "filters": { "and": [ { "field": "flastmodify", "op": "gt", "value": "2026-09-01 08:00:00" } ] },
  "sort": [{ "field": "flastmodify" }]
}
```

## Error Responses

Every rejection names the path that caused it, so a wrong request is fixable without guessing.

### Invalid table or field name

Table and column names must match `^[A-Za-z0-9_]+$`:

```json
{
  "success": false,
  "error": "Invalid field name in filters.and[0]: fname)--"
}
```
**Status:** `400 Bad Request`

### Unsupported operator

```json
{
  "success": false,
  "error": "Unsupported operator in filters.and[0]: regexp"
}
```
**Status:** `400 Bad Request`

### Wrong value shape

```json
{
  "success": false,
  "error": "filters.and[0]: \"between\" needs a \"value\" array of exactly 2 scalars"
}
```
**Status:** `400 Bad Request`

### Table not readable

A small set of tables hold credential material (user passwords, password-reset codes, session and impersonation records) and are never readable through this API, whatever the token:

```json
{
  "success": false,
  "error": "This table is not readable through the integration API"
}
```
**Status:** `403 Forbidden`

### Table not found

```json
{
  "success": false,
  "error": "Table not found"
}
```
**Status:** `404 Not Found`

## Notes

- Results are scoped to the tenant the API token belongs to. There is no way to read another tenant's data.
- `per_page` is capped at 200. Page through larger result sets with `page`, using `total` to know when you are done.
- For a stable page-through, pass a `sort` -- without one, row order is whatever the database returns.
- Use [Get Fields](./get-fields) to discover which column names to filter, select, and sort on.
