# Folders resource

## Path
[$BASE_URL](README.md)/accounts/1234/folders

## Usage
### GET
Returns list (array) of folders (maps) in the account.

OAuth operator required: "video-cloud/video/read"

#### Fields
For each folder:

| Field | Type | Description | PATCHable? (see below) |
| --- | --- | --- | --- |
| id | String | Mongo ID | no |
| account_id | String | | no |
| created_at | String in ISO-8601 date format | | no |
| name | String | required | yes |
| video_count | Int | | no |
| version | Int | | no |
| updated_at | String in ISO-8601 date format | | no |

#### Options
None

### POST

OAuth operator required: "video-cloud/video/create"

#### Fields
| Field | Type | Notes |
| --- | --- | --- |
| name | String; cannot be empty or null; cannot exceed 100 chars; cannot contain '/' | Must be unique to the account |

## Limitations
* 500 folders max
* A video can only be in one folder at a time.
* Folder names must be unique per account.
* Folder names cannot be blank, empty, or null.
* Folder names cannot be longer than 100 characters.
* Folder names cannot contain the / character.
