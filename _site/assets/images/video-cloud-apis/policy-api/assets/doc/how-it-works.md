# How it works

Nomic is a system for controlling access to video playback. It
produces *player policy keys* which are distributed with players
(either Brightcove-produced web players, customer DIY web players,
or SDK players), then
passed to Wedge Playback when a player attempts to fetch
metadata to play a video. Wedge Playback uses the policy engine to
determine whether the video request is allowed, denied, or partially
allowed (e.g. everything but sources.)

Keys are encrypted data. A key might look like:

`BCpkABErCLepAQxRK_gbFOgIdud60o15wO3QXdWZL9QMMh4wOOUEhnfKSJjGpOxd3G2TnkvcirKzZe7QBv_Bx1rDSMZKKb2WlZLK4MPjtJ2kelzhV8c4ZxpEohE`

and encode this:

`{"account-id": "8523"}`

which means "only allow playback for account 8523".

Customers can create player policy keys by using an OAuth2-protected API
or Brightcove internal services can call nomic-server directly.
Keys are generally created when a player is about to be published
or when creating an SDK player.

## Workflow

First, a player is provisioned with a player policy key. Later, the
player uses the key to play a video. Here's what these look like:

### Getting a policy key

In the usual situation, a Studio user creates a new player and
publishes it:

- Studio UI (in the user's browser) acquires an appropriate OAuth2
  token (`video-cloud/player/create` on the account.)
- Studio UI calls Players (`players.api.brightcove.com`) to create a
  player with the selected settings.
- Players service checks the OAuth2 token, translates the settings
  into Nomic policies, and calls the Nomic service to ask for a player
  policy key.
- Nomic confirms that the policies are valid, creates an encrypted
  player policy key, and returns it.
- Players includes the key in the published Brightcove Player.
- (Possible subsequent step: The customer extracts the key to use in
  their own custom player.)

Alternatively, a customer might be creating an SDK player:

- The customer uses their OAuth2 client to acquire an appropriate OAuth2
  token (`video-cloud/player/create` on the account.)
- The customer calls Wedge CMS (`cms.api.brightcove.com`) to create a
  player policy key with the policies they need.
- Wedge CMS checks the OAuth2 token and calls the Nomic service to ask
  for a player policy key. (This is simply an authorization gateway.)
- Nomic confirms that the policies are valid, creates an encrypted
  player policy key, and returns it.
- The customer includes the key in their application.

The differences here are that 1) the Studio + Players convert settings
into policies vs. the customer writing their own policies (see notes
below on safe policy generation), and 2) which service (Players
vs. Wedge CMS) checks authorization before calling the unprotected
nomic-server.

### Using a policy key

When an end-user tries to play a video, the following sequence occurs
for both web and app players. (This does not occur for pre-baked
players that include video asset URLs.)

- The player makes a request to Wedge Playback
  (`edge.api.brightcove.com`) asking for the video playback metadata
  and supplying the player policy key as a header.
- Wedge Playback asks Nomic for information on the video's account,
  including any policies derived from account settings (e.g. IP
  restrictions, TVE), decrypts the policy key to extract the policies
  in bears, and combines them into a single policy set.
- Wedge Playback uses an in-process nomic policy engine to analyze the
  policies. If needed it gathers further information from other
  services (e.g. from video metadata from Roebuck, geo-IP lookup from
  Quova). Then it uses the policy engine to determine an "effect":
  Allow, Deny, or Partial Deny.
- Wedge Playback either yields the metadata, denies the request, or
  yields a stripped-down version (e.g. without source URLs)
  respectively.
- If the player receives a Partial Deny due to TVE restriction, it can
  attempt to authenticate the user and make a second request to Wedge
  Playback with auth info.

Along with the effect, the nomic policy engine produces information
about what data it requested and looked at it in order to produce its
judgement. This can serve as something like an explanation for the
judgement, but it reveals information that an attacker could use in
order to try to bypass restrictions. Therefore, we currently do not
include this information in the response, although we may reevaluate
this decision in the future.

## A sample policy evaluation

As an example of how Nomic processes policies, let's see what happens
when an end-user tries to play a video from account 3162030207001,
which has TVE enabled.

Here's what the encrypted player policy key encodes:

```javascript
{"pattern": {"!=": ["[request.params.account-id]", "3162030207001"]},
 "effect": "deny"}
```

...meaning "if the account of the requested video does not match, deny
the request."  And here's what nomic-server tells the Wedge Playback
server when it asks about the account:

```javascript
[{"pattern": {"=": ["[request.params.account-id]", "3162030207001"]},
  "effect": "allow"},
 {"pattern": {"!adobe-tve-valid":["[tve.requestor-id]","[tve.resource-id]","[request.tve-auth-token]"]},
  "effect": {"partial-deny": ["sources"]}}]
```

There are two policies here. One is the standard Allow policy that
will permit playback if no Deny policies match: "If account matches,
allow." The second is synthesized from the TVE setting. It tests if
the provided TVE authentication data (possibly missing) is valid, and
if not, will deny just the video source URLs part of the playback
response.

### Digression: How does nomic evaluate these?

Wedge Playback builds up a map of all possible context keys (the
things in brackets such as `[request.params.account-id]`) to
Observables that will fetch data for them. Then it passes this context
map to nomic along with the policy set and asks for a judgement.

Nomic's policy engine walks each policy and evaluates it recursively,
short-ciruiting as appropriate. When it reaches a context key it
requests the data and substitutes it into the policy; when it reaches
a predicate like `!adobe-tve-valid` it calls the relevant function. If
the pattern for a policy yields false, the policy does not match, and
the effect is ignored.

Finally, the effects of the matched policies are examined and a
decision is made: Any matching Deny policy overrides Partial Deny, and
Partial Deny overrides Allow. If there *aren't* any Allow policies
(for instance, no policies match) the result is a default Deny. This
effect is accompanied by a list of context keys that were inspected
and what data was found there.

Nomic tries hard to avoid evaluating any more than strictly
necessary. If an argument to the `and` predicate yields false, the
remaining arguments are not evaluated. Similarly, if a Deny is
matched, remaining policies are not evaluated. By this mechanism, it
is possible to deny a playback request without making unncessary calls
to backend servers. We'd rather deny a request based on a mismatched
account ID before asking the Quova service for a geo-IP lookup.

### Back to the example

On the first request, the user has likely not already authenticated
with TVE, so the two latter policies match, giving
[Allow, Partial-Deny sources]. They are shown the non-source video
metadata (title, thumbnail, etc.), are prompted to authenticate by the
player, and the second request comes in with valid auth, so only the
base policy matches: [Allow]. The full metadata is returned.

## Revocation

We do not yet support revocation, but may support revocation lists at
some point.
