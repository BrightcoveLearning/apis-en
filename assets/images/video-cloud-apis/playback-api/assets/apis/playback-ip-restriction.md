# Playback IP restrictions

Playback IP restrictions are set as a list of IP ranges for an account basis.
If set then all playback requests will be rejected if not from one those IP ranges.

When the IP range list is set on the account then three account settings flogs are set
as well: SimpleFeedEnabled, LinkedNetworkEnabled, HostedPlayerEnabled. They can be
individually edited. The Playback api will enforce IP restrictions only when the
"HostedPlayerEnabled" flag is set (it ignores the other two).

The restrictions are set with the [Account Info (counts)](https://services.brightcove.com/services/internal/mvc/publisherEntityCounts)
wacky page under ["Edit publisher's account level IP restrictions."](https://services.brightcove.com/services/internal/browser/publisherIPRestrictions.jsp)


## Calculating and testing IPs used for restrictions

This section applies both to IP and Geo restrictions.

## Calculating IP to use

The Playback api uses the "X-Forwarded-For" header to determine what IP to use for
restrictions. This provides the IP of the server that made the request to the
data center (what the ELB received, instead of using the load balancer's IP).
There may be multiple IPs on that header and multiple such headers, such as when
the viewer's request went through an outside proxy.

The needs of IP and Geo restrictions are different, so they use different values
when there are multiple in the "X-Forwarded-For" IPs.

* IP Restriction is given an explicit list of legal IP ranges for the publisher, so it uses
  the last IP in the "X-Forwarded-For" headers. This is the IP reported as the request reaches
  our data center's load balancer. This is more difficult to forge, but does not tell us
  the location of the end viewer.
* Geo Restriction needs the best approximation of where the end viewer is, so it uses
  the first IP in the "X-Forwarded-For" headers. This is not hard to forge, but when
  accurate it gives the best indication of what is the user's location.

For testing and legacy purposes there is other request information that may used to
calculate the IP.

* "BCOV-Override-Client-IP" header may be used to override the other values, see below.
* "Client-IP" header is an older ad hoc standard, it will be used if it is present
  with no "X-Forwarded-For" headers.
* For development and testing without a load balancer, if not of those headers are
  present then the IP of the immediate requesting server (request.getRemoteAddr()) is used.

### Testing other IPs

The client's IP can be overridden by setting the config property client.ip.test.header.enabled=true,
this is on by default in the Dev and QA environments. It should not be turned on in production.
Then with a request the following additional header can be sent in with any IP.

    BCOV-Override-Client-IP 111.222.333.444

Since Geo restrictions use the first "X-Forwarded-For" IP, the one closest to the client,
it is also possible to test with alternate values by setting that header on the request.

### Override of restrictions for BC support

For the legacy players, there is an override to allow Brightcove offices and vpn networks
to be able to play restricted videos for support and debugging. For the new Playback api,
PM and Dev have decided that we should not implement similar by-passes.
This allows more consistent testing and enforcement of the limitations.

If there are specific support situations where that by-pass is useful, we can explore
if there are other ways to accomplish what is needed. The Studio and CMS api can be
used to access the video metadata.

### IP addresses for BC offices

Here are IP addresses by which the Brightcove offices access the internet.
These can be used to make IP restrictions that only work in the offices/vpn.

These addresses are also configured in Gobbles to support its in-office override,
see the [Gobbles config file here](https://bithub.brightcove.com/videocloud/gobbles/blob/master/services/src/main/resources-filtered/GobblesConfig.default.properties#L565).

    BC office external IPs:
    Boston Office              64.206.121.41
    UK Office                  195.171.7.162
    Seattle Office             50.197.95.1
    San Francisco Office       199.116.73.2
    NoSplit VPN & Andover CoLo 63.252.33.194

## Other feature documentation

Confluence documentation for the restrictions as first implemented in the legacy players.

* [Account-Player IP Restriction](http://confluence/display/DEV/Account-Player+IP+Restriction)
* [Security Enhancements with IP Restrictions](http://confluence.vidmark.local/display/DEV/Security+Enhancements+with+IP+Restrictions)

There are also three flags: SimpleFeedEnabled, LinkedNetworkEnabled, HostedPlayerEnabled,
that control older system features that are often entirely disabled for accounts that
use IP restrictions. Those are not relevant to the new Playback api.
