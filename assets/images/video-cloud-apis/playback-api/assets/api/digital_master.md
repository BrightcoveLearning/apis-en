# Digital Master

## Path
[$BASE_URL](README.md)/accounts/1234/videos/5678/digital_master

## Usage
### GET
Returns digital master info for the video with the given ID.

#### Fields
| Field | Type |
| --- | --- |
| id | String |
| account_id | String |
| audio_only | Boolean |
| cdn_origin_id | String |
| complete | Boolean |
| controller_type | String; one of the valid values in the controller type enum |
| current_filename | String |
| drm | String |
| encoding_rate | Number |
| frame_height | Number |
| frame_width | Number |
| hds | String |
| hls | String |
| name | String |
| preview_thumbnail_asset_id | String |
| progressive_download | Boolean |
| reference_id | String |
| remote_stream_name | String |
| remote_url | String |
| sharded_directory | String |
| size | Number |
| type | String; one of the valid values in the type enum |
| updated_at | String in ISO-8601 date format |
| uploaded_at | String in ISO-8601 date format |
| video_codec | String; one of the valid values in the video codec enum |
| video_container | String; one of the valid values in the video container enum |
| video_duration | Number |

If the digital master exists, but we have no asset information on it, only the ID will be returned in the GET response.

#### Options
None

### POST
Not supported.

### PATCH
**THIS SHOULD NOT BE PUBLICALLY DOCUMENTED!  IT IS A SPECIAL FUNCTION FOR A VERY SPECIFIC USE CASE, WHICH PUBLISHERS SHOULD LEARN ABOUT BY CONTACTING CUSTOMER SUPPORT.**

Make a PATCH request to the parent video at [$BASE_URL](README.md)/accounts/1234/videos/5678, with a body of {"digital_master_id": id_of_valid_mp4_source}.

*Restrictions*
* Source for new digital master must already be in the video's sources array.
* Fails if the new source is null, incomplete, errored, remote, audio, drm, hls (has container=M2TS), or is not an FLV_FULL.
* Fails if the video already has a digital master.  To replace an existing digital master, first delete the old then add the new via PATCH.
* Changing the digital master on a shared video will *not* affect the sharee copies.

### DELETE
**THIS SHOULD NOT BE PUBLICALLY DOCUMENTED!  IT IS A SPECIAL FUNCTION FOR A VERY SPECIFIC USE CASE, WHICH PUBLISHERS SHOULD LEARN ABOUT BY CONTACTING CUSTOMER SUPPORT.**

Removes the digital master from the video (sets it to null); Kali will do the actual deleting if the asset becomes orphaned by this action.  Does not cascade for shared videos; you must explicitly delete the digital master from all copies.
