## OAuth in Wedge
By default the OAuth authorization is applied by a pre filter called *oauth-pre-entry* in wedge. Currently the priority of this filter is 5000, so it should be the last pre filter to run.

### Enabling OAuth for your filter
- Write a pre filter that runs after the pre filter responsible for *characterization* of your API, but before the oauth pre filter is run.
- Implement the `shouldFilter` method to return true if you identify the request as belonging to your API (usually based on the context setup by your *characterization* step
- Implement the `run` method to set up the data required by the authorization filter when it runs. Specifically, you will need to implement something along the following lines:
```java
import wedge.util.oauth.Oauth; // this will change to OAuth from Oauth soon
import wedge.util.oauth.IdentityTypeEnum;
import wedge.util.oauth.OAuthStatus;
import java.util.Arrays;

private Object convertToLong (Object v) {
  if (v instanceof String) {
    try {
      return Long.valueOf(v);
    }
    catch (NumberFormatException e) {
      return v;
    }
  }
  return v;
}

public Object run() {
  context.set("oauth.check", true);
  if (null == context.get("myapi.account-id.i.had.extracted.earlier")) {
    context.set("oauth.status", OAuthStatus.UNAUTHORIZED);
    // set response status to 400 maybe?
    return;
  }
  Object identity = convertToLong(context.get("myapi.account-id.i.had.extracted.earlier"));
  Oauth.getInstance().setOauthScopeInContext(IdentityTypeEnum.VIDEOCLOUD, identity,
                                             Arrays.asList("video-cloud/player/write"), context);
}

```
- Either in the post filter of your API, or if you don't have one, then in a new post filter, do:
```java
public Object run() {
  if (context.get("oauth.status") != OAuthStatus.AUTHORIZED) {
    java.util.Map responseSuggestedByOAuthFilter =  context.get("oauth.request.response");
    context.setResponseStatusCode(responseSuggestedByOAuthFilter.get("status"));
    context.addZuulResponseHeader(responseSuggestedByOAuthFilter.get("header-name"),
                                  responseSuggestedByOAuthFilter.get("header-value"));
  }
  else {
    // do whatever you would do in case of an authorized request
  }
}
```
- You can also get your hands on the context **after** the oauth pre filter has run:
```java
import com.brightcove.cathy.core.AccessToken;
AccessToken token = context.get("oauth.access-token");
```


