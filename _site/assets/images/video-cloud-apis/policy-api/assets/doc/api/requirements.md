# Requirements API (private)

A private API used by Wedge Playback to gather authorization
requirements for a request.

## Account requirements

Compute requirements for authorizing requests against an account's
resources.

```
GET /v0/accounts/<account-id>/requirements
```

### Success

On success, return 200 OK with a map of account settings and
policies. This example shows a response for an account with TVE
enabled:

```js
{"version": 1,
 "settings": {
   "iprestrictions": [],
   "usequova": false,
   "status": "APPROVED",
   "datelastmodified": "2014-09-18T14:28:41.469+0000",
   "tveenabled": true,
   "tverequestorid": "SYSTEM_DEFAULT",
   "tveresourceid": "SYSTEM_DEFAULT"
 },
 "policies": [
   {"pattern": {"=": ["[request.params.account-id]", "3162030207001"]},
    "effect": "allow"},
   {"pattern": {
      "!adobe-tve-valid": [
        "[tve.requestor-id]",
        "[tve.resource-id]",
        "[request.tve-auth-token]"
      ]
    },
    "effect": {"partial-deny": ["sources"]}}
 ]
}
```

`settings` is a map of lowercased Origin account settings for the
account. This list is drawn from a hardcoded list (`TVEEnabled`,
`TVERequestorId`, `TVEResourceId`) as well as any listed in
`:extra-account-settings` in nomic-server's config. (Note: Expanding
the list requires an Origin config change.) Setting values may be
booleans or strings. (As more settings are added, this may one day
include numbers.) If a setting is not whitelisted in Origin it will
simply be missing from this map. If there are no settings, this map
will be empty.

`policies` is a list of policies in the format understood by v1 and v2 of
nomic-core. It will be empty if no policies are known for the account.
Callers should not attempt to interpret this field except through
nomic-core; due to optimizations, the absence of a certain policy
pattern may not indicate that that policy is not in effect on the
account.

`version` is a placeholder field currently set to `1`; it may at some
point be used to indicate backwards-compatible variants of this data
structure.

### Failure

If the account does not exist or if the backend request fails, return
a non-2xx HTTP status and an array of one or more errors. Example:

```js
[{"error_code": "UNEXPECTED_ERROR",
  "message": "Unexpected error in computing requirements."}]
```

TODO: Expand and document the list of error codes (and HTTP status
codes.)
