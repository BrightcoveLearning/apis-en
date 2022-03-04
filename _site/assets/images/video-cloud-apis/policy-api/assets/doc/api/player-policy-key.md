# Player policy key API

The player policy key API is a public API used by BC developers and
customer users to create and manipulate player policy keys, which are
persistent semi-secret tokens used to control what resources a player
is allowed to access.

Paths are relative to `https://cms.api.brightcove.com/` but will soon
use `policy.api.brightcove.com` instead. In paths, `:account-id` is a
BC account ID which scopes access to policy objects.

This API requires an OAuth2 Authorization header granting access to
the `video-cloud/player/create` operation on the relevant
account. (This means that in practice policy keys that grant access to
all videos across publishers are not obtainable.)

The keys created by this API are not currently stored or revocable.

## Create a policy key

`POST /v1/accounts/:account-id/policy_keys`

Accepts JSON describing a policy set in either the
[full or concise format](policy-format.md). Acceptable formats are:

- `{"key-data": <concise-policy>}`, supplying a concise-format policy
  set object
- `{"policies": [<full-policy>*]}`, supplying a vector of full-format
  policy objects

Even when using full-format policies, callers may only use
restrictions supported by the concise format. Either way, the policy
set *must* restrict access to the account ID on the path or the key
will not be created.

For valid inputs, yields `200 OK` with JSON body of the form
`{"key-string": <player-policy-key>, "policy": [<full-policy>*]}`. The
player policy key is what needs to be passed to the Playback API by
players. The `policy` key may be safely ignored, but notice the
variant spelling. It yields the input policies in full-format,
regardless of input format.

(For historical reasons, the key `policies` may instead be spelled
`policy` in the request, and in either case can accept a single
policy object instead of a vector, but this is discouraged and may be
removed in a future version.)

Error responses carry a JSON array of error objects, each with an
`error_code` and `message` string:

* If required attributes are missing or invalid, return `400 Bad Request`.
* If the policy does not restrict to the account ID in the path,
  return `403 Forbidden` with error code `ACCESS_DENIED`.

Example call:

```bash
curl -sS -H 'Authorization: Bearer <OAuth2 token>' \
  -H "Content-Type: application/json" \
  -X POST -d '{"key-data":{"account-id":"8523"}}' \
  'https://cms.api.brightcove.com/v1/accounts/8523/policy_keys'
```
with response
```js
{"key-string":"BCpkABErCLcF3UA6qs5qET2YO1X53fWKC6kkGZ8eB_xKW3oG7ucm83yobSTc8M47SziPQyA0LcM7AouoslfH_oXUlcs-15132jdpkII1p24pNUv-1MucSipw2iA",
 "policy":[{"pattern":{"!=":["[request.params.account-id]","8523"]},"effect":"deny"}]}
```

## Read a policy key

`GET /v1/accounts/:account-id/policy_keys/:key-string`

Describe the provided player policy key.

For a valid key on the account, yields a JSON response with
`key-string` and `policy` as in the key creation endpoint. (Currently
broken, see https://jira.brightcove.com/browse/EN-571 for details.)

If the policy key cannot be understood, return `404 Not Found` and
error code `INVALID_POLICY_KEY`.

## Standard policies

### Account restriction

A policy representing restriction of a player to a particular account
is spelled as "deny the call unless the account ID is X":

```js
{
  "pattern": {
    "!=": [
      "[request.params.account-id]",
      "8523" // account ID as a string
    ]
  },
  "effect": "deny"
}
```

Using the shorter key-data format, this is:
```json
{"account-id": "8523"}
```

### Domain restriction

A policy representing restriction of a player to a particular domain
is spelled as "deny the call unless the request domain lies in a
list":

```json
[{"pattern": {
    "not-contains?": [
      ["http://www.safaribooksonline.com",
        "https://secure.safaribooksonline.com"
      ],
      "[request.domain]"
    ]
  },
  "effect": "deny"}]
```

However, the policy key API insists that the effect of policies on a
key be provably limited to a single account.  This means that you
**cannot** get a policy key with just the policy above; you will get
an authorization failure.  You must restrict access to your account
**and** the domains in question, which means you need to ask for a
policy set like this on the key:

```json
[{"pattern": {"!=": ["[request.params.account-id]", "8523"]},
  "effect": "deny"},
 {"pattern": {
    "not-contains?": [
      ["http://www.safaribooksonline.com", "https://secure.safaribooksonline.com"],
      "[request.domain]"
    ]
  },
  "effect": "deny"}]
```

Using the shorter key-data format, this is:
```
{"account-id": "8523",
 "allowed-domains": [
  "http://www.safaribooksonline.com",
  "https://secure.safaribooksonline.com"]}
```

## Example calls

The example key strings below were created in the Griffin QA
environment and will remain good there.

To get a policy key representing "deny the call unless the account ID
is 8523": (The Cathy token must grant `video-cloud/player/create` on
account 8523.)

```
cjeris-retina:wedge cjeris$ curl -i -k -H 'Authorization: Bearer <cathy-token>' -H 'Content-Type: application/json' -d '{"policy": {"pattern": {"!=": ["[request.params.account-id]", "8523"]}, "effect": "deny"}}' https://cms.api.qa.brightcove.com/v1/accounts/8523/policy_keys
HTTP/1.1 200 OK
Content-Type: application/json; charset=UTF-8
Server: Jetty(9.1.z-SNAPSHOT)
X-Originating-URL: https://cms.api.qa.brightcove.com/v1/accounts/8523/policy_keys
X-Zuul: zuul
X-Zuul-Filter-Executions: Routing[SUCCESS][0ms], PreDecoration[SUCCESS][1ms], WedgeFilter$infra-http-method-filter$3ef5ff27[SUCCESS][0ms], WedgeFilter$nomic-direct-path-filter$b5e216a7[SUCCESS][0ms], HystrixFilter[SUCCESS][50ms]
X-Zuul-instance: i-da508c88
Content-Length: 221
Connection: keep-alive

{"key-string":"BCpkABErCLfgjOMWMsi4TnOqsMVdYKVqhqr5aSxtw3GzttCQiy4nvmKgMfRLAmICS4HoQsqTOuxADwVzmFmbnqf_yx8uk4qyKbT0MyaZ-oJqqe4gbID0ENiHu74","policy":[{"pattern":{"!=":["[request.params.account-id]","8523"]},"effect":"deny"}]}
```

To get a policy key representing "always deny the call": (Nothing is
demanded of this access token.)

```
cjeris-retina:wedge cjeris$ curl -i -k -H 'Authorization: Bearer <cathy-token>' -H 'Content-Type: application/json' -d '{"policy": {"pattern": {"always-match": []}, "effect": "deny"}}' https://cms.api.qa.brightcove.com/v1/accounts/8523/policy_keys
HTTP/1.1 200 OK
Content-Type: application/json; charset=UTF-8
Server: Jetty(9.1.z-SNAPSHOT)
X-Originating-URL: https://cms.api.qa.brightcove.com/v1/accounts/8523/policy_keys
X-Zuul: zuul
X-Zuul-Filter-Executions: Routing[SUCCESS][1ms], PreDecoration[SUCCESS][0ms], WedgeFilter$infra-http-method-filter$3ef5ff27[SUCCESS][0ms], WedgeFilter$nomic-direct-path-filter$b5e216a7[SUCCESS][0ms], HystrixFilter[SUCCESS][38ms]
X-Zuul-instance: i-d497b284
Content-Length: 198
Connection: keep-alive

{"key-string":"BCpkABErCLddwgtbHeOj-r_qlVr9EZW5fC44g3DmfnXytwgAxpnraDNTEfBx79794enMNMmUP_W1m5xB3Ag7jzWlqX8NrcPWeNMqfJP51kYW3FBDpVn6XXztePg","policy":[{"pattern":{"always-match":[]},"effect":"deny"}]}
```
