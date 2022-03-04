# Writing Wedge API code

This is a place for questions and answers for people creating APIs inside of wedge.

## IntelliJ Setup

If you're using IntelliJ, you can either use `lein pom` to produce a maven `pom.xml` and import the project that way, but you'll run into problems between `lein pom` and `lien junit`, which interpret the `java-src` keyword in incompatible ways.

A better solution is to use the [cursive clojure](cursiveclojure.com) plugin, which allows IntelliJ to figure out the dependencies directly from the `project.clj`, and allows you to run leiningen goals directly.

## Java Setup

Currently, wedge will fail to run with java 1.7.0u60+.

You can install an older (e.g. 1.7.0u55) jre locally in `$HOME/opt` or somewhere else and tell leiningen to use it.

You control the java version that leiningen uses for its own process with `LEIN_JAVA_CMD`.

    export LEIN_JAVA_CMD=$HOME/opt/jdk1.7.0_55/bin/java

You also need to locally modify `project.clj` to specify the java version to use for projects.

    :java-cmd "/home/merickson/opt/jdk1.7.0_55/bin/java"

## API Registration

When writing an API, you need a pre-filter to "claim" a request.

This serves (atleast?) two purposes:

1. Provide metrics on requests handled by your API
2. Prevent the page-not-found handler from running, returning 404 to the user and aborting important, subsequent filters from executing.

You can do this by setting "wedge.api-match" with some value in the context in a pre-filter.

As an example, `POST /v1/accounts/8523/videos/12345/ingest-requsts` is handled by the pull-based ingest API, and stores the value "pull-based-ingest" under the key "wedge.api-match".

## Running tests

The most reliable way of testing is `lein test`.

## When to clean

*Question* When do I need to run `lein clean`?

## Response handling

When possible, use the helper methods provided by `WedgeFilter` (or its parent).

If you've claimed your request properly, there should be a response object in `getContext().getResponse()`.

*Question* at what point in the flow can I depend on a response being set in the context? post-pre?

You can also set the response body with `getContext().setResponseBody(String body)`.

Subsequent base filters handle the rest for you.

## Debugging

*Question* How do I run `lein test` under a debugger from Intellij?

## Changing Properties via JMX

If you want to change a setting via JMX on a running wedge instance, for instance, `mannheim.cdn.default.http`, use the following `jimmy.sh` command,

```
    nodeattr -n wedge-cms-api-server | xargs -t -I{} /usr/local/brightcove/jimmy/bin/jimmy.sh -h {}:34304 \
        -bean Config-com.netflix.config.jmx:class=BaseConfigMBean \
        -invoke getProperty -args mannheim.cdn.default.http

    nodeattr -n wedge-cms-api-server | xargs -t -I{} /usr/local/brightcove/jimmy/bin/jimmy.sh -h {}:34304 \
        -bean Config-com.netflix.config.jmx:class=BaseConfigMBean \
        -invoke updateProperty -args mannheim.cdn.default.http,newValue
```
