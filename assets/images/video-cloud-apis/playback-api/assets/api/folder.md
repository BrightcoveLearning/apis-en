# Folder resource, accessed by ID

## Path
GET/PATCH/DELETE individual folder

[$BASE_URL](README.md)/accounts/1234/folders/5kjhbwvd34

GET/PUT/DELETE videos within a folder

[$BASE_URL](README.md)/accounts/1234/folders/5kjhbwvd34/videos

## Usage for individual folder data
### GET
Returns folder data for the ID specified.

[$BASE_URL](README.md)/accounts/1234/folders/5kjhbwvd34

OAuth operator required: "video-cloud/video/read"

#### Fields
| Field | Type | Description | PATCHable? (see below) |
| --- | --- | --- | --- |
| id | String | Mongo ID | no |
| account_id | String | | no |
| created_at | String in ISO-8601 date format | | no |
| name | String | required | yes |
| video_count | Int | | no |
| version | Int | | no |
| updated_at | String in ISO-8601 date format | | no |

To get the videos within a folder, use the [$BASE_URL](README.md)/v1/accounts/1234/folders/5kjhbwvd34/videos endpoint, which will return full video objects.

#### Options
None

### PATCH
#### Fields
OAuth operator required: "video-cloud/video/update"

| Field | Type | Notes |
| --- | --- | --- |
| name | String; cannot be empty or null | Must be unique to the account |

### DELETE
OAuth operator required: "video-cloud/video/create"

Removes folder from the account.  You can delete a folder that contains videos; the videos remain but are no longer associated with a folder.

## Usage for videos within a folder
### GET
Returns video objects in the folder with the specified ID.
[$BASE_URL](README.md)/v1/accounts/1234/folders/5kjhbwvd34/videos

OAuth operator required: "video-cloud/video/read"

#### Fields
[See videos](videos.md)

#### Options
None

### PUT
Adds video 6789 to the folder

[$BASE_URL](README.md)/v1/accounts/1234/folders/5kjhbwvd34/videos/6789

OAuth operator required: "video-cloud/video/create"

Payload is empty, or use the video ID if you need to send data (it will be ignored).
To move a video from one folder to another, simply PUT it in the new folder, and it will automatically be removed from the current folder.

You can add several videos at once with
[$BASE_URL](README.md)/v1/accounts/1234/folders/5kjhbwvd34/videos/6789,4321,5673

### DELETE
Removes video 6789 from the folder

[$BASE_URL](README.md)/v1/accounts/1234/folders/5kjhbwvd34/videos/6789

You can remove several videos at once with
[$BASE_URL](README.md)/v1/accounts/1234/folders/5kjhbwvd34/videos/6789,4321,5673

OAuth operator required: "video-cloud/video/create"

