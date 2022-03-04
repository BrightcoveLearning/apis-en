# Video asset sources

## Path
[$BASE_URL](README.md)/accounts/1234/videos/5678/sources
[$BASE_URL](README.md)/accounts/1234/videos/ref:myRefId/sources

## Usage
### GET
Returns player-related asset data for all sources (renditions) in the video specified

#### Fields
##### Sources (Renditions)
| Field | Type |
| --- | --- |
| src | String URL, *for PD web assets and HLS assets only* |
| app_name | String, *for streaming web assets only* |
| stream_name | String, *for streaming web assets only* |
| codec | String |
| container | String |
| duration | Long? |
| encoding_rate | Long? |
| height | Integer |
| id | String |
| size | Long |
| uploaded_at | String in ISO-8601 date format |
| width | Integer |

##### HLS manifest
| Field | Type |
| --- | --- |
| codec | String |
| container | String |
| src | String URL |

#### Options
none

### PATCH
not supported