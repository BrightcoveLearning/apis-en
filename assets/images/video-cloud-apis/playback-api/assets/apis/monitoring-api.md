# Wedge-server Private Monitoring API

## Status

`GET /private/status`

Indicates if the server wants to receive requests, it is used by the
load balancer. (This is set via jmx by the bin/available.sh script,
and with the datacenter deploy/bc_generic.sh script. It does not
automatically change.) Responses:

- 200 OK with body `available=true`
- 503 Service Unavailable with body `available=false`

## Version

`GET /private/version`

Returns the contents of the `target/version.txt` file as a single
line. The file is created by `tools/dump_version.sh`, and contains the
timestamp of the building of the wedge-server and the git commit it
was built from. The timestamp uses UTC, as signified by the
`Z`. (Older versions used the building computer's local time, usually
EST, and did not include `Z`.)

- 200 OK with body like `20140903.1431Z.f4cf89d`

This is also available as part of the `BCOV-Instance`
[debugging response header][api-debugging].

[api-debugging]: debugging-api-requests.md

## Healthcheck

```
GET /private/healthcheck
GET /private/healthcheck?check=stable
GET /private/healthcheck?check=ready
```

Checks various aspects of Wedge system and dependencies. Called by
Nagios to determine the server's health when it is running.

### Parameters

- `check` determines the flavor of the healthcheck and defaults to
  `stable` if not provided. It only affects the HTTP status code, not
  the checks performed. This is a convenience for the caller.
    - `stable` responds with a 500 iff any component has a `CRITICAL`
      status. This is intended for use in monitoring.
    - `ready` responds with a 500 iff any components has a `CRITICAL`,
      `WARNING`, or `init` status. This is intended for use in startup
      scripts.

### Responses

- 200 OK, with body consisting of one full line (including newline)
  for each component that has a healthcheck. See below for format.
- 500 Server Error, with body as before, but only if at least one
  component had a status in violation of the check type.
- 400 Bad Request, with standard error format body and code
  `HEALTHCHECK_TYPE` if the check type is not recognized.

### Example

This example shows a possible healthcheck where Irving key management
is disabled (and has no extra data), the Roebuck reachability check
took a bit longer than it would have liked (200 millis), and a cache
check has thrown an NPE (would include full stack trace):

```
generic-cache:CRITICAL:"Thrown:\njava.lang.NullPointerException :null\n ..."
irving-keyman:disabled:null
roebuck-reachable:WARNING:["slow-response",{"elapsed-ms":200}]
```

### Format

Each component's healthcheck response takes the form of
`<component>:<status>:<data>` followed by a newline.

- `component` is a name consisting of alphanumeric and hyphen
  characters.
- `status` is one of `ok`, `init`, `WARNING`, `CRITICAL`, or
  `disabled`. Components reporting `WARNING` are experiencing degraded
  conditions or functionality. A status of `CRITICAL` indicates a
  component is unusable or is in imminent danger of being
  unusable. Components that are not in use by the current wedge server
  may report `disabled`. Components that have not yet initialized may
  report `init` at startup; once they report `ok`, they should never
  return to `init`. (Useful in checking status of new instances.)
- `data` is a JSON string containing any extra information the
  component's healthcheck wished to report. If a healthcheck threw an
  exception, the status will be reported as `CRITICAL` and the data will
  be a JSON string value containing `Thrown:\n` followed
  by the full stack trace. If JSON generation itself fails, the status
  will be unchanged but the data will again be a stack trace.
  Because Nagios checks usually have very limited intelligence,
  including `WARNING` or `CRITICAL` in this data may cause a false
  positive (and an email or page.)

### Implications

The Nagios check treats a non-200 status as a CRITICAL response, and a
200 response containing the text WARNING as a WARNING response.

The startup script uses `check=ready` to wait for all `init`,
`WARNING`, and `CRITICAL` to clear.

The [Wedge operator manual][opman] on Confluence includes guidelines
on how to respond to various failure conditions.

[opman]: http://confluence.vidmark.local/display/DEV/Operator+Manual+-+Wedge

Add your own healthcheck with `wedge.util.Healthcheck` in wedge-base
and document it on Confluence.

## Ping

`GET /ping`

Unlike the other status urls, "/ping" is available publicly on the same
end-point as the public api. It can be used by the external GSLB service to
determine when the Wcedge is entirely unavailable from one datacenter and the
DNS definition should be pointed to the backup datacenter.

- 200 OK, with body `pong`
