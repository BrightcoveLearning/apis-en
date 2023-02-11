# Policy format

Nomic's policy language supports both a full format (used internally)
and a limited, concise format (used for player policy keys.) Either
may be used to create keys, the concise format circumscribes the
allowable key policies using either format.

The key-data format is all that is needs to be documented for creating
currently supported policy keys.

## Concise policy format

Also known as the key-data format or short format, this is the format
used inside player policy keys. Only policies expressable in this
format are allowed on keys, and there are additional restrictions.

A *concise policy set* is a JSON object containing one or more
key-value pairs from the following list:

- `"account-id": <id>` where `<id>` is a customer account ID as a
  string (generally containing only digits.)  This represents the
  policy "if request account ID is not equal to `<id>`, deny the
  request".
- `"allowed-domains": [<domain>*]`, where each `<domain>` is a domain
  string (in the sense of the HTTP `Origin` header). This represents a
  policy which will deny access unless the player sends an `Origin`
  header with a value belonging to the list. This is not strong
  security but will deter casual re-use of players on other sites.
- `"always": "<effect>"` where `<effect>` is either `allow` or
  `deny`.  This represents a trivial policy that either always allows
  or always denies the request. This is sometimes used internally to
  nomic.

See the examples section for the expansions of these forms.

## Full policy format

The full policy format is more flexible and accordingly more
verbose. A policy in this format consists of a *pattern* and an
*effect*. A pattern is constructed of predicates, values, and
references to parts of a playback request (*context arguments*). An
effect tells nomic what happens if the pattern matches a request:
Allow, deny, or partially deny the request.

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
* `contains?` matches if its second argument belongs to the list given
  as the first argument.
* `not-contains?` matches if its second argument does not belong to
  the list given as the first argument.
* `adobe-tve-valid` and `!adobe-tve-valid` are used to implement Adobe
  TVE authentication. This is used internally.
* `ipv4-ranges-contain?` and `!ipv4-ranges-contain?` answer whether
  the second argument does or does not belong to the set of IPv4 address
  ranges described by the first argument. This is used internally.

### Predicate arguments

Arguments to policy predicates are either literal values, which are
represented as themselves in JSON format, or references to values in
the policy evaluation context.  This context is a nested hash, and
references are represented in the format `"[key1.key2.key3]"`, where
`[key1, key2, key3]` is a nested sequence of hash keys.  The available
keys will be defined over time in a BC developer document.

## Examples

Here is a standard policy set in concise format and then as an array
of full format policies:

```json
{"account-id": "8523",
 "allowed-domains": ["https://example.com"]}
```

```json
[{"pattern": {"!=": ["[request.params.account-id]", "8523"]},
  "effect": "deny"},
 {"pattern": {"not-contains?": [["https://example.com"], "[request.domain]"]},
  "effect": "deny"}]
```

Most users will only want the first policy, expressed in concise
format as `{"account-id": "8523"}`.

For completeness (and testing purposes), here is a policy set that
always denies access, again first in concise format and then in full
format:

```json
{"always": "deny"}
```

```json
[{"pattern": {"always-match": []},
  "effect": "deny"}]
```
