---
id: update-single
title: Update Single Record
sidebar_label: Update Single Record
sidebar_position: 5
---

# Update Single Record

Updates exactly one record that matches the given filter criteria. This is a safe update endpoint -- it will return an error if the filters match zero records or more than one record.

If you need to update multiple records at once, use [Update Bulk Records](./update-bulk) instead.

## Endpoint

```
PATCH /integration/tables/:table/records/single
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
| `filters` | object | Yes | Key-value pairs used to find the record. Must contain at least one filter. All filters are combined with AND logic using equality matching. |
| `fields` | object | Yes | Key-value pairs of field names and new values to set. Must contain at least one field. |

:::warning
You cannot update primary key columns (such as `fid`). Use `fid` in `filters` to identify the record, not in `fields`.
:::

## Response

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` on success |
| `table` | string | The table that was updated |
| `matched` | number | Number of records that matched the filters (always `1` on success) |
| `updated` | number | Number of rows actually modified |
| `fields` | object | The field values that were applied |

## Examples

### Update a customer by ID

#### Request

```bash
curl -X PATCH "https://api.ozari.co.il/integration/tables/tcust/records/single" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "fid": "1547"
    },
    "fields": {
      "fphone": "052-9876543",
      "fcity": "ירושלים"
    }
  }'
```

#### Response

```json
{
  "success": true,
  "table": "tcust",
  "matched": 1,
  "updated": 1,
  "fields": {
    "fphone": "052-9876543",
    "fcity": "ירושלים"
  }
}
```

### Update a customer by email

#### Request

```bash
curl -X PATCH "https://api.ozari.co.il/integration/tables/tcust/records/single" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "femail": "david@example.co.il"
    },
    "fields": {
      "fnotes": "עדכון כתובת - לקוח עבר לירושלים"
    }
  }'
```

#### Response

```json
{
  "success": true,
  "table": "tcust",
  "matched": 1,
  "updated": 1,
  "fields": {
    "fnotes": "עדכון כתובת - לקוח עבר לירושלים"
  }
}
```

## Error Responses

### No matching records

When no records match the filter criteria:

```json
{
  "success": false,
  "error": "No records match the given filters",
  "matched": 0
}
```
**Status:** `404 Not Found`

### Multiple matching records

When more than one record matches the filter criteria:

```json
{
  "success": false,
  "error": "Multiple records match the given filters. Use /records/bulk for multi-update.",
  "matched": 5
}
```
**Status:** `409 Conflict`

### Attempting to update primary key

```json
{
  "success": false,
  "error": "Cannot set primary key column: fid"
}
```
**Status:** `400 Bad Request`

### Missing filters or fields

```json
{
  "success": false,
  "error": "\"filters\" is required"
}
```
**Status:** `400 Bad Request`

## Notes

- All filters use equality matching (`=`). There is no support for range queries, LIKE, or other operators through this endpoint.
- Multiple filters are combined with AND logic. For example, `{ "fname": "David", "fcity": "Tel Aviv" }` matches records where both conditions are true.
- The `matched` field in the error response tells you how many records would have been affected, which is useful for debugging filter criteria.
- If you need to update multiple records, use the [Update Bulk Records](./update-bulk) endpoint instead.
- The `updated` count may differ from `matched` if the new field values are identical to the existing values (no actual change occurs).
