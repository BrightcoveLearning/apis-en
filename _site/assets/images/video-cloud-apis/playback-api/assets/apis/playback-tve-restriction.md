# Playback TV Everywhere restrictions

See the [TVE section](https://docs.google.com/a/brightcove.com/document/d/1XhFOE9QUft7gtvo_hFrzIcrRTnY1svrCIHevUZ3CpCU/edit#heading=h.fbig49kmuxas)
of the Player Catalog api spec.

See [this confluence page](http://confluence.vidmark.local/display/DEV/Enabling+TVE+for+a+publisher)
for a description of setting up and testing TVE restrictions.

Our public [TVE doc](http://docs.brightcove.com/en/video-cloud/tve/assets/index.html).

## TVE validation values

An instance of Wedge will only do TVE validation if the configuration setting
"tve.enabled" is true. That is the default.

The account settings and use of video custom fields for TVE is defined to be exactly
the same as for TVE in the Video Cloud legacy Origin + Gobbles systems. TVE behavior
of accounts and videos should be exactly the same whether they are accessed by the older
or new player apis.

**Note: Review if this description and Wedge's actual behavior are truly the same as current VC TVE behavior.**

TVE validation is only done for accounts that have the account setting "tveenabled" true.

The AdobeValidator takes three non-blank strings to decide if a request is valid or not.

* token is a string sent in with the player request on the "tokenParam" parameter.
It is generated when the user logs onto TVE authentication site.
* requestor-id string either comes from video custom-field named "bcadobepassrequestorid"
or else the account setting "tverequestorid".
* resource-id comes from one of three places:
    + video custom-field named "bcadobepassresourceid"
    + Account setting "tveresourceid", unless it is missing or equals "SYSTEM\_DEFAULT"
    + Calculate an MRSS-style xml value from information in the video to use for the resource id.

*TODO: Check legacy and Wedge behavior when account setting is SYSTEM\_DEFAULT, which has precedence.*

### Calculated Resource Id

If a TVE resource id is calculated for a video, it will look like the following
with the capitalized values replaced and with no newlines or indenting spaces.

    <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
      <channel>
        <title>REQUESTORID</title>
        <item>
          <title>ITEM-TITLE</title>
          <guid>GUID</guid>
          <media:rating scheme="urn:SCHEME">RATING</media:rating>
        </item>
      </channel>
    </rss>

* REQUESTORID is the requestor-id, defined above.
* ITEM-TITLE is either the value of the custom field "bcadobepasstitle" or the video's title.
* GUID is either from the custom field "bcadobepassreferenceid" or the video's reference id.
* SCHEME is from the custom field "bcadobepassratingscheme"
* RATING is from the custom field "bcadobepassrating". If the video has neither the scheme
or ratings fields then the "media:rating" section of the resource id is omitted.

These custom field names cannot be changed because they are already used in customer's
Video metadata and the systems to create those videos.

## Testing TVE

This Brightcove test account has TVE enabled and here is one example video id.

    ACCT=2097119707001; ID=2149332630001 # Brightcove (tve)

These cache debugging headers can be useful to force non-cached checking of TVE videos.

    curl -H BCOV-Debug-Cache-NoFetch:true -H BCOV-Debug-Cache-NoPut:true ....

## Debugging TVE requests

When debugging player catalog api calls and the computations for TVE requests, it may
be helpful to turn the following logging to debug. They also indicate which account and
video is being checked, unlike the Adobe logging. (There is not much debugging directly
in tve-validator.)

    log_level.jimi -p 34304 -l wedge.api.player.player-tve-enforcer -v debug localhost
    log_level.jimi -p 34304 -l wedge.api.player.player-catalog-api -v debug localhost

The AdobeValidator logs TVE validations successes and failures as follows:

    [INFO ] com.adobe.entitlement.verifier.SimpleTokenPKISignatureVerifier - Token validated
    [WARN ] com.adobe.tve.crypto.external.SimpleTokenSignatureWrapperVerifier - Token Signature verification failed
    [ERROR] com.adobe.entitlement.verifier.SimpleTokenPKISignatureVerifier - Failed to validate token signature
    [ERROR] com.adobe.entitlement.verifier.SimpleTokenPKISignatureVerifier - Token expired

