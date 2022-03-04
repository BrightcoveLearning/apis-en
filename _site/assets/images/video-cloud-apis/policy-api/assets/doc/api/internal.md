# Internal API

Monitoring and inspection APIs. These are not versioned, are not
routable from outside the datacenter, and are not exposed via Wedge.

## Version

`GET /nomic-server/private/version`

Returns the contents of the `target/version.txt` file as a single
line. The file is created by `tools/dump_version.sh`, and contains the
timestamp of the building of the wedge-server and the git commit it
was built from. The timestamp uses UTC, as signified by the
`Z`. (Older versions used the building computer's local time, usually
Eastern time, and did not include `Z`.)

- `200 OK` with body like `20140903.1431Z.f4cf89d`

## Status

`GET /nomic-server/private/status?action=available`

Indicates if the server wants to receive requests. It is used by the
load balancer. (This is set via jmx by the `bin/available.sh` script,
and with the datacenter `deploy/bc_generic.sh` script. It does not
automatically change.) Responses:

- `200 OK` with body `available=true`
- `503 Service Unavailable` with body `available=false`
