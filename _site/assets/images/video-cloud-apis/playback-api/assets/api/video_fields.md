# Video fields resource

This resource provides access to the account-level custom field definition.  This is currently a read-only resource.  To view or edit the *value* of a custom field, see [the video resource](video.md).

The standard_fields array will only be populated when standard fields have a description or are required.

## Path
[$BASE_URL](README.md)/accounts/1234/video_fields

## Usage
### GET
Returns video field data for the account.

#### Fields
| Field | Type | Description |
| --- | --- | --- |
| max_custom_fields | Number | Number of custom fields a publisher can create on the account |
| custom_fields | Array | List of custom field objects on the account |
| standard_fields | Array | List of fields that are required or have a description. Standard fields that have neither will not appear in this array. |

**For each custom field:**

| Field | Type | Description |
| --- | --- | --- |
| id | String | Internal name of the field |
| description | String |  |
| display_name | String |  |
| type | String | one of 'enum' or 'string' (which translates to 'List' or 'Text' in the UI) |
| enum_values | Array | Array of String values valid for the custom field; only present when type = 'enum' |
| required | Boolean |

**For each standard field:**

| Field | Type | Description |
| --- | --- | --- |
| id | String | Name of the field |
| description | String | Can be null if this was not set by the user |
| required | Boolean |

#### Options
None - no sort, paging, or query

### POST
Not yet supported

### PATCH
Not yet supported

### DELETE
Not yet supported
