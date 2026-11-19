---
id: errors
title: Error Handling
sidebar_label: Error Handling
sidebar_position: 8
---

# Error Handling

The Modular 365 Integration API uses standard HTTP status codes to indicate the success or failure of a request. All error responses follow a consistent JSON format.

## Error Response Format

```json
{
  "success": false,
  "error": "Human-readable error description"
}
```

Some error responses include additional fields for debugging:

```json
{
  "success": false,
  "error": "No records match the given filters",
  "matched": 0
}
```

Insert errors may also carry `code` (machine-readable), `detailTable`, `row` (0-based) and `field`. Branch on `code`, not on the `error` text. See [Insert Record](./insert-record#error-responses).

A few responses use a problem+json body (`type`, `title`, `status`, `detail`) instead of `success` and `error`: a request body over 100 kB (`500`), and a `403` with `detail` `table_denied` for internal tables. Handle both shapes.

## HTTP Status Codes

### Success Codes

| Code | Meaning | When |
|------|---------|------|
| `200 OK` | Request succeeded | GET requests, successful updates |
| `201 Created` | Resource created | Successful record insertion |

### Client Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `400 Bad Request` | Invalid request | Missing required fields, invalid field names, invalid table name, attempting to set primary key, invalid detail rows, a detail table not registered for the record's table (registering detail tables is a tenant-administrator setting, do not do it through the API), a database value rejected |
| `401 Unauthorized` | Authentication missing | No `Authorization` header or malformed header |
| `403 Forbidden` | Authentication failed | Invalid or expired API token |
| `403 Forbidden` | Table not readable | The table holds credential material and is never exposed by the Integration API (see [Query Records](./query-records)) |
| `403 Forbidden` | Protected table | The table or setting cannot be written through the API. The body has `success` and `error`; when the protected table is a detail table, it also has `code` `protected_table` and `detailTable` (see [Insert Record](./insert-record#protected-table)) |
| `404 Not Found` | Resource not found | Table does not exist, or no records match filters (single update) |
| `409 Conflict` | Conflict | Multiple records match filters on single-update endpoint |

### Server Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `500 Internal Server Error` | Server error | Database connection issues, unexpected exceptions, a request body larger than 100 kB (returns a problem+json body, not `success` and `error`) |

## Common Error Scenarios

### Authentication Errors

**Missing Authorization header:**
```json
// 401 Unauthorized
{
  "success": false,
  "error": "Missing or invalid Authorization header"
}
```

**Invalid token:**
```json
// 403 Forbidden
{
  "success": false,
  "error": "Invalid token"
}
```

### Validation Errors

**Invalid table name** (contains special characters):
```json
// 400 Bad Request
{
  "success": false,
  "error": "Invalid table name"
}
```

**Invalid field name:**
```json
// 400 Bad Request
{
  "success": false,
  "error": "Invalid field name: my-field"
}
```

**Missing required body fields:**
```json
// 400 Bad Request
{
  "success": false,
  "error": "\"fields\" is required"
}
```

**Attempting to set a primary key column:**
```json
// 400 Bad Request
{
  "success": false,
  "error": "Cannot set primary key column: fid"
}
```

### Record Matching Errors (Single Update)

**No records match:**
```json
// 404 Not Found
{
  "success": false,
  "error": "No records match the given filters",
  "matched": 0
}
```

**Multiple records match:**
```json
// 409 Conflict
{
  "success": false,
  "error": "Multiple records match the given filters. Use /records/bulk for multi-update.",
  "matched": 5
}
```

### Not Found Errors

**Table does not exist:**
```json
// 404 Not Found
{
  "success": false,
  "error": "Table not found"
}
```

## Best Practices

1. **Always check `success`** -- Even on `200` responses, verify that `success` is `true` before processing the data.

2. **Handle `409` gracefully** -- If a single update returns a conflict, consider whether your filters need to be more specific or whether a bulk update is appropriate.

3. **Validate field names beforehand** -- Use the [Get Fields](./get-fields) endpoint to discover valid field names before attempting inserts or updates.

4. **Log error responses** -- Capture the full error response body for debugging, not just the HTTP status code.

5. **Retry `500` only when it is safe** -- Reads and updates can be retried with backoff. `POST .../records` is not idempotent (there is no idempotency key in this version): any `5xx` or timeout on an insert is an unknown outcome, because the record may have been created. First check by a natural key ([Query Records](./query-records)) whether it exists. A miss right after the failure is not conclusive: wait a few seconds and check again. Never retry a body-too-large `500`.

## Field Name Rules

All field and table names must match the following pattern:

```
^[A-Za-z0-9_]+$
```

This means only:
- Uppercase letters (`A-Z`)
- Lowercase letters (`a-z`)
- Numbers (`0-9`)
- Underscores (`_`)

Names containing spaces, hyphens, dots, or any other characters will be rejected with a `400` error.
