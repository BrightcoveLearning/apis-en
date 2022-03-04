# Playback API internals

## Overview

The playback API's general purpose is: given an account ID and video or playlist ID, find the
corresponding catalog metadata and source information in Roebuck and return it. This is subject
to the following constraints:

* metadata and source information require separate requests to Roebuck because they are stored
  as separate resources, and the results must be assembled into a single playback response;

* the playback API should return a stable response format which is not necessarily identical to
  (in particular, smaller than, since it omits unnecessary fields) the CMS API resource format;

* repeatable responses should be served from cache ("response caching") to save resources and
  improve response time;

* results of Roebuck calls should be cached ("object caching") to save load on Roebuck and
  improve response time;

* access to playback metadata (some or all) should be controlled by access policies imposed by
  the customer, such as player key constraints, georestriction, or TVE authentication;

* access controls should be applied as soon as possible to avoid making unnecessary back-end
  traffic.

The playback API currently contains an "old pipeline" and a "new pipeline", corresponding to
two distinct generations of code written as our understanding of the underlying design
evolved. The major differences are as follows:

* The new pipeline is close to a purely reactive model: most of it is evaluated by forcing an
  Observable at the end of a long chain of Observables. The old pipeline uses Observables for
  access policy evaluation but explicit waits and phase separation between filters to handle
  responses to back-end requests.

* The old pipeline knows explicitly what data are used to create policies and policy evaluation
  context data from what sources -- for instance, the fact that TVE policies come from the
  nomic-server account object is hard-coded, in the sense that the code that handles the
  account response from nomic-server explicitly knows that it has to inject a TVE policy into
  the evaluation engine. In the new pipeline knowledge of the sources for each restriction
  feature is confined to that feature's namespace within `wedge.api.player.restrict`, and the
  playback engine itself does not know what is coming from where when.

At present the single video API is implemented on the old pipeline, and the playlist API on the
new pipeline. The new pipeline has the ability (with some wiring changes) to support the single
video API as well, so in the future the single video API should be merged in and the old
pipeline retired.

## New pipeline

The new pipeline runs as follows. Namespaces listed in **bold** are shared with the old
pipeline. Error paths are elided below; within observables, errors are uniformly handled by
raising an `onError` which may carry with it a suggested response.

1. **`wedge.filters.api.player-catalog-api-pre/player-catalog-characterize-filter`**
  * Examine the request for basic syntactic issues (can we identify an account ID,
    video/playlist ID, policy key). If it passes, claim the request.
  * Populate the IDs and policy key from context into the cache under the `:nomic-video`
    prefix.
  * Compute the response cache key for this request and insert it into the context under
    `:cache.key`.

2. **`wedge.filters.cache-filters/cache-get-filter`**
  * Make a *synchronous* get request to Redis using the response cache key.
  * When the result arrives, see if it is a final response or not. Depending on the access
    policy applied to the resource, a response cache entry may have a partially evaluated
    policy object attached to it that needs to be fully applied before the response can be
    served, or the entry may be final and ready to send back.
    * If the response cache missed, just continue.
    * If the response cache hit with a final response, send it back, 200 OK, and mark the
      response as ready (short circuit the rest of the pipeline).
    * If the response cache hit with a non-final response (it needs policy evaluation), just
      place it into the context under `:cache.content`.

3. `wedge.api.player.playlist-route/playlist-routing-filter`
  * Construct and place into the context an observable which will yield a response to the
    playlist request. Unlike in the old pipeline, in the new pipeline the bulk of the API work
    is performed inside this observable; see
    [Playlist response observable](#playlist-response-observable) below.
    * If there is non-final response cache content in the context, this observable will perform
      the rest of the policy evaluation and yield a response from the cache entry.
    * Otherwise it will perform the necessary back-end requests and yield a fresh response.

4. `wedge.api.player.playlist-response/post-playlist-response-filter`
  * Force a result from the playlist response observable.
  * On success, yield the response.
    * Set downstream cache headers appropriately.
    * If we are instructed to do so, write the response content (and any collapsed policy set,
      if it is constant over the whole playlist) to Zuul context to be written to response
      cache.
  * On error, yield an appropriate error response.

5. **`wedge.filters.cache-filters/cache-put-filter`**
  * If we have a fresh entry to write back into the response cache, *synchronously* do so.

### Playlist response observable

The top-level playlist response observables are defined in
`wedge.api.player.observable.playlist`. They yield a map whose keys may include:

* `:response`, a map of `:status` and `:body` containing the HTTP response to send back
* `:downstream-cacheable`, a boolean indicating whether to attach HTTP headers permitting or
  forbidding caching of this response by consumers
* `:write-to-cache`, a boolean indicating whether this response content should be written to
  Wedge's response cache
* `:collapsed-policies`, a collapsed policy set for the entire playlist, in case the entire
  playlist shares a single policy set
* `:constant-policies`, a boolean indicating whether the collapsed policies are constant
  * if true, any response cache entry will be written *without* policies attached because no
    further policy evaluation is required
  * if false, any response cache entry will be written *with* policies attached because future
    requests for this playlist require some policy evaluation (for example, a common
    georestriction applies and must be evaluated against the request client IP).

These observables always emit exactly one item and then complete without error. In particular,
the `:response` member of a result from one of these observables should be something we can
yield directly as an HTTP response without further postprocessing, whether it be a success or
error response.

#### Journaling

Most things inside the playlist response pipeline write debug information to a journal which is
injected at the top level from the Zuul context. The API for journaling and some tools for
working with journals are defined in `bc-clj-common.journal`.

#### Restrictions

The namespace `wedge.api.player.restrict` and its children contain functions for harvesting
policies and context data to enforce playback restrictions. Each child namespace
`wedge.api.player.restrict.something` should describe one single restriction
feature. Restriction data and policies are separated into two phases, *request-wide* and
*resource-specific*, according as they apply to an entire request or to one specific video. A
given restriction feature may participate in both phases; for instance, georestriction operates
by comparing a video's georestriction policy (resource-specific) to the result of looking up
the request client IP in a GeoIP database (request-wide).

Note that the response from the account-data request to nomic-server becomes part of the
request-wide policy inputs, so the back-end request to nomic-server is *always* made (unless we
reject the request very early for some reason such as invalid policy key).

Knowledge of how any given restriction feature is encoded into request and resource data should
be localized in this namespace hierarchy. That is, nothing outside of this hierarchy should
know or care where we find the necessary data to enforce any given restriction policy, whether
it comes from the request, from nomic, from roebuck, or from elsewhere. The exposed API for
restrictions is:

* `request-wide-policy-inputs` extracts data from request and Zuul context to cover all data
  that might be used in policy evaluation. This exists to provide a mock point for testing,
  since we are not necessarily able to synthesize a real request when unit testing policy
  evaluation; instead we can provide a synthetic inputs map.
* `request-wide-context` yields the request-wide fraction of the policy evaluation context
  (this is a `nomic.core.context/PolicyContext`, which is more or less a map with a specialized
  API).
* `request-wide-policies` yields an Observable emitting all restriction policies available at
  the request-wide level.
* `resource-specific-context` combines a request-wide policy context, the request-wide inputs,
  and an individual video resource to yield the entire policy evaluation context for that
  resource.
* `resource-specific-policies` combines a request-wide policy Observable, the request-wide
  inputs, and an individual video resource to yield an Observable emitting all restriction
  policies which apply to that resource.

Thus, we carry out a policy evaluation of the request-wide policies against the request-wide
context, and if we obtain already a deny result, we need not make any back-end calls; otherwise
we must retrieve individual resources and compute their resource-specific policy sets to verify
that we can serve each resource.

#### Back-end calls with object caching

There is a fully Observable-encapsulated library for making back-end calls with object caching
contained in the namespaces under `wedge.backend`. http calls are made by `wedge.backend.call`
using the existing Ribbon version 1 http client (same as the old playback API pipeline); the
caching wrapper lives in `wedge.backend.cache`. Each of those namespaces has a large namespace
comment describing their interface. The namespace `wedge.backend.service` defines types for
service and resource metadata definitions, and then defines the base service and resource types
actually used by the playback API. Note that there are separate resources named `roebuck` and
`roebuck-playlist` in order to isolate calls to Roebuck from the single-video and playlist APIs
into separate resource pools, thus limiting load pressure from the (much heavier) playlist API.

The namespace `wedge.api.player.observable.backend` then defines wrappers around these resource
calls which unmarshal and marshal parameters into the format we need, impose any requirements
specific to the playback API (for instance, the query parameter `?playable_only=true`), and
interpret errors and exceptions thrown by the back-end observable into the error responses we
want to send from the playback API. The end result is that a resource function such as
`wedge.api.player.observable.backend/roebuck-playlist-metadata` yields an Observable which will
make an object-cached call to Roebuck's playlist metadata resource (i.e., it will only go to
Roebuck itself if the object cache doesn't have an up-to-date entry) and yield either the
desired object or an error with a suggested response attached which is appropriate for the
playback API.

The library `wedge.backend.*` is intended to be usable without change by other APIs within
Wedge (it needs a Java interface for non-Clojure callers); additional back-end service and
resource definitions may be added directly to the library in `wedge.backend.service` or added
elsewhere.

#### Un-response-cached case

If we are not evaluating response cache content but rather making real back-end calls, the
observable `wedge.api.player.observable.playlist/uncached-playlist-response` proceeds as
follows:

* `uncached-playlist-data-and-response`
  * Fetch account data from nomic-server (`nomic-account-requirements` back-end)
  * Compute request-wide inputs based on it, and a request-wide policy judgment based on those
    inputs and the policies from them and from nomic
  * If there is a request-wide deny response, yield that, otherwise proceed to:
* `resources-and-judgments`
  * Retrieve the metadata (`playlist-metadata`) and videos (`all-playlist-videos`) for the
    playlist from back-end
  * For each video in the videos, derive a resource-specific policy judgment
  * Yield a map containing the metadata and resources, with each resource paired with its
    policy judgment. This map is then passed to:
* `videos-with-sources-response`
  * Apply `resources-by-effect` to partition the resources by the judgment effect applied to
    each one (allow, deny, partial deny) and take the first N allowed or partial-denied ones,
    where N is the applicable playlist page size. Emitted videos are formatted into playback
    API output format (`convert-video`, `convert-images`) here.
  * For the allowed videos, apply `adjoin-sources-to-allowed-videos` to make a call to the
    Roebuck multisources backend, format the sources, and staple each set of sources to the
    video to which it belongs.
  * For the partial denied videos, annotate each one with an `error` element explaining its
    partial deny. (There is an assumption here that the only partial-deny scope that matters is
    `:sources`; right now this is true, but if this changes then partial-denied videos may need
    to have their sources retrieved under some circumstances too.)
  * For the denied videos, collect some error information so we can report it.
  * Examine the allowed and partial denied videos using `collapse-common-policies` to see if
    all the videos have the same policy set applied to them; if so, crunch it down in the same
    way as we do for single videos, so that it can be attached to a response cache entry.
    * The phrase we use here is "crunch at the stable fraction of the context", which means
      apply all policy context arguments which belong to the resource as opposed to the
      request, and then constant-fold the policy set as far as we can to eliminate redundancy.
  * Finally, feed all these pieces of data into `compose-response` which handles errors
    appropriately and formats everything into a nice HTTP response.

#### Response-cached case

If we are instead working from response cache content with a policy set attached, the
observable `cached-playlist-response` has a simpler job. The remaining policy data is extracted
from the cache entry and a judgment derived from it using the same request-wide inputs and
context as in the uncached case. Then the cached response is either returned or not.

## Old pipeline

In the old pipeline more processing stages are broken out into distinct filters and phases
which communicate among each other by writing values into distinct namespaces within the Zuul
context.

1. **`wedge.filters.api.player-catalog-api-pre/player-catalog-characterize-filter`**
  * As above.
  * In addition, set `nomic-video.check` to signal the `nomic-video-filters` filters to run.

2. `wedge.filters.nomic-video-filters/pre-nomic-request-check`
  * Create and insert into the context:
    * Observables which will be populated with policies originating from the nomic-server
      response for this account, from the resource, and from the request policy key
    * A policy context map containing observables which will be populated with the context data
      as it becomes available
    * A judgment observable which will eventually yield the result of policy evaluation
    * A collapsed-policy-set observable which may be used to generate a reduced policy set for
      attachment to a response cache entry
  * Populate these observables with the data we have in hand (account and video IDs, policy key
    policies)
  * If we already have a judgment at this point (for example, the policy key is for a different
    account from the requested resource account), set the derived judgment, the response
    computed from it, and the collapsed policy set into the context, and short circuit further
    evaluation (don't make back end requests).

3. **`wedge.filters.cache-filters/cache-get-filter`**
  * As above.

4. `wedge.api.player.player-catalog-api-route/player-catalog-routing-filter`
  * From our resource IDs and parameters, construct autorouting specs for three back-end calls:
    * to nomic-server, for account information;
    * to roebuck, for video metadata;
    * to roebuck, for video sources.
  * Place these specs into the context to be run by the gateway autorouter.

5. `wedge.http.gateway/wedge-gateway-autoroute-filter`
  * Read the autorouting specs from the context and interpret them using the back-end service
    configuration. For each spec, make a cached back-end request as follows:
    * Construct the spec's cache key and get an object cache entry from Redis;
    * if the cache hits and is fresh, yield that as the result;
    * if the cache hits and is stale, yield the result but initiate a cache updating request to
      the back-end in the background;
    * if the cache hits and is rancid, or misses, make a back-end request and use that as both
      the result and the updated cache entry.
  * Wait for all requests to complete or time out before proceeding (we do not wait for
    background cache updates on stale cache entries to complete). Place the results into
    Zuul context.

6. `wedge.api.player.player-catalog-api-nomic/post-player-nomic-data-filter`
  * Examine the responses yielded by the gateway autorouter. Derive all necessary policies and
    policy context data from them, and inject these into the observables which were placed into
    the context in step 2. (What gets populated will vary depending on whether we have a
    response cache entry with a partially applied policy on it, or are constructing a "fresh"
    policy evaluation context for a non-response-cached request.) At this point the judgment
    observable should complete.

7. `wedge.api.player.player-catalog-api-response/post-player-response-filter`
  * If we are yielding a response cache entry, check its policy judgment, and emit the cached
    response.
    * If the policy judgment contains a "partial deny" effect, we may redact some fields of the
      cached response content to comply with this effect (this occurs when, for instance, the
      response-cached object has a georestriction policy attached, and the current request
      fails the georestriction check).
  * If we are yielding a fresh response from back-end request content, then:
    * Check policy judgment and short-circuit to a deny response if we need to.
    * Combine back-end responses for video and sources, and format them into playback API
      response format (redacting many fields).  Apply any partial deny restrictions specified
      by the policy judgment.
    * If there were no partial deny restrictions, then construct a response cache entry from
      the formatted response and its collapsed policy set, and set it into the context to be
      written to response cache. (We don't want to response cache redacted responses -- we
      might then serve them to callers who shouldn't be redacted!)
  * Ensure that whatever response is emitted has appropriate downstream cache headers.

8. **`wedge.filters.cache-filters/cache-put-filter`**
  * As above.

## Performance issues

Policy evaluation involves a *lot* of Observables. For every video that has a full policy
evaluation run on it, there is some constant number of Observables created based on the number
of restriction features and the amount of wrapping that goes on in the engine. For a call to
the playlist API, this is multiplied by the number of videos in the playlist (unless the result
is response cached, but playlist responses cannot be response cached if the videos in the
playlist do not share an *identical* policy set).

When we did load testing on the single video API, we ramped up load to a certain extent and
then saw the server just completely break down into context switching hell. I don't have
concrete profiling results to prove this, but I expect the major contributor to this is
thrashing in the Rx reactor and that this problem will be exacerbated as load on the playlist
API scales up.

Because this issue is directly proportional to load and is located in wedge-server itself, not
in back-end services, we can mitigate it for a certain amount of time by spinning up more
wedge-playback instances.

I believe the right solution long-term is to convert the informal phase separation of policies
and policy context data (into request-wide and resource-specific phases) into a formal
separation. Everything that goes into the policy engine is an Observable because I wanted every
piece of data to be available and cause a collapse as soon as possible. But in actual practice
there aren't very many points in time at which we care about trying to cause a collapse --
"request-wide" and "resource-specific" are pretty much it. This means we don't actually need
*every* datum and *every* policy to inhabit its own Observable. The request-wide and
resource-specific policy judgments can be computed based on plain data, and the entire thing
lifted into an Observable as a shell around the entire policy computation, which is just
carried out using the data available in that phase.

## Requirements for pipeline fusion

In order to migrate the single video API to the new pipeline, an analogue for
`wedge.api.player.observable.playlist` is required. The content of
`wedge.api.player.observable.backend` and `wedge.api.player.restrict.*` should be usable more
or less unchanged, but one requires analogues of `uncached-playlist-response` and
`cached-playlist-response` which carry out the work of the present
`post-player-response-filter`. The code from the playlist observables needs to be essentially
rewritten (slimmed down quite a bit, in fact) because much of it is devoted to managing the
three-stage request flow (metadata, videos, multisources) and sorting the videos by individual
policy evaluations; in the single video case, of course there is only one policy evaluation to
be carried out.

The largest single piece of work will be in rewriting the single video and multifilter unit
tests, which presently depend quite closely on details of the single video API flow across
several filters. These tests are useful and we don't want to lose their coverage, but they are
closely coupled to the temporal separations in the old pipeline's filter setup.

## Future features

### Paging

We discussed providing next and previous links to do playlist pagination using pagination
tokens (that would refer to a particular video within a playlist, not a particular ordinal
position). This is a fairly big feature because of its implications for caching. As a stopgap
measure, we may choose to support larger maximum lengths on the playlists we return (possibly
chunking the Roebuck multisources requests into several to ease the load on an individual
Roebuck node and be more cacheable).

### Search

For feature parity with the old Gobbles playback/Media Read APIs, we need to support playback
based on search queries -- that is, submit a search query to Roebuck and yield one or several
videos based on the result. In the "several videos" case, this will look essentially like the
playlist API, just with a (suitably normalized) search query instead of a playlist ID as a
resource identifier and cache key. We haven't groomed this at all yet.
