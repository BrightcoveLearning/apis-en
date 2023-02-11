# Playback api via Wedge-server

This describes the Playback api as currently implemented in
[Wedge](https://bithub.brightcove.com/videocloud/wedge). It is the new video api
for new BC Players and SDKs. (Originally this was called the Player Catalog api.)

This is built on [Roebuck](https://bithub.brightcove.com/videocloud/roebuck)
for the catalog data, including the video metadata, playlists and search.

This uses [Nomic](https://bithub.brightcove.com/videocloud/nomic) to support player
keys and policies to control which videos can be viewed when.

The api is being built for low latency and high load. It will use caching
as necessary, but will aim to have generally less stale data under common
circumstances than the older Video Cloud system.

See the following api spec google doc: [Player Catalog new api](https://docs.google.com/a/brightcove.com/document/d/1XhFOE9QUft7gtvo_hFrzIcrRTnY1svrCIHevUZ3CpCU/edit).

Here are the Brightcove [API Design Standards](https://docs.google.com/a/brightcove.com/document/d/1s-ZL2N1KyWyvF5whU-vWw3fusv5VRHnW0CSIl4BJcEA/edit).

The new VideoJs-based players access the Video Cloud catalog using this api
through the [videojs-bc-catalog plugin](https://bithub.brightcove.com/videocloud/videojs-bc-catalog).

## Base URI

The canonical base URI for playback requests is
`https://edge.api.brightcove.com`. This will switch between the load
balancer (`https://edge-elb.api.brightcove.com`) and Cloudfront
(`https://edge-cdn.api.brightcove.com`) depending on your geographic
location.

## Requests

Initially only four requests are supported for the first major milestone. Others will be added.

    GET /playback/v1/accounts/:accountId/videos/:videoId
    GET /playback/v1/accounts/:accountId/videos/ref::referenceId
    GET /playback/v1/accounts/:accountId/playlists/:playlistId
    GET /playback/v1/accounts/:accountId/playlists/ref::referenceId
    (You must supply a policy key.)

### Policy keys

See the [Nomic policy key docs](https://bithub.brightcove.com/videocloud/nomic/tree/master/doc/api/player-policy-key.md)
for how to obtain policy keys.

The policy key for a player catalog API request must be supplied in one of three ways, which
are checked in the following order, the first one succeeding.  (If you supply several, the
first one in the below list will govern.)  In the examples, `<POLICY_KEY>` should be
substituted with the policy key string `BCpkalwo8tyalh...`.

1. In an argument to an `Accept` header, using the following format:
```
Accept: application/json;pk=<POLICY_KEY>
```
This is a grungy hack that has two advantages: it is permitted by the letter of the HTTP
standard, and it avoids making a CORS preflight request.

2. In an `Authorization` header using the realm keyword `BCOV-Policy`:
```
Authorization: BCOV-Policy <POLICY_KEY>
```

3. In a `BCOV-Policy` header:
```
BCOV-Policy: <POLICY_KEY>
```

If you do not supply a policy key, your request will be rejected 401 Unauthorized with an error
code of `INVALID_POLICY_KEY`.

### TV Everywhere restrictions

See [Playback TVE Restrictions](playback-tve-restriction.md).

### Geographic restrictions

See [Playback Geo Restrictions](playback-geo-restriction.md).

### IP restrictions

See [Playback Geo Restrictions](playback-ip-restriction.md).

## Responses

The results will be a subset of the fields currently returned by Roebuck, with
the aim to minimize the number of requests and the latency of most common
player needs. In almost all cases the field names and structure will be identical
to what the CMS api returns.

### Video Response

Here is an example of some of the fields returned for a video. The "sources" array
is an array of ids from Roebuck, but the Playback api expands them to their fields.

    {
      "account_id": "107767373001",
      "ad_keys": null,
      "created_at": "2010-07-12T22:37:34.760Z",
      "description": "Avatar_MakingAScene_Featurette",
      "duration": 595560,
      "id": "111723525001",
      "long_description": null,
      "name": "Avatar_MakingAScene_Featurette",
      "published_at": "2010-07-12T22:37:34.760Z",
      "reference_id": "AvatarMakingShort",
      "text_tracks": [],
      "updated_at": "2010-07-12T22:54:29.666Z",
      "cue_points": [
        {
          "id": "111637107001",
          "name": "Pre-roll",
          "type": "AD",
          "time": 0,
          "metadata": null,
          "force_stop": false
        }
      ],
      "custom_fields": {
        "moretext": "this is the first video uploaded",
        "mylist": "abc"
      },
      "link": {
        "text": "Full Dvd at Amazon",
        "url": "https://www.amazon.com/Avatar-Sam-Worthington/dp/B002VPE1AW"
      },
      "tags": [
        "copied"
      ],
      "poster_sources": [
        {
          "src": "https://brightcove04.o.brightcove.com/107767373001/107767373001_111728861001_vs-111727994001.jpg?pubId=107767373001&videoId=111723525001"
        }
      ],
      "thumbnail_sources": [
        {
          "src": "https://brightcove04.o.brightcove.com/107767373001/107767373001_111728862001_th-111727994001.jpg?pubId=107767373001&videoId=111723525001"
        }
      ],
      "poster": "https://brightcove04.o.brightcove.com/107767373001/107767373001_111728861001_vs-111727994001.jpg?pubId=107767373001&videoId=111723525001",
      "thumbnail": "https://brightcove04.o.brightcove.com/107767373001/107767373001_111728862001_th-111727994001.jpg?pubId=107767373001&videoId=111723525001",
      "sources": [
        {
          "avg_bitrate": 379000,
          "width": 320,
          "duration": 595560,
          "size": 28196307,
          "stream_name": "mp4:107767373001/107767373001_111728840001_Avatar-MakingAScene-Featurette.mp4?__nn__=1497926354001&slist=107767373001/&auth=daEciavcicRbhbtdSaBdBdVbXd0aUdTcMaX-bvRrSa-hca-slyCzrux_zJAq_HFCB_EvE&aifp=bcosuds",
          "codec": "H264",
          "asset_id": "111728840001",
          "container": "MP4",
          "height": 180,
          "app_name": "rtmp://cp150446.edgefcs.net/ondemand"
        },
        {
          "avg_bitrate": 379000,
          "width": 320,
          "src": "https://uds.ak.o.brightcove.com/107767373001/107767373001_111728840001_Avatar-MakingAScene-Featurette.mp4?pubId=107767373001&videoId=111723525001",
          "size": 28196307,
          "height": 180,
          "duration": 595560,
          "container": "MP4",
          "codec": "H264",
          "asset_id": "111728840001"
        }, ... 6 more sources ...

      ]
    }

#### Video Fields included

The Roebuck response for a video is converted into a Playback api response,
mostly by only including a white-listed set of fields at the top and secondary
level. Then it includes the video source data rather than just those ids.
The code to handle this is in this file. Check here for more details and up to date info.

    wedge/api/player/player_catalog_api_response.clj

Here is the list of top level fields that are included in the response.

    account_id ad_keys created_at cue_points custom_fields
    description duration id link long_description name
    poster_sources published_at reference_id sources tags
    thumbnail_sources text_tracks updated_at

* Both "sources" and "text_tracks" may be removed by certain source restrictions, such as TVE, see links above.

The following types of image sources are returned. Within these arrays of maps,
we currently only include "src" with the url. More fields might be returned in the future.

     thumbnail_sources
     poster_sources

The following fields are **deprecated**, they return information on just a single image.
These fields are no longer enough where there may be both https and http
images, and perhaps more renditions of images in the future.

    thumbnail poster

#### Video sources fields included

With in the video's "sources" maps, the following fields are kept.

    avg_bitrate app_name asset_id codec container duration height
    id size src stream_name streaming_src type width

* The source "src" contains the url for this rendition of the video.
* "streaming_src" is used by Akamai HD and HDS assets. Our new players don't use this but customer player integrations could.
* Source "type" is the MIME type used for manifests, such as for DASH.

This source field is renamed from what Roebuck uses internally to what the CMS api returns.

    encoding_rate -> avg_bitrate

### Playlist Response

In the case of a playlist call, you will receive some fields about the whole playlist
and a vector of zero or more videos described above.

    {
      "account_id": "107767373001"
      "created_at": "2010-07-12T22:43:30.290Z",
      "description": null,
      "id": "111592530001",
      "name": "Play One",
      "reference_id": null,
      "type": "EXPLICIT",
      "updated_at": "2010-07-12T22:51:25.055Z",

      "videos": [
        {
          "name": "Avatar_MakingAScene_Featurette",
          "reference_id": "AvatarMakingShort",
          "long_description": null,
          "duration": 595560,
          "description": "Video",
          ... more video fields ...
        },
        ... more videos ...
      ]
    }

See the CMS api documentation for playlists for a description of these fields.

    account_id created_at description id name reference_id
    type updated_at videos

## Headers

### Policy key request header, BCOV-Policy

A player api request must be accompanied by a Nomic policy key that permits it.
The policy key determines the maximum set of videos that a given player can ever access.
Currently policy keys either allow playing a single video or all videos in a single account.
In the future we will be able to encode a policy id for more complex policies stored
in Nomic.

A key is sent on the request with a "BCOV-Policy" header and is of the form
"BCpk-plus-many-more-characters".

#### Policy Key encryption

The dev instance of Wedge with just the data in the repo, has the non-secure development
set of encryption keys for Nomic policies, so the Player api only works with keys that
are created by a development run of Nomic.

Likewise keys created by Nomic in QA Griffin can only be used with QA Wedge. The Nomic
documentation describes how to set up a dev instance so it can use keys from QA.

### Response Headers

There are some response header from Wedge that are an important part of the response.

    Content-Type: application/json
    Date: Wed, 16 Apr 2014 22:11:02 GMT
    Transfer-Encoding: chunked

There are some passed through from Roebuck that are important for checking the
currency of the resource and for caching. These are from the Video object
version number and last modified date.

    ETag: "2"
    Last-Modified: Fri, 15 Nov 2013 21:51:40 GMT

We also return some headers useful in [debugging][api-debugging] and
performance testing that are common to all wedge-based APIs
(`BCOV-Instance`, mainly.)

[api-debugging]: debugging-api-requests.md

Finally, if the playback API is called though Cloudfront, you'll see
some additional headers specific to that.

    X-Cache: Miss from cloudfront
    X-Amz-Cf-Id: q9WN0xZZvWnDHHlJVIfQObX2ugPnbl_mnQKn5vXHstM8fkj2_Ok-Ow==

One product goal for the new Player api is to let users know more about why
they cannot view certain videos, so it is easier for them to fix problem or
know where the issue may be (not always Brightcove). Error messages and
response headers will probably be part of solving that.

## Response statuses and error codes

These are the standard HTTP status codes that can be returned by the Player catalog api,
and what the specifically mean for this api.

| Code | Status name           | Description
| ---- | --------------------- | ---------------------------
| 200  | `SUCCESS`               | The normal response is sent.
| 401  | `UNAUTHORIZED`          | Must provide a BCOV-Policy header with a legal policy key.
| 403  | `FORBIDDEN`             | The policy key provided does not permit this account or video.
| 404  | `NOT_FOUND`             | The requested resource is not available.
| 405  | `METHOD_NOT_ALLOWED`    | Only GET, HEAD and OPTIONS are allowed for this api.
| 500  | `INTERNAL_SERVER_ERROR` | Internal server error, usually will have more information in the logs.
| 501  | `NOT_IMPLEMENTED`       | Feature not supported, for example Nomic keys that reference policy ids.
| 502  | `BAD_GATEWAY`           | Got a bad response from a backend server, generally Roebuck returned a 500 error.
| 503  | `SERVICE_UNAVAILABLE`   | Returned this response from a backend server, as the Player api does not do rate limiting.
| 504  | `GATEWAY_TIMEOUT`       | Either a backend server or one of the servers they rely on timed out.


As per the api design standards, error responses (4xx and 5xx) contain an error
response object one or more maps that include an 'error_code' and optionally a
non-localized 'message' with more details.

    [{"error_code": "ERROR_CODE1"},
     {"error_code": "ERROR_CODE2", "message": "details can go here"}}

The error_code that is meant to be both human understandable and to be used by client
code to choose different actions and translatable user messages. The error codes are
UPPER_SNAKE_CASE.

| Error Source | status | Error code returned
| ------------ | ------ | ----------------------------
| Roebuck      | 403    | `VIDEO_NOT_PLAYABLE`
| Roebuck      | 404    | `VIDEO_NOT_FOUND`
| Roebuck      | other  | `VIDEO_RETRIEVE_FAILURE`, if could not retrieve video
| Roebuck      | other  | `VIDEO_URLS_RETRIEVE_FAILURE`, if could not retrieve sources or images
| Nomic policy | 403    | (error code from Nomic about policy denial, t.b.d.)


## Example direct api usage

The following commands can be used create a policy key for an account and request video data from Wedge and Nomic running on localhost or ssh port forwarded to it.

    ACCT=8523
    NK=https://localhost:24680/v0/accounts/$ACCT/policy_keys
    # to access via Wedge: NK=https://localhost:34380/nm/v0/accounts/$ACCT/policy_keys

    P='{"policy": {"pattern": {"=": ["[request.params.account-id]", "'$ACCT'"]}, "effect": "allow"}}'
    KEY=$(curl -sSD zhdr -H 'Content-Type: application/json' -d "$P" $NK | sed -e 's/^.*\(BCpk[^"]*\)".*$/\1/'); cat zhdr; rm -f zhdr; echo "key=$KEY"

And then to use this key with player api requests.

    WH="https://localhost:34380"
    ID=1234
    curl -isS -H BCOV-Policy:$KEY "$WH/playback/v1/accounts/$ACCT/videos/$ID"


### QA servers

Use these definitions with the above commands to use direct access to a QA Wedge server and its Nomic.

    NK=https://edge.api.qa.brightcove.com/nm/v0/accounts/$ACCT/policy_keys
    WH=https://edge.api.qa.brightcove.com

## Debugging

These namespaces are useful places to set log levels to INFO for
debugging as set out in [debugging-api-requests.md][]:

- `wedge.api.player.geo-restrict` - geo-restrict info including how
  client-request-ip is calculated and any videos that have a "geo"
  section.
- `wedge.util.quova` - show result of every call to Quova, from
  effective IP to Country code.

## More information

For more information about the full set of Roebuck requests and results see
[Catalog api doc](https://bithub.brightcove.com/videocloud/roebuck/blob/master/rest/doc/api/README.md).
