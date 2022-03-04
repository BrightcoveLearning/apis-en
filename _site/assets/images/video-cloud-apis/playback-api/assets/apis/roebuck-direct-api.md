# Roebuck Private Direct api via Wedge-server

This is a private catalog api to directly access whatever Roebuck allows for reading and writing catalog data, without caching.

This will never be exposed to customers, but is rather for development and testing, until we create an actual read-write catalog api (aka "the CMS api").

This will require a OAuth credentials for a logged on user with access to the requested account. Later on we will support rate limiting.

## Requests
    GET /rb/v1/accounts/:accountId/videos

    GET /rb/v1/accounts/:accountId/videos/:videoId
    GET /rb/v1/accounts/:accountId/videos/:videoId/sources
    GET /rb/v1/accounts/:accountId/videos/ref:referenceId

    GET /cms/v1/accounts/:accountId/videos?q=<query>

## Responses

For more information about Roebuck requests and results see [Catalog api doc](https://bithub.brightcove.com/videocloud/roebuck/blob/master/rest/doc/api/README.md).
