# Video resource, accessed by video ID or video reference ID

## Path
[$BASE_URL](README.md)/accounts/1234/videos/5678

[$BASE_URL](README.md)/accounts/1234/videos/ref:myRefId


Also, GET a list of manual playlists associated with a video (see below)
[$BASE_URL](README.md)/accounts/1234/videos/5678/references

## Usage
### GET
Returns video data for the ID specified.

OAuth operator required: "video-cloud/video/read"

#### Fields
| Field | Type | Description |
| --- | --- | --- |
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
| dash_manifest_id | String |
| description | String; takes the place of the old shortDescription |
| digital_master_id | String |
| duration | Number, milliseconds |
| economics | String, must be one of valid enum values |
| folder_id | String | Mongo-type ID of folder to which video belongs |
| geo | Map of property-value pairs |
| &nbsp;&nbsp; _geo.countries_ | _Array of country code Strings_ |
| &nbsp;&nbsp; _geo.exclude_countries_ | _Boolean_ |
| &nbsp;&nbsp; _geo.restricted_ | _Boolean_ |
| id | String |
| images | Map of property-value pairs |
| &nbsp;&nbsp; _images.thumbnail_ | _Map_ |
| &nbsp;&nbsp;&nbsp;&nbsp; _images.thumbnail.asset_id_ | _String_ |
| &nbsp;&nbsp;&nbsp;&nbsp; _images.thumbnail.src_ | _String URL_ |
| &nbsp;&nbsp;&nbsp;&nbsp; _images.thumbnail.sources_ | _Array of Maps_ |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _images.thumbnail.sources.asset_id_ | _String_ |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _images.thumbnail.sources.src_ | _String URL_ |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _images.thumbnail.sources.height_ | _Number_ |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _images.thumbnail.sources.width_ | _Number_ |
| &nbsp;&nbsp; _images.poster_ | _Map_ |
| &nbsp;&nbsp;&nbsp;&nbsp; _images.poster.asset_id_ | _String_ |
| &nbsp;&nbsp;&nbsp;&nbsp; _images.poster.src_ | _String URL_ |
| &nbsp;&nbsp;&nbsp;&nbsp; _images.poster.sources_ | _Array of Maps_ |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _images.poster.sources.asset_id_ | _String_ |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _images.poster.sources.src_ | _String URL_ |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _images.poster.sources.height_ | _Number_ |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _images.poster.sources.width_ | _Number_ |
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
| smooth_client_manifest_id | String |
| smooth_server_manifest_id | String |
| state | String | ACTIVE, INACTIVE, PENDING, DELETED
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
none

### POST
not supported

### PATCH

OAuth operator required: "video-cloud/video/update"

#### Fields
| Field | Type | Notes |
| --- | --- | --- |
| complete | Boolean | |
| cue_points | Array of Maps | you must patch *the entire array* to update |
| &nbsp;&nbsp; _cue_points.0.name_ | _String_ | required |
| &nbsp;&nbsp; _cue_points.0.type_ | _String_ | required; must be one of valid enum values |
| &nbsp;&nbsp; _cue_points.0.time_ | _Float_ | required; in seconds |
| &nbsp;&nbsp; _cue_points.0.metadata_ | _String; code point only_ | |
| &nbsp;&nbsp; _cue_points.0.force_stop_ | _Boolean_ | |
| custom_fields | Map of field-value pairs (Strings) | patch to null to unset |
| description | String | |
| economics | String | must be one of valid enum values |
| geo | Map of property-value pairs | to unset, you can either patch 'geo: null' or 'geo{}' |
| &nbsp;&nbsp; _geo.countries_ | _Array of country code Strings_ | |
| &nbsp;&nbsp; _geo.exclude_countries_ | _Boolean_ | |
| &nbsp;&nbsp; _geo.restricted_ | _Boolean_ | |
| link | Map of property-value pairs | |
| &nbsp;&nbsp; _link.url_ | _String_ | |
| &nbsp;&nbsp; _link.text_ | _String_ | |
| long_description | String | |
| name | String; cannot be empty or null | |
| reference_id | String | must be unique in the account |
| schedule | Map of property-value pairs | |
| &nbsp;&nbsp; _schedule.ends_at_ | _String in ISO-8601 date format_ | |
| &nbsp;&nbsp; _schedule.starts_at_ | _String in ISO-8601 date format_ | |
| state | String | must be one of valid enum values |
| tags | Array of tags (Strings) | Strings cannot be empty or contain commas |
| text_tracks | Array of HTML5-style text tracks |
| &nbsp;&nbsp; _src_ / _String_ | address of the track file (URL) |
| &nbsp;&nbsp; _srclang_ / _String_ | language of the track, e.g. "en" |
| &nbsp;&nbsp; _label_ / _String_ | a user-readable title |
| &nbsp;&nbsp; _kind_ / _String_ | how the track is meant to be used: "subtitles", "captions", "descriptions", "chapters", "metadata" |
| &nbsp;&nbsp; _mime_type_ / _String_ | mime type of the track file, e.g. "text/vtt" |
| &nbsp;&nbsp; _default_ / _Boolean_ | indicates that the track should be enabled by default. Should only be true on one track. |

### DELETE
Deletes video from the account; will fail with a descriptive error if the video is in a manual playlist.

OAuth operator required: "video-cloud/video/delete"

# Video References
## Path
[$BASE_URL](README.md)/accounts/1234/videos/5678/references

## Usage
### GET
Returns manual playlist IDs that reference the video ID specified.

OAuth operator required: "video-cloud/video/read"

#### Fields
| Field | Type | Description |
| --- | --- | --- |
| playlists | Array | List of manual playlist IDs that have this video as a member |

### DELETE
Removes the video from all of the manual playlists of which it is a member.  This is a convenience method to remove references before deleting the video - it should not be used to remove a video from a single playlist.  To do that, edit the individual playlist's video_ids property, as described in [playlist.md](the playlist documentation).

OAuth operator required: "video-cloud/video/delete"
