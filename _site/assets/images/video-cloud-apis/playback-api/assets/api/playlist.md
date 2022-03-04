# Playlist resource, accessed by playlist ID

## Path
GET/PATCH/DELETE individual playlist

[$BASE_URL](README.md)/accounts/1234/playlists/5678

[$BASE_URL](README.md)/accounts/1234/playlists/ref:myRefId

GET multiple playlists by comma-separated IDs

[$BASE_URL](README.md)/accounts/1234/playlists/5678,9123,4573

GET videos within a playlist

[$BASE_URL](README.md)/v1/accounts/1234/playlists/5678/videos

GET the count of videos in a given playlist

[$BASE_URL](README.md)/accounts/1234/counts/playlists/5678/videos

## Usage
### GET
Returns playlist data for the ID specified.

OAuth operator required: "video-cloud/playlist/read"

#### Fields
| Field | Type | Description |
| --- | --- | --- |
| id | String | |
| account_id | String | |
| created_at | Number | Milliseconds from epoch |
| description | String | |
| favorite | Boolean | |
| limit | Number | Smart playlists only |
| name | String | |
| reference_id | String | |
| search | String | Smart playlists only. Term will be in quotes. |
| type | String | Value of established enum, e.g., EXPLICIT, ALPHABETICAL, PLAYS_TOTAL |
| updated_at | Number | Milliseconds from epoch |
| video_ids | Array of Strings | Manual playlists only |

To get the videos within a folder, use the [$BASE_URL](README.md)/v1/accounts/1234/playlists/5678/videos endpoint, which will return full video objects.

#### Options
none

### POST
not supported

### PATCH
Updates the playlist metadata.  Can add/remove videos to/from a manual playlist by patching the video_ids array.

OAuth operator required: "video-cloud/playlist/update"

#### Fields
| Field | Type | Notes |
| --- | --- | --- |
| description | String | |
| name | String | Cannot be empty or null |
| favorite | Boolean | |
| limit | Number | Smart playlists only |
| reference_id | String | Must be unique in the account, can only be updated if request is made via the ID resource (can't patch ref id via the ref id resource) |
| search | String | Smart playlists only. Term will be in quotes. See below for details. |
| type | String | Must be one of valid enum values; see below |
| video_ids | Array of Strings | Manual playlists only |

#### Type
The 'type' value can only be one of:
'EXPLICIT',
'ACTIVATED_OLDEST_TO_NEWEST',
'ACTIVATED_NEWEST_TO_OLDEST',
'ALPHABETICAL',
'PLAYS_TOTAL',
'PLAYS_TRAILING_WEEK',
'START_DATE_OLDEST_TO_NEWEST',
'START_DATE_NEWEST_TO_OLDEST'

'EXPLICIT' means that it is a manual playlist; all the other types are smart playlists with names corresponding to their ordering scheme.

#### Search
Regarding the 'search' field when patching, the supported values for the search string are very limited. You can only search by tags. 

Quote the terms when the there are multiple words in a tag; quotes are optional if a tag has only one word.  When you do a subsequent GET on the playlist, the terms will always be quoted, regardless of the number of words in the term.

Quotes and backslashes in tags must be escaped with a backslash.

Here are some example valid searches:

	tags:foo

	+tags:bar

	tags:foo,bar

	+tags:"foo bar","boo yah"

	+tags:"\"air quotes\""

**For specific scenarios:**

	contains all: "+tags:foo,bar"  ** NOTE: we have a bug about this, ACME-317

	contains any: "tags:foo,bar"

**There is currently no support for the following, due to backward-compatibility issues:**

	contains none: "-tags:foo,bar"

### DELETE
Deletes the playlist.  Has no impact on the videos in that playlist.

OAuth operator required: "video-cloud/playlist/delete"

