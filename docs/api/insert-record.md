---
id: insert-record
title: Insert Record
sidebar_label: Insert Record
sidebar_position: 4
---

# Insert Record

Creates a new record in the specified table. The record ID (`fid`) is automatically generated and cannot be set manually.

## Endpoint

```
POST /integration/tables/:table/records
```

## Authentication

Requires a valid API token in the `Authorization` header.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `table` | string | Yes | The internal table name (from [Get Tables](./get-tables)) |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | object | Yes | Key-value pairs where keys are field names and values are the data to insert. Must contain at least one field. |

Field names must match the pattern `^[A-Za-z0-9_]+$` (letters, numbers, and underscores only).

:::warning
You cannot set primary key columns (such as `fid`). The API will reject the request if you attempt to include them.
:::

## Response

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` on success |
| `table` | string | The table the record was inserted into |
| `insertedId` | number \| null | The auto-generated ID of the new record |
| `fields` | object | The field values that were inserted |

## Examples

### Insert a customer record

#### Request

```bash
curl -X POST "https://api.ozari.co.il/integration/tables/tcust/records" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "fname": "דוד כהן",
      "fphone": "050-1234567",
      "femail": "david@example.co.il",
      "faddress": "רחוב הרצל 42",
      "fcity": "תל אביב",
      "fcontact": "דוד",
      "fnotes": "לקוח VIP"
    }
  }'
```

#### Response

```json
{
  "success": true,
  "table": "tcust",
  "insertedId": 1547,
  "fields": {
    "fname": "דוד כהן",
    "fphone": "050-1234567",
    "femail": "david@example.co.il",
    "faddress": "רחוב הרצל 42",
    "fcity": "תל אביב",
    "fcontact": "דוד",
    "fnotes": "לקוח VIP"
  }
}
```

### Insert a work order

#### Request

```bash
curl -X POST "https://api.ozari.co.il/integration/tables/twork/records" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "fname": "תיקון מזגן - משרד ראשי",
      "fda": "2026-03-26",
      "fstatus": "חדש"
    }
  }'
```

#### Response

```json
{
  "success": true,
  "table": "twork",
  "insertedId": 3892,
  "fields": {
    "fname": "תיקון מזגן - משרד ראשי",
    "fda": "2026-03-26",
    "fstatus": "חדש"
  }
}
```

## Error Responses

### Missing fields

```json
{
  "success": false,
  "error": "\"fields\" is required"
}
```
**Status:** `400 Bad Request`

### Invalid field name

```json
{
  "success": false,
  "error": "Invalid field name: my-field"
}
```
**Status:** `400 Bad Request`

### Attempting to set primary key

```json
{
  "success": false,
  "error": "Cannot set primary key column: fid"
}
```
**Status:** `400 Bad Request`

### Invalid table name

```json
{
  "success": false,
  "error": "Invalid table name"
}
```
**Status:** `400 Bad Request`

## Notes

- The `fields` object must contain at least one key-value pair.
- All field names are validated against `^[A-Za-z0-9_]+$`. Names with spaces, dashes, or special characters are rejected.
- Use [Get Fields](./get-fields) to discover valid field names for a given table.
- The `insertedId` corresponds to the auto-incremented primary key of the new row.
