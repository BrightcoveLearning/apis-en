# Cross-origin proxy

By default, Wedge serves a [cross-origin proxy][ie9-proxy] at
`/cross-origin-proxy.html` to support browsers that do not have
standard CORS, such as Internet Explorer 9. This may be disabled for an entire instance by setting
`cors-proxy.enabled` to false.

[ie9-proxy]: https://bithub.brightcove.com/videocloud/ie9_proxy

The latest version of the proxy is injected into Wedge at build time.
