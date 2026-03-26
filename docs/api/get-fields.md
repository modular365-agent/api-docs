---
id: get-fields
title: Get Fields
sidebar_label: Get Fields
sidebar_position: 3
---

# Get Fields

Returns the field definitions for a specific table. Each field includes its internal name, localized label, and display order. Use this endpoint to discover which fields are available for inserting or updating records.

## Endpoint

```
GET /integration/tables/:table/fields
```

## Authentication

Requires a valid API token in the `Authorization` header.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `table` | string | Yes | The internal table name (from [Get Tables](./get-tables)) |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `lang` | string | No | `"he"` | Language code for label localization |

## Response

Returns the table name and an array of field objects:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | The internal field/column name (use this in insert/update requests) |
| `label` | string | The localized display name for this field |
| `order` | number | The display order of the field in forms |

## Examples

### Request

```bash
curl -X GET "https://api.ozari.co.il/integration/tables/tcust/fields?lang=he" \
  -H "Authorization: Bearer your-api-token-here"
```

### Response

```json
{
  "success": true,
  "table": "tcust",
  "fields": [
    { "name": "fname", "label": "שם לקוח", "order": 1 },
    { "name": "fphone", "label": "טלפון", "order": 2 },
    { "name": "femail", "label": "דוא\"ל", "order": 3 },
    { "name": "faddress", "label": "כתובת", "order": 4 },
    { "name": "fcity", "label": "עיר", "order": 5 },
    { "name": "fcontact", "label": "איש קשר", "order": 6 },
    { "name": "fnotes", "label": "הערות", "order": 7 }
  ]
}
```

## Error Responses

### Invalid table name

If the table name contains invalid characters (only alphanumeric and underscores are allowed):

```json
{
  "success": false,
  "error": "Invalid table name"
}
```
**Status:** `400 Bad Request`

### Table not found

If the table does not exist in your tenant database:

```json
{
  "success": false,
  "error": "Table not found"
}
```
**Status:** `404 Not Found`

### Table exists but has no visible fields

If the table exists but has no fields marked as visible in form configuration:

```json
{
  "success": true,
  "table": "some_table",
  "fields": []
}
```
**Status:** `200 OK`

## Notes

- Only fields with `show_form = 'Y'` in the labels configuration are returned. Internal or hidden fields are excluded.
- Fields are sorted by their `_order` value (ascending).
- The `name` value is what you use as keys in the `fields` object when calling [Insert Record](./insert-record) or [Update Record](./update-single).
- Table names must match the pattern `^[A-Za-z0-9_]+$` -- only letters, numbers, and underscores.
