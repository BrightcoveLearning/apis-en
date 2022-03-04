# Video resource, accessed by video ID

## Path
[$BASE_URL](README.md)/accounts/1234/videos/5678
[$BASE_URL](README.md)/accounts/1234/videos/ref:myRefId

## Usage
### GET
Returns video data for the ID specified.

#### Fields
| Field | Type | Description |
| --- | --- | --- |
| account_id | String |
| complete | Boolean |
| created_at | Number, milliseconds from epoch |
| cue_points | Array of Maps |
| &nbsp;&nbsp; _cue_points.0.asset_id_ | _String_ |
| &nbsp;&nbsp; _cue_points.0.force_stop_ | _Boolean_ |
| &nbsp;&nbsp; _cue_points.0.metadata_ | _String; code point only_ |
| &nbsp;&nbsp; _cue_points.0.name_ | _String_ |
| &nbsp;&nbsp; _cue_points.0.time_ | _Float_ |
| &nbsp;&nbsp; _cue_points.0.type_ | _String_ |
| custom_fields | Map of field-value pairs (Strings) |
| description | String; takes the place of the old shortDescription |
| duration | Number, milliseconds |
| geo | Map of property-value pairs |
| &nbsp;&nbsp; _geo.countries_ | _Array of country code Strings_ |
| &nbsp;&nbsp; _geo.exclude_countries_ | _Boolean_ |
| &nbsp;&nbsp; _geo.restricted_ | _Boolean_ |
| id | String |
| keywords | Array of tags (Strings) |
| long_description | String |
| name | String |
| reference_id | String |
| schedule | Map of property-value pairs |
| &nbsp;&nbsp; _schedule.ends_at_ | _String in ISO-8601 date format_ |
| &nbsp;&nbsp; _schedule.starts_at_ | _String in ISO-8601 date format_ |
| sharing | Map of property-value pairs |
| &nbsp;&nbsp; _sharing.by_external_acct_ | _Boolean_ |
| &nbsp;&nbsp; _sharing.by_id_ | _String_ | pub ID that originated the share |
| &nbsp;&nbsp; _sharing.source_id_ | _String_ | video ID of the original video (sharer's copy) |
| &nbsp;&nbsp; _sharing.to_external_acct_ | _Boolean_ |
| &nbsp;&nbsp; _sharing.by_reference_ | _Boolean_ |
| state | String | ACTIVE, INACTIVE, PENDING, DELETED
| updated_at | Number, milliseconds from epoch |

#### Options
none

### POST
not supported

### PATCH
not supported
