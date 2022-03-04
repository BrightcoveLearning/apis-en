# Image asset data

## Path
[$BASE_URL](README.md)/accounts/1234/videos/5678/images

[$BASE_URL](README.md)/accounts/1234/videos/ref:myRefId/images

## Usage
### GET
Returns player-relevant data for all image assets on the given video.

OAuth operator required: "video-cloud/video/read"

#### Fields
| Field | Type |
| --- | --- |
| poster |  |
| &nbsp;&nbsp; _poster.id_ | _String_ |
| &nbsp;&nbsp; _poster.src_ | _String URL_ |
| thumbnail |  |
| &nbsp;&nbsp; _thumbnail.id_ | _String_ |
| &nbsp;&nbsp; _thumbnail.src_ | _String URL_ |

#### Options
none

### PATCH
not supported
