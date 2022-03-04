# CMS API Overview

The CMS API is a filter in the Wedge application, which accesses Roebuck for catalog data.

## Base URL
    Production:  https://cms.api.brightcove.com/v1beta1
    Kong:  https://cms.api.qa.brightcove.com/v1beta1
    Staging:  TBD

## Account Path
    $BASE_URL/accounts/1234

Use this path for all GETs.  All objects are accessed with reference to the account ID.

## Video Resources
Video resources are reached via this pattern, $ACCOUNT_PATH/:resource, e.g., https://edge.api.brightcove.com/v1beta1/accounts/1234/videos

| Resource | Description |
| --- | --- |
| [videos](videos.md) | Metadata and asset information about videos. Will list a page of videos if no video ID is given.  Supports search (q param), sort, and paging (limit & offset) |
| [videos/1234](video.md) | Metadata and asset information about the video with the given ID |
| [videos/1234/sources](sources.md) | Player-specific metadata for this video's sources (renditions) |
| [videos/1234/images](images.md) | Metadata for all of this video's images: poster, thumbnail, logo overlay |
| [videos/ref:myRefId](video.md) | Metadata and asset information about the video with the given reference ID |
| [videos/ref:myRefId/sources](sources.md) | Player-specific metadata for this video's sources (renditions) |
| [videos/ref:myRefId/images](images.md) | Metadata for all of this this video's images: poster, thumbnail, LO |

### Methods
* GET is supported for all resources.
* HEAD is supported for all resources.
* OPTIONS is supported for all resources.
* PATCH is not yet supported.
* POST is supported for the /videos resource.

### Response Headers
There are no video-specific headers yet in the request response (ETag (version) and Last-Modified have not yet been implemented).

## Examples
See the resource sub-pages.

For search options using the query parameter option (q), see the [catalog-api-docs wiki](https://bithub.brightcove.com/videocloud/catalog-api-docs/wiki/Catalog-API-v1alpha3-Videos#search-videos).  This document is for the front-facing Hapi application, but it is valid for the CMS API, as well, since both are backed by Roebuck.

## Authentication, Authorization, Caching, Throttling
### Authentication and Authorization
OAuth has been implemented in the CMS API.

CMS API read actions (GET) require at least video-cloud/video/read permissions.

CMS API create actions (POST) require at least video-cloud/video/create permissions.

CMS API update actions (PATCH) require at least video-cloud/video/update permissions.

### Caching and Throttling
Wedge handles these; there is currently no configuraion of caching or throttling at the CMS API filter level.
