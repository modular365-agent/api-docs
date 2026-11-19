---
id: insert-record
title: Insert Record
sidebar_label: Insert Record
sidebar_position: 5
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
| `details` | object | No | Detail rows to insert with the record, in the same transaction. Keys are detail table names registered for this table; values are arrays of `{ "fields": { ... } }`. See [Detail rows](#detail-rows). |

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
| `detailsInserted` | object | Present only when `details` has at least one key (absent for `details` omitted, `null` or `{}`): rows inserted per detail table. A table sent with an empty array is listed with `0`. |

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

### Insert a quote with line items (details)

Column names are specific to each tenant. This example uses the `tq` table and its registered detail table `tq_details`. Use [Get Fields](./get-fields) for the header columns, and read one existing row of the detail table with [Query Records](./query-records) to see its columns.

#### Request

```bash
curl -X POST "https://api.ozari.co.il/integration/tables/tq/records" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
  "fields": { "table2_tcust_1": "1001", "note": "הזמנה 7781" },
  "details": {
    "tq_details": [
      { "fields": { "catnum": "A-100", "qty": 2, "price": 49.9, "subtotal": 99.8 } },
      { "fields": { "catnum": "B-200", "qty": 1, "price": 120, "subtotal": 120 } }
    ]
  }
}'
```

#### Response

```json
{
  "success": true,
  "table": "tq",
  "insertedId": 1234,
  "fields": { "table2_tcust_1": "1001", "note": "הזמנה 7781" },
  "detailsInserted": { "tq_details": 2 }
}
```

## Detail rows

- **Registration.** The detail table must already be registered for this table, even when you send an empty array. You can read the registered tables with [Query Records](./query-records) on `labels_tables_details`. Registering a detail table is a tenant-administrator configuration step: **do not write `labels_tables_details` through the API.** It changes the detail tabs every user sees in the product.
- **Server-set columns.** `id_register` (the link to the new record) and the detail primary key are set by the server. Do not send them.
- **Column names** must match the detail table's columns exactly, including letter case.
- **Same fields on every row.** Every row of one detail table must carry the same field names. Send `null` for a blank value.
- **Scalar values only** (string, finite number, boolean or `null`; numbers such as `1e999` that overflow are rejected). An empty string `""` is stored as an empty string, not converted to `null`, and is rejected on numeric or date columns (`400` with code `invalid_value`).
- **No server-side calculations or defaults.** Send computed columns yourself (for example `subtotal`). Header totals that database triggers derive from the detail rows depend on the columns you send.
- **Write order.** Detail tables are written sorted by table name (the database's ascending sort on the registered `details_table`, so its collation decides the order), not in the order of your JSON keys. The tenant's configured display order (`forder`) is not used for write order.
- **Limits.** At most 500 detail rows in total across all detail tables, and a 100 kB request body. With wide rows the body limit can be reached first.
- **All or nothing.** The record and all its detail rows are written in one transaction. If anything fails, nothing is saved.
- **Detail row ids are not returned.** To get them, read the rows back with [Query Records](./query-records) filtered on `id_register` equal to `insertedId`. If the rows are not visible yet, repeat the query, never the insert.
- **Fresh configuration.** A detail table or column added moments ago may briefly be refused with a `400`. Nothing was written, so repeating the request is safe.
- **Retries are not safe.** There is no idempotency key in this version. Any `5xx` response or client timeout on an insert is an **unknown outcome**: the record may have been created. Before retrying, read back by a natural key you control (for example a reference you stored in `note`) with [Query Records](./query-records). A miss right after the failure is not conclusive, because reads may lag; wait a few seconds and check again.

## Error Responses

Errors about `details` carry a machine-readable `code`, and, where relevant, `detailTable`, `row` (0-based) and `field`. Branch on `code`, not on the `error` text.

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

### Errors about `details`

All of these are `400 Bad Request` unless stated otherwise, and nothing was written.

#### `invalid_details`

`details` is not an object (for example an array, a string or a number).

```json
{ "success": false, "error": "\"details\" must be an object keyed by detail table name", "code": "invalid_details" }
```
**Status:** `400 Bad Request`

#### `invalid_detail_table`

A key of `details` is not a valid table name (`^[A-Za-z0-9_]+$`).

```json
{ "success": false, "error": "Invalid detail table name: tq-details", "code": "invalid_detail_table" }
```
**Status:** `400 Bad Request`

#### `duplicate_detail_table`

Two keys of `details` differ only by letter case.

```json
{ "success": false, "error": "Detail table given twice: tq_details", "code": "duplicate_detail_table", "detailTable": "tq_details" }
```
**Status:** `400 Bad Request`

#### `invalid_detail_rows`

The value of a detail table is not an array.

```json
{ "success": false, "error": "Rows of tq_details must be an array", "code": "invalid_detail_rows", "detailTable": "tq_details" }
```
**Status:** `400 Bad Request`

#### `too_many_detail_rows`

More than 500 detail rows in total.

```json
{ "success": false, "error": "At most 500 detail rows in total", "code": "too_many_detail_rows" }
```
**Status:** `400 Bad Request`

#### `invalid_detail_row`

A row is not exactly `{ "fields": { ... } }` with at least one field.

```json
{ "success": false, "error": "Each detail row must be exactly { \"fields\": { ... } } with at least one field", "code": "invalid_detail_row", "detailTable": "tq_details", "row": 1 }
```
**Status:** `400 Bad Request`

#### `invalid_detail_field`

A field name in a detail row is not a valid column name.

```json
{ "success": false, "error": "Invalid detail field name: cat-num", "code": "invalid_detail_field", "detailTable": "tq_details", "row": 0, "field": "cat-num" }
```
**Status:** `400 Bad Request`

#### `detail_fk_not_settable`

A detail row sends `id_register`, which the server sets.

```json
{ "success": false, "error": "id_register is set by the server", "code": "detail_fk_not_settable", "detailTable": "tq_details", "row": 0 }
```
**Status:** `400 Bad Request`

#### `invalid_detail_value`

A value is not a string, finite number, boolean or `null`, or it is the reserved text `$insert_id`.

```json
{ "success": false, "error": "Detail field qty must be a string, finite number, boolean or null", "code": "invalid_detail_value", "detailTable": "tq_details", "row": 0, "field": "qty" }
```
**Status:** `400 Bad Request`

#### `detail_row_field_mismatch`

Rows of one detail table do not carry the same field names. Send `null` for a blank value.

```json
{ "success": false, "error": "All rows of tq_details must carry the same fields (send null for a blank); differs on qty", "code": "detail_row_field_mismatch", "detailTable": "tq_details", "row": 1, "field": "qty" }
```
**Status:** `400 Bad Request`

#### `unregistered_detail_table`

The detail table is not registered for this table. Ask the tenant administrator; do not register it through the API.

```json
{ "success": false, "error": "Detail table is not registered for this table (a tenant-administrator setting; do not register it through the API)", "code": "unregistered_detail_table", "detailTable": "tx_details" }
```
**Status:** `400 Bad Request`

#### `parent_not_linkable` and `detail_table_not_linkable`

The table, or the detail table, has no usable link between a record and its detail rows.

```json
{ "success": false, "error": "Detail table tq_details cannot be linked to the record", "code": "detail_table_not_linkable", "detailTable": "tq_details" }
```
**Status:** `400 Bad Request`

#### `unknown_detail_field`

A field is not a column of the detail table. Column names are case-sensitive.

```json
{ "success": false, "error": "Unknown column catnumber on tq_details", "code": "unknown_detail_field", "detailTable": "tq_details", "row": 0, "field": "catnumber" }
```
**Status:** `400 Bad Request`

#### `detail_pk_field`

A field is the primary key of the detail table, which the server sets.

```json
{ "success": false, "error": "Cannot set primary key column id on tq_details", "code": "detail_pk_field", "detailTable": "tq_details", "row": 0, "field": "id" }
```
**Status:** `400 Bad Request`

### Protected table

A table, or a setting, that cannot be written through the API. The body depends on where it was found.

When the protected table is the table in the URL, or the protected setting is in `fields`, the body has `success` and `error` only:

```json
{ "success": false, "error": "<description of the protected table or setting>" }
```

When a detail table in `details` is protected, the body also carries `code` and `detailTable`:

```json
{ "success": false, "error": "<description of the protected table or setting>", "code": "protected_table", "detailTable": "btn_function" }
```
**Status:** `403 Forbidden` (both)

### Database rejected a value

When the request sends at least one detail row (a request with only empty arrays behaves like one without `details`), a value the database refuses returns one of these codes: `value_too_long`, `out_of_range`, `invalid_value`, `missing_value`, `invalid_reference`, `duplicate_value`, `constraint_violation`. `field` names the column (as `column`, or `table.column` for a detail table) only when you sent it. Nothing was saved.

```json
{ "success": false, "error": "Value for tq_details.catnum is too long. Nothing was saved; fix the value and save again.", "code": "value_too_long", "field": "tq_details.catnum" }
```
**Status:** `400 Bad Request`

### Request body too large

A body over 100 kB is refused. It currently returns a problem+json body (not `success` and `error`) with status `500`. This can never succeed on retry: split the request or reduce its size.

**Status:** `500 Internal Server Error`

### Unknown outcome (`5xx` or timeout)

Any other `5xx`, or a client timeout, on an insert is an unknown outcome: the record may have been created. See [Detail rows](#detail-rows) for how to check before retrying.

## Notes

- The `fields` object must contain at least one key-value pair.
- All field names are validated against `^[A-Za-z0-9_]+$`. Names with spaces, dashes, or special characters are rejected.
- Use [Get Fields](./get-fields) to discover valid field names for a given table.
- The `insertedId` corresponds to the auto-incremented primary key of the new row.
