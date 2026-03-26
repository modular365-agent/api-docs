---
id: get-tables
title: Get Tables
sidebar_label: Get Tables
sidebar_position: 2
---

# Get Tables

Returns the list of available tables in your tenant database along with their localized labels. Use this endpoint to discover which tables you can query, insert into, or update.

## Endpoint

```
GET /integration/tables
```

## Authentication

Requires a valid API token in the `Authorization` header.

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `lang` | string | No | `"he"` | Language code for label localization. Use a code returned by [Get Languages](./get-languages). |

## Response

Returns an array of table objects:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | The internal table name (used in other API calls) |
| `label` | string | The localized display name for this table |

## Examples

### Request (Hebrew labels)

```bash
curl -X GET "https://api.ozari.co.il/integration/tables?lang=he" \
  -H "Authorization: Bearer your-api-token-here"
```

### Response

```json
{
  "success": true,
  "tables": [
    { "name": "tcust", "label": "לקוחות" },
    { "name": "twork", "label": "הזמנות עבודה" },
    { "name": "tworkx", "label": "משימות" },
    { "name": "tserial", "label": "מכשירים" },
    { "name": "parts", "label": "פריטים" },
    { "name": "temp", "label": "עובדים" }
  ]
}
```

### Request (English labels)

```bash
curl -X GET "https://api.ozari.co.il/integration/tables?lang=en" \
  -H "Authorization: Bearer your-api-token-here"
```

### Response

```json
{
  "success": true,
  "tables": [
    { "name": "tcust", "label": "Customers" },
    { "name": "twork", "label": "Work Orders" },
    { "name": "tworkx", "label": "Tasks" },
    { "name": "tserial", "label": "Devices" },
    { "name": "parts", "label": "Items" },
    { "name": "temp", "label": "Employees" }
  ]
}
```

## Notes

- Tables are deduplicated by name. If the internal `labels_tables` configuration has multiple rows for the same table, only the first occurrence is returned.
- The `name` value is what you pass as the `:table` parameter in other endpoints like [Get Fields](./get-fields), [Insert Record](./insert-record), and [Update Record](./update-single).
- If no localized label is found for the requested language, the internal table name is returned as the label.
