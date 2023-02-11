# Playback Geographic restrictions

Geographic restrictions (aka Geo filtering) can be enabled on an account.
If so then each video's metadata is checked for "geo" restrictions, if they
are defined then every request for that video is checked to see if it comes
from a country that is allowed by those restrictions.

This is supported for videos in the same way as the current system. See this
[playback api section](https://docs.google.com/a/brightcove.com/document/d/1XhFOE9QUft7gtvo_hFrzIcrRTnY1svrCIHevUZ3CpCU/edit#heading=h.1xzla2jbx56p)
of the Player Catalog api spec.

Geo restrictions are defined per video. The per player geo restrictions of the old players are not supported.

Here is an example of the meta-data returned by Roebuck for videos that are geo restricted.

    "geo":{"countries" ["us","usmil","um","pr"],
    "exclude_countries":false, "restricted":true}

The logic for checking Geo restrictions is:

* If the account has UseQuove = true and the video has geo.restricted = true then every request's IP for that video much be checked, otherwise do not check.
* For requests that must be checked, convert the IP to a country code (using Quova) and check if that value is in the geo.countries list. The geo.exclude_countries value tells if this is a blacklist (true) or a white list (false).
* Refuse the request if geo.exclude_countries and whether the request's country is in the list are both true (is on the blacklist) or both false (is not on the whitelist).

## Controlling Geo restrictions

* The account-wide Geo-restriction flag is named "UseQuova". It is accessibe from the [Manage Accounts wacky page](https://services.brightcove.com/services/internal/mvc/account/search), under "Publisher Preferences" (not in Account Settings).
* For accounts that have the UseQuova flag turned on, you can set restrictions on a video in the old Studio's Media Module, with the Edit > Availability function.
* [Test Geo-Location for an IP address](https://services.brightcove.com/services/internal/testGeo.jsp) wacky page shows the results from Quova for a given IP address. (Ignore the IP2Location line, that is obsolete.)

Also see the *"Calculating and testing IPs used for restrictions"* in the [Playback Geo restriction doc](playback-geo-restriction.md).


## Other feature documentation

* [Public doc about geo filtering in old studio](https://support.brightcove.com/en/video-cloud/docs/geo-filtering-your-videos)
* [Public doc, geo filtering error display for older players](https://docs.brightcove.com/en/video-cloud/smart-player-api/samples/geo-filtering-video-error-display.html)
* [CS/Quova and Geo-Restriction](https://confluence.vidmark.local/display/CS/Quova+and+Geo-Restriction)
