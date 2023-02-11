# Videos resource

## Path
[$BASE_URL](README.md)/accounts/1234/videos

## Usage
### GET
Returns a list of videos in that account.  Default limit (page size) is 20.

#### Fields
| Field | Type |
| --- | --- |
| id | String |
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
| state | String |
| tags | Array of tags (Strings) |
| updated_at | Number, milliseconds from epoch |

#### Options
| Options | Default |
| --- | --- |
| limit | 20 |
| offset | 0 |
| sort | updated_at desc |
| q | null |

For search options using the query parameter option (q), see the [catalog-api-docs wiki](https://bithub.brightcove.com/videocloud/catalog-api-docs/wiki/Catalog-API-v1alpha3-Videos#search-videos).  This document is for the front-facing Hapi applicationbut it is valid for the CMS API, as well, since both are backed by Roebuck.

### POST
Create a new video.

#### Fields
| Field | Type | Required | Comments |
| --- | --- | --- | --- |
| account_id | String | no | Must match account ID in the URL |
| name | String | yes | 
| reference_id | String | no |
| description | String | no | 
| long_description | String | no | 
| state | String | no | Defaults to "ACTIVE" if not set explicitly |
| tags | Array of Strings | no | briefly, but no longer, known as keywords |
| custom_fields | Map of field-value pairs | no |  |
| geo | Map of geo properties | no |  |
| &nbsp;&nbsp; _geo.countries_ | _Array of country code Strings_ | no | |
| &nbsp;&nbsp; _geo.exclude_countries_ | _Boolean_ | no | |
| &nbsp;&nbsp; _geo.restricted_ | _Boolean_ | no | |
| schedule | Map of scheduling properties | no |  |
| &nbsp;&nbsp; _schedule.ends_at_ | _String in ISO-8601 date format_ |
| &nbsp;&nbsp; _schedule.starts_at_ | _String in ISO-8601 date format_ |

Cue points are not yet supported for the POST action.

#### Example
```
curl -H "Content-Type:application/json" -d '{"name":"New Video", "description":"cool content", "state":"ACTIVE"}' https://BASE_URL/account/:account_id/videos
```

### PATCH
not supported
