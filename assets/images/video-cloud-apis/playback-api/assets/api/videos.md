# Videos resource

## Path
[$BASE_URL](README.md)/accounts/1234/videos

## Usage
### GET
Returns a list of videos in that account.  Default limit (page size) is 20.

OAuth operator required: "video-cloud/video/read"

#### Fields
| Field | Type |
| --- | --- |
| id | String |
| account_id | String |
| complete | Boolean |
| created_at | Number, milliseconds from epoch |
| cue_points | Array of Maps |
| &nbsp;&nbsp; _cue_points.0.id_ | _String_ |
| &nbsp;&nbsp; _cue_points.0.force_stop_ | _Boolean_ |
| &nbsp;&nbsp; _cue_points.0.metadata_ | _String; code point only_ |
| &nbsp;&nbsp; _cue_points.0.name_ | _String_ |
| &nbsp;&nbsp; _cue_points.0.time_ | _Float_ |
| &nbsp;&nbsp; _cue_points.0.type_ | _String_ |
| custom_fields | Map of field-value pairs (Strings) |
| description | String; takes the place of the old shortDescription |
| duration | Number, milliseconds |
| economics | String | must be one of valid enum values |
| folder_id | String | Mongo-type ID of folder to which video belongs |
| images | Map of property-value pairs |
| &nbsp;&nbsp; _images.thumbnail_ | _Map_ |
| &nbsp;&nbsp;&nbsp;&nbsp; _images.thumbnail.id_ | _String_ |
| &nbsp;&nbsp;&nbsp;&nbsp; _images.thumbnail.src_ | _String URL_ |
| &nbsp;&nbsp; _images.poster_ | _Map_ |
| &nbsp;&nbsp;&nbsp;&nbsp; _images.poster.id_ | _String_ |
| &nbsp;&nbsp;&nbsp;&nbsp; _images.poster.src_ | _String URL_ |
| geo | Map of property-value pairs |
| &nbsp;&nbsp; _geo.countries_ | _Array of country code Strings_ |
| &nbsp;&nbsp; _geo.exclude_countries_ | _Boolean_ |
| &nbsp;&nbsp; _geo.restricted_ | _Boolean_ |
| link | Map of property-value pairs |
| &nbsp;&nbsp; _link.url_ | _String_ |
| &nbsp;&nbsp; _link.text_ | _String_ |
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
| text_tracks | Array of HTML5-style text tracks |
| &nbsp;&nbsp; _src_ / _String_ | address of the track file (URL) |
| &nbsp;&nbsp; _srclang_ / _String_ | language of the track, e.g. "en" |
| &nbsp;&nbsp; _label_ / _String_ | a user-readable title |
| &nbsp;&nbsp; _kind_ / _String_ | how the track is meant to be used: "subtitles", "captions", "descriptions", "chapters", "metadata" |
| &nbsp;&nbsp; _mime_type_ / _String_ | mime type of the track file, e.g. "text/vtt" |
| &nbsp;&nbsp; _default_ / _Boolean_ | indicates that the track should be enabled by default. Should only be true on one track. |
| updated_at | Number, milliseconds from epoch |

#### Options
| Options | Default |
| --- | --- |
| limit | 20 |
| offset | 0 |
| sort | updated_at desc |
| q | null |

For search options using the query parameter option (q), see the [catalog-api-docs wiki](https://bithub.brightcove.com/videocloud/catalog-api-docs/wiki/Catalog-API-v1alpha3-Videos#search-videos).  This document is for the front-facing Hapi applicationbut it is valid for the CMS API, as well, since both are backed by Roebuck.

In addition to the searchable fields listed in that document, the CMS API also supports ID search and data range searches by schedule.starts_at and schedule.ends_at.

To get only playable or unplayable videos, use 'q=playable:true|false'.

These fields are valid for sort:  name, reference_id, created_at, published_at, updated_at, schedule_starts_at, schedule_ends_at, state, plays_total, and plays_trailing_week.  The latter two are available because solr supports them, but the video object does not contain those fields, so you can't verify the sort in the results.

### POST
Create a new video.

OAuth operator required: "video-cloud/video/create"

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
| text_tracks | Array of HTML5-style text tracks |
| &nbsp;&nbsp; _src_ / _String_ | address of the track file (URL) |
| &nbsp;&nbsp; _srclang_ / _String_ | language of the track, e.g. "en" |
| &nbsp;&nbsp; _label_ / _String_ | a user-readable title |
| &nbsp;&nbsp; _kind_ / _String_ | how the track is meant to be used: "subtitles", "captions", "descriptions", "chapters", "metadata" |
| &nbsp;&nbsp; _mime_type_ / _String_ | mime type of the track file, e.g. "text/vtt" |
| &nbsp;&nbsp; _default_ / _Boolean_ | indicates that the track should be enabled by default. Should only be true on one track. |
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
