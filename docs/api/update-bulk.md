---
id: update-bulk
title: Update Bulk Records
sidebar_label: Update Bulk Records
sidebar_position: 6
---

# Update Bulk Records

Updates all records that match the given filter criteria. Unlike [Update Single Record](./update-single), this endpoint does not check how many records match -- it applies the update to every matching row.

:::caution
Use this endpoint with care. Broad filters can update many records at once. Always test your filters first with a read operation to verify they match the expected records.
:::

## Endpoint

```
PATCH /integration/tables/:table/records/bulk
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
| `filters` | object | Yes | Key-value pairs used to match records. Must contain at least one filter. All filters are combined with AND logic using equality matching. |
| `fields` | object | Yes | Key-value pairs of field names and new values to set. Must contain at least one field. |

:::warning
You cannot update primary key columns (such as `fid`). The API will reject the request if you include them in `fields`.
:::

## Response

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` on success |
| `table` | string | The table that was updated |
| `updated` | number | Number of rows actually modified |

## Examples

### Update all customers in a city

#### Request

```bash
curl -X PATCH "https://api.ozari.co.il/integration/tables/tcust/records/bulk" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "fcity": "חיפה"
    },
    "fields": {
      "fnotes": "אזור צפון - עדכון מרץ 2026"
    }
  }'
```

#### Response

```json
{
  "success": true,
  "table": "tcust",
  "updated": 23
}
```

### Update all tasks with a specific status

#### Request

```bash
curl -X PATCH "https://api.ozari.co.il/integration/tables/tworkx/records/bulk" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "fstatus": "ממתין"
    },
    "fields": {
      "fstatus": "בטיפול"
    }
  }'
```

#### Response

```json
{
  "success": true,
  "table": "tworkx",
  "updated": 7
}
```

## Error Responses

### Missing filters or fields

```json
{
  "success": false,
  "error": "\"filters\" is required"
}
```
**Status:** `400 Bad Request`

### Attempting to update primary key

```json
{
  "success": false,
  "error": "Cannot set primary key column: fid"
}
```
**Status:** `400 Bad Request`

### Invalid field name

```json
{
  "success": false,
  "error": "Invalid field name: bad-name"
}
```
**Status:** `400 Bad Request`

## Comparison: Single vs. Bulk Update

| Feature | Single (`/records/single`) | Bulk (`/records/bulk`) |
|---------|---------------------------|------------------------|
| Matches 0 records | Returns `404` error | Silently updates 0 |
| Matches 1 record | Updates it | Updates it |
| Matches N records | Returns `409` error | Updates all N |
| Response includes `matched` | Yes | No |

## Notes

- The `updated` count reflects the number of rows the database engine actually modified. If the new values are identical to the existing values, those rows may not be counted.
- All filters use equality matching (`=`), combined with AND logic.
- There is no limit on the number of records that can be updated in a single bulk request.
