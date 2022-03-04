# Video policy key API

The video policy key API is a public API used by BC developers and customer users to create and
manipulate video policy keys, which are persistent semi-secret tokens used to control what
resources a player is allowed to access.

## Policy key format

A policy key string consists of the fixed four-byte string `"BCpk"`, followed by a base-64
encoded encrypted string.

The unencrypted form of the encrypted content contains, in order:
* The single byte `"1"`, where the 1 denotes version 1 of the key format
* Exactly 16 random bytes (128 bits of entropy)
* The JSON SMILE representation of a map, whose contents are described below

This data is then encrypted using Keyczar's AES+HMAC-SHA1, and the result is base-64 encoded.
There is a single common encryption key shared between nomic-server and wedge-server.  Should
it be necessary to do so, we can rotate this key (without decomissioning existing keys) using
Keyczar's keystore management.

Permissible contents of the map are currently as follows:
* `{"always": "<effect>"}` where `<effect>` is either `allow` or `deny`.  This represents a
  trivial policy that either always allows or always denies the request, and can be interpreted
  locally to wedge (subject to revocation checks).
* `{"account-id": "<id>"}` where `<id>` is a string although generally all digits.  This
  represents the policy "if request account ID is not equal to `<id>`, deny", and can
  be interpreted locally to wedge (subject to revocation checks).
* `{"allowed-domains": [<domain>*]}`, where each `<domain>` is a domain string (in the
  sense of the CORS `Origin` header). This represents a policy which will deny access
  unless the player sends an `Origin` header with a value belonging to the list.
* **not yet** `{"video-id": "<id>"}` where `<id>` is a string although generally all digits.
  This represents the policy "if request video ID is not equal to `<id>`, deny", and
  can be interpreted locally to wedge (subject to revocation checks).
* **not yet** `{"policy-id": "<uuid>"}`, where `<uuid>` is the string representation of a UUID.  This
  represents the policy whose id is <uuid>, and requires a nomic-server query to interpret.

Note that this is a description of the data _encoded on_ policy keys, not a description of the
data you supply to create them.  To create a policy key with an explicit policy you need to
supply that policy either in this format or the standard format described in [the policy API doc](policy.md).

## Authorization criteria

In order to create a policy key that grants access to metadata on a particular publisher ID,
you must present an OAuth token authorizing the operation `video-cloud/player/create` against
that publisher ID.  This means that in practice policy keys that grant access to all videos
across publishers are not obtainable.

**NOTE**: Policy keys that grant access to a specific _video_ ID, as opposed to _account_ ID,
are temporarily unimplemented, and will reappear once we have a good way to verify the account
the video belongs to against a Cathy token.

## Example calls

The example key strings below were created in the Griffin QA environment and will remain good
there.

To get a policy key representing "deny the call unless the account ID is 8523":  (The Cathy
token must grant `video-cloud/player/create` on account 8523.)
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

To get a policy key representing "always deny the call":  (Nothing is demanded of this access token.)
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

## Standard policies

### Account restriction

A policy representing restriction of a player to a particular account is spelled as "deny the
call unless the account ID is X":

```
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
```
{"account-id": "8523"}
```

### Domain restriction

A policy representing restriction of a player to a particular domain is spelled as "deny the
call unless the request domain lies in a list":

```
{
  "pattern": {
    "not-contains?": [
      "[request.domain]",
      [
        "http://www.safaribooksonline.com",
        "https://secure.safaribooksonline.com"
      ]
    ]
  },
  "effect": "deny"
}
```

However, the policy key API insists that the effect of policies on a key be provably limited
to a single account.  This means that you **cannot** get a policy key with just the policy
above; you will get an authorization failure.  You must restrict access to your account **and**
the domains in question, which means you need to ask for a policy set like this on the key:

```
[
  {
    "pattern": {
      "!=": [
        "[request.params.account-id]",
        "8523" // account ID as a string
      ]
    },
    "effect": "deny"
  },
  {
    "pattern": {
      "not-contains?": [
        [
          "http://www.safaribooksonline.com",
          "https://secure.safaribooksonline.com"
        ],
        "[request.domain]"
      ]
    },
    "effect": "deny"
  }
]
```

Using the shorter key-data format, this is:
```
{"account-id": "8523",
 "allowed-domains" [
  "http://www.safaribooksonline.com",
  "https://secure.safaribooksonline.com"]}
```

## API reference

The API root path is `/v1/accounts/:account-id/policy_keys`, where `:account-id` is a BC
account ID which scopes access to policy objects.  (Eventually we may choose to control access
to policy objects using security principals other than BC accounts, and we may then provide
URLs of other structure.)  Under this root path:

* **not for policy-id key-strings**
  `GET /:key-string` returns (200 OK) the policy key whose key-string representation is
  `:key-string`.
    * If no policy key of that key-string is found, return 404 Not Found.
* **not for policy-id key-strings**
  `POST /` creates a new policy key.
    * The POST body must be a JSON encoded form of a partial policy entity.  Acceptable formats
      are:
        * `{ "policy": <policy> }`, where <policy> is a policy object as described in
          [policy.md](policy.md).
        * `{ "policies": [<policy>*] }`, supplying a vector of policy objects.
        * **not yet** `{ "policy-id": "<policy-id>" }`, where <policy-id> is the UUID of a
          policy entity;
    * If required attributes are missing or invalid, return 400 Bad Request.
    * If successful, return (201 Created) the newly created policy key in the response body,
      as a JSON map.  It will be assigned a fresh policy key-string **key-string**, and its
      vector of policies will appear in the field **policy**.
* `PUT` and `PATCH` methods are not supported; the content of policy keys is immutable once
  they are created.
* **not yet**
  `GET /` returns (200 OK) an array containing all policy keys accessible through this account,
  in no particular order.
* **not yet**
  `DELETE /:key-string` revokes a policy key whose key-string is `:key-string`.
    * If no policy key of that key-string is found, return 404 Not Found.
    * Otherwise return (200 OK) `{"status":"success"}`.
