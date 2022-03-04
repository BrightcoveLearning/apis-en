# Policy API

The policy API is a public API used by BC developers and customer users to create and
manipulate policy objects.  There is no access control when called directly via nomic-server,
but the Wedge filters impose a requirement for a Cathy token for some calls.

Only a subset of the full policy format can be encoded as a [Video policy key](video-policy-key.md).

## Policy format

There are two policy formats used to create keys, the format described here which handles
all supported policies and the shorter key-data format that is use to encode the video policy
keys and only supports features that can be encoded in policy keys. It is described
in [the video policy key doc](video-policy-key.md).

The key-data format is all that is needs to be documented for creating currently supported
policy keys.

### Examples

Here is a policy that always denies access:

```json
{ "pattern": { "always-match": [] },
  "effect":  "deny" }
```

Here is a policy that allows access if the requested resource has video ID 6 under account ID
8523.  (Note that "video-id" policies are not yet supported.)

```json
{ "pattern":
  { "and":
    [ { "=": ["[request.params.account-id]", "8523"] },
      { "=": ["[request.params.video-id]", "6"] } ] },
  "effect": "allow" }
```

Using the shorter key-data format, this is:
```
{"account-id": "8523", "video-id": "6"}
```

### Grammar

The grammar of policies is as follows:

```
<policy>             ::= { "pattern": <pattern>, "effect": <effect> }
<effect>             ::= "allow" | "deny" | <partial-deny>
<partial-deny>       ::= { "partial-deny": [ <pd-scope-word>* ] }
<pd-scope-word>      ::= a string naming an attribute group to be restricted by partial deny

<pattern>            ::= <primitive-pattern> | <composite-pattern>

<primitive-pattern>  ::= { <predicate-name>: [ <predicate-arg>* ] }
<predicate-name>     ::= a string naming a primitive policy predicate (see below)
<predicate-arg>      ::= <value-arg> | <context-arg>
<value-arg>          ::= an arbitrary JSON value as a literal argument to a predicate
<context-arg>        ::= "[<context-path>]"
<context-path>       ::= <context-identifier> | <context-path>.<context-identifier>
<context-identifier> ::= /[a-z\-]+/

<composite-pattern>  ::= { <pattern-combiner>: [ <pattern>* ] }
<pattern-combiner>   ::= "and" | "or"
```

### Primitive predicates

Currently implemented primitive policy predicates are:

* `"always-match"` ignores all its arguments and always matches.
* `"never-match"` ignores all its arguments and never matches.
* `"="` matches if its arguments all have equal values.
* `"!="` matches if its arguments do not all have equal values.
* `contains?` matches if its first argument belongs to the list given as the second argument.
* `not-contains?` matches if its first argument does not belong to the list given as the second
argument.
* `adobe-tve-valid` and `!adobe-tve-valid` are used to implement Adobe TVE authentication.
* `ipv4-ranges-contain?` and `!ipv4-ranges-contain?` answer whether the first argument does
or does not belong to the set of IPv4 address ranges described by the second argument.

The following keywords are reserved and not allowed to be primitive policy predicate names:
`and`, `or`, `not`, `constant`.

### Predicate arguments

Arguments to policy predicates are either literal values, which are represented as themselves
in JSON format, or references to values in the policy evaluation context.  This context is a
nested hash, and references are represented in the format `"[key1.key2.key3]"`, where
`[key1, key2, key3]` is a nested sequence of hash keys.  The available keys will be defined
over time in a separate document.

## API

### policy_keys

The Nomic policy key api will encrypt and decrypt policy keys to be used with the Playback
api. This api returns (or takes) the encrypted key-string, it does not record the key
nor return an id to be used later.  (See the Server README.md for examples of usage.)

* `POST /v1/accounts/:account-id/policy_keys` creates an encrypted policy key and return it.
    * If required attributes are missing or invalid, return 400 Bad Request and an error-code and message.
    * If successful, return (200 Success) and the policy key-string and original policy
      The "key-string" value is what needs to be passed in with the Playback api requests.
    {"key-string":"BCpkABEr ... WhOo",
     "policy":[{"pattern":{"=":["[request.params.account-id]","8523"]},"effect":"allow"}]}

* `GET /v1/accounts/:account-id/policy_keys/<key-string>` returns (200 OK) and the
  decrypted policy value.
    * If cannot decrypt the policy key or it is illegal, return 404 Not Found and a message such as.
      [{"error_code":"INVALID_POLICY_KEY","message":"The policy key string supplied is not valid."}]


### policies api

NOTE: This section is not of the api is not yet implemented.

The plan is to support more complex policies that would be stored on the Nomic
server and referenced by its api with an id. For the first major release this is not supported.
Currently the Playback api supports policies that can be encoded in a Nomic policy
key or that can be constructed by account or video meta-data by the Playback api.

The API root path is `/v1/accounts/:account-id/policies`, where `:account-id` is a BC account
ID which scopes access to policy objects.  (Eventually we may choose to control access to policy
objects using security principals other than BC accounts, and we may then provide URLs of other
structure.)

Under this root path:

* **not yet**
  `GET /v1/accounts/:account-id/policies` returns (200 OK) an array containing all policies
  accessible through this account, in no particular order.
* **not yet**
  `GET /v1/accounts/:account-id/policies/:id-or-refid` returns (200 OK) the policy with
  id *or* refid given by `:id-or-refid`.
    * If no policy by that id or refid is found, return 404 Not Found.
* **not yet**
  `POST /v1/accounts/:account-id/policies` creates a new policy.
    * If required attributes are missing or invalid, return 400 Bad Request.
    * If successful, return (201 Created) the newly created policy in the `"result"` member.
      It will be assigned a randomly chosen UUID **id**.
* **not yet**
  `PUT /v1/accounts/:account-id/policies/:id-or-refid` or `PATCH /:id-or-refid` modify an existing policy.
    * If no policy by that id or refid is found, return 404 Not Found.
    * If a refid that identifies more than one policy is given, return 400 Bad Request.
    * If the modified entity is not valid, return 400 Bad Request.
    * Otherwise return (200 OK) the modified policy in the `"result"` member.
* **not yet**
  `DELETE /v1/accounts/:account-id/policies/:id-or-refid` deletes a policy.
    * If no policy by that refid is found, return 404 Not Found.
    * If a refid that identifies more than one policy is given, return 400 Bad Request.
    * Otherwise return (200 OK) `{"status":"success"}`.
