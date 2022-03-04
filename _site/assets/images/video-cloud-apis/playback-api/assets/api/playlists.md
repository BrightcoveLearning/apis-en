# Playlists resource

## Path
[$BASE_URL](README.md)/accounts/1234/playlists

[$BASE_URL](README.md)/accounts/1234/playlists/favorites

## Usage
### GET
Returns the list of playlists in the account.  Default limit (page size) is 20.

OAuth operator required: "video-cloud/playlist/read"

#### Fields
| Field | Type | Description |
| --- | --- | --- |
| id | String | |
| account_id | String | |
| created_at | Number | milliseconds from epoch |
| description | String | |
| favorite | Boolean | |
| limit | Number | Relevant to smart playlists only; manual playlists default to 100 |
| name | String | |
| reference_id | String | |
| search | String | Smart playlists only. Term will be in quotes. See below for details. |
| type | String | Value of established enum; see below |
| updated_at | Number | milliseconds from epoch |
| video_ids | Array of Strings | EXPLICIT (manual) type only |

#### Options
| Options | Default |
| --- | --- |
| limit | 20 |
| offset | 0 |
| sort | updated_at desc |
| q | No default; use this to filter by playlist type, e.g., ?q=type:EXPLICIT |

### POST
To add a new playlist to the account.

OAuth operator required: "video-cloud/playlist/create"

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| description | String | no | |
| favorite | Boolean | not yet supported | |
| limit | Number | not yet supported | Only relevant to smart playlists |
| name | String | yes | |
| reference_id | String | no | |
| search | String, smart playlists only | no | See details below |
| type | String value of established enum | yes | See details below |
| video_ids | Array of Strings, EXPLICIT (manual) type only | no | |

### PATCH
not supported

### Type
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

### Search
Regarding the 'search' field, the supported values for the search string are very limited. You can only search by tags. 

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

### Favorites
GET [$BASE_URL](README.md)/accounts/1234/playlists/favorites

* No custom sorting; always sorted by name ASC
* No search
* No paging
* Limit of 100; will return the first 100 alphabetically
