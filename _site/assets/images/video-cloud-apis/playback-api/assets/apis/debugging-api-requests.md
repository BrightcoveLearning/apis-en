# Debugging API requests

Wedge provides several utilities for debugging requests across all
APIs. Debug information is conveyed via response headers and logs.

There are also request headers that can be used to control Wedge API
behavior for debugging.

## Response headers

Response headers are one way we convey debugging info; some of that
info is available by default and some requires at least weak
authorization.

### Non-sensitive debugging headers

All responses carry the following:

- `BCOV-instance`: This is the AWS instance value that served this
  request (or `unknown`), the git commit SHA that the server is
  running (or `unknown`), and the current time on the server. The AWS
  instance value is only present if that Wedge is being run in AWS and
  allows tracing back to which server would have the log files for the
  request. (The timestamp assists with log archaeology as well.) The
  git commit SHA is the same as from the `/private/version`
  [monitoring API][monitoring-api].

[monitoring-api]: monitoring-api.md

Example:

```bash
$ curl -isS https://edge.api.brightcove.com/ping

HTTP/1.1 200 OK
BCOV-instance: i-f73cd41a, 436deae, 2014-12-31 19:23:33.192Z
X-Originating-URL: https://edge.api.brightcove.com/ping
[...]

pong
```

### Semi-sensitive debugging headers

Wedge can also report an execution trace for the Zuul filters that
activated in a request, but demands a weak authorization to do so.

- `BCOV-Filter-Executions`: Shows the names of the filters that were
  run, whether each was successful and how long it took.

Example:

```bash
$ curl -isS -H'BCOV-Debug-Headers: eniac-loves-you' https://edge.api.brightcove.com/ping

HTTP/1.1 200 OK
BCOV-Filter-Executions: BrightcoveClientsPreFilter[SUCCESS][0ms], WedgeFilter$metrics-start-filter$901357d9[SUCCESS][0ms], StaticResponseFilter$pingFilter$cce1f35e[SUCCESS][0ms], Routing[SUCCESS][0ms], PreDecoration[SUCCESS][1ms], WedgeFilter$http-method-filter$b14cc533[SUCCESS][0ms], CmsApiReadPre[SUCCESS][0ms]
[...]

pong
```

Access to this feature is controlled by the config setting
`debug.response.headers.allow`, which is turned on in development and
QA but off in production.  On servers where it is off, you can still
make the debug parameter work by adding the header
`BCOV-Debug-Headers: eniac-loves-you` (this will become more secure
later. What it reports is not really very sensitive.)

If you need to set this on a CORS request you'll need to avoid
preflight since we don't advertise the option of this request header
in `Access-Control-Allow-Headers`. Instead, use
`Accept: application/json;BCOV-Debug-Headers=eniac-loves-you`. This
is compatible with the `pk` hack for player policy keys.

## Behavior-controlling request headers

### Cache debug request headers

- `BCOV-Debug-Cache-NoFetch`: Set to true if you'd prefer not to get
  your response from the cache.  Setting this to false or not setting
  the header at all will follow the normal request flow where the
  cache will be checked.
- `BCOV-Debug-Cache-NoPut`: Set to true if you'd prefer not to add the
  backend response to the cache.  Setting this to false or not setting
  the header at all will follow the normal response flow where the
  backend response will be added to the cache.

### Cache debug response headers

- `BCOV-Debug-Cache-Stats`: This header will report the cache
  statistics from wedge's perspective. For example, if a the response
  for a request comes from the cache, this header will report the
  latency of the cache access. This header is returned iff
  `caching.headers.debug.allow=true`.  The value of the header is a semicolon-separated
  sequence of `key=value` pairs, for example, `response-status=hit-final;response-latency=34`.
  Currently defined keys are:
  - `response-status` says what the status of the response cache lookup was.  Possible values
    are:
    - `miss` means the response cache missed;
    - `hit-final` means the response cache hit and the result was final (required no further
      policy evaluation), so it was served as is;
    - `hit-nonfinal` means the response cache hit but the cache entry had policy data attached,
      so the rest of the pipeline ran to evaluate it.
  - `response-latency` gives the time, in milliseconds, to carry out the cache get.

## Logging control

Some information is only made available in the logs.

### Verbose request debug logging

For to have debugging information logged for specific requests, you
can add: `?debugParameter=true` onto any request, it will output *much
more* information to the Wedge server log about that request
(including potentially sensitive information such as what was written
to the context map.) Access to this feature is controlled by the
config setting `debug.log.allow`, which is turned on in development
and QA but off in production.  On servers where it is off, you can
still make the debug parameter work by adding a header:

```
BCOV-Debug-Log: eniac-loves-you
```

(This will become more secure later.  It does not expose any extra
info to the API caller, just inflates our log sizes.)

The request debug data is in the log file as info messages under
`filter.debug.request` and `filter.debug.route`.

To turn this on for **all** requests, set the property
`zuul.debug.request=true`.

### Log request debug info

Turn the logger for `wedge.filters.base-filters` to DEBUG level to see
a short log entry for every request.

You can set this environment variable before starting the server.

```
export WEDGE_LOG_DEBUG_PACKAGE=wedge.filters.base-filters
```

Or by setting the logger level of a running server with log_level.jimi
(the default level is INFO).  (This script tries different logger
patterns, so expect to have a few "Not Found" messages.)

```
H=localhost # this can be a list of hosts
log_level.jimi -p 34304 -l wedge.api.player.geo-restrict $H
log_level.jimi -p 34304 -l wedge.api.player.geo-restrict -v debug $H
```

Or with jimmy.sh:

```
H=ip-10-96-220-167 # set to any current host
LOGBEAN=ch.qos.logback.classic:Name=default,Type=ch.qos.logback.classic.jmx.JMXConfigurator

jimmy.sh -h $H:34304 -bean $LOGBEAN -invoke setLoggerLevel -args wedge.filters.base-filters,DEBUG
```

### Server debug logging

To access the jimmy and toolbelt scripts, you may need to add them to the path.

    PATH=/usr/local/brightcove/toolbelt/bin:/usr/local/brightcove/jimmy/bin:$PATH

Most classes default to INFO logging other than a couple of very chatty third
party libraries that are set to WARN. The following commands can be used to turn on
DEBUG logging in one or more running Wedge servers.

    # nodeattr gender is wedge-server for playback
    #                    wedge-cms-api-server for cms and other apis
    H=$(nodeattr -n wedge-server | head -n1); echo $H
    LOGBEAN=ch.qos.logback.classic:Name=default,Type=ch.qos.logback.classic.jmx.JMXConfigurator

    # Show names of classes that have some logging.
    jimmy.sh -h $H:34304 -bean $LOGBEAN -get LoggerList | tr ',' '\n'
    jimmy.sh -h $H:34304 -bean $LOGBEAN -get LoggerList | tr ',' '\n' | grep 'wedge'

    # Query current effective logging level for a class.
    CL=wedge.filters.base-filters
    jimmy.sh -h $H:34304 -bean $LOGBEAN -invoke getLoggerEffectiveLevel -args $CL

Set logging level for a class across all wedge-servers. The class name must be correctly
spelled. The level is case insensitive: trace, debug, info, warn, error.

    HOSTS=$(nodeattr -n wedge-server); echo $HOSTS
    LOGBEAN=ch.qos.logback.classic:Name=default,Type=ch.qos.logback.classic.jmx.JMXConfigurator
    CL=wedge.filters.base-filters
    LEVEL=debug

    for H in $HOSTS; do echo $H; jimmy.sh -h $H:34304 -bean $LOGBEAN -invoke setLoggerLevel -args $CL,$LEVEL; done

You can also now use log\_level.jimi toolbelt script to view and change log levels.

    H=localhost
    log_level.jimi -p 34304 -l wedge.api.player.player-catalog-api -v debug $H

Some classes that have useful debug logging:

* wedge.filters.nomic-video-filters - log player nomic key errors
* wedge.api.player.player-catalog-api - log player catalog api errors
* wedge.filters.cache-filters - log cache get and put values
* com.netflix.zuul.http.HttpServletRequestWrapper - log every request's encoding info and length

## Access debug logs

The QA and production ELB load balancers are configured to record every access
and push those logs to S3 buckets. That is described in the [Server readme](../../server/README.md).

It is possible to have ever request, or just those for a specific api, logged.
This is enabled by default in Dev (with config access-log.all=true), and can be
enabled by changing the log level to debug for "request-log" or "request-log.<api-name>".
All requests that are not attributed to a specific api are shown as "request-log.base".

    H=localhost
    log_level.jimi -p 34304 -l request-log.player-catalog-v1 -v debug $H
    log_level.jimi -p 34304 -l request-log.nomic-policy-v1 -v debug $H

## Unused/broken

### Zuul special debugging filters

To get debugging information for only a specific subset of requests, you can create
a filter than inherits from com.netflix.zuul.filters.SurgicalDebugFilter.

Define patternMatches() and it will send those requests to debug Eureka "VIP" or
host specified by zuul.debug.vip or zuul.debug.host.

Note: Since we have changed how calls to the hosts are done, if we want to use
this feature we may need to make our own version of this abstract filter.

### Zuul response debug headers

**Update:** The following should not be used; it generates an
`X-Zuul-` header isntead of a `BCOV-` header and currently breaks
anyway.

More debug information may be included in **all** responses by setting the property
*'zuul.include-debug-header=true'* in the config.
