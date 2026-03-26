---
id: errors
title: Error Handling
sidebar_label: Error Handling
sidebar_position: 7
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

## HTTP Status Codes

### Success Codes

| Code | Meaning | When |
|------|---------|------|
| `200 OK` | Request succeeded | GET requests, successful updates |
| `201 Created` | Resource created | Successful record insertion |

### Client Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `400 Bad Request` | Invalid request | Missing required fields, invalid field names, invalid table name, attempting to set primary key |
| `401 Unauthorized` | Authentication missing | No `Authorization` header or malformed header |
| `403 Forbidden` | Authentication failed | Invalid or expired API token |
| `404 Not Found` | Resource not found | Table does not exist, or no records match filters (single update) |
| `409 Conflict` | Conflict | Multiple records match filters on single-update endpoint |

### Server Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `500 Internal Server Error` | Server error | Database connection issues, unexpected exceptions |

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

5. **Retry on `500`** -- Server errors may be transient (database timeouts, temporary connectivity issues). Implement exponential backoff for retries.

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
