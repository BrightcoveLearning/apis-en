import httplib, urllib, base64, json, sys


class AuthError(Exception):
    def __init__(self):
        self.msg = "auth error"

# read the oauth secrets from a file
def loadSecret():
  # read the s3 creds from json file
    try:
        credsFile=open('brightcove_oauth.txt')
        creds = json.load(credsFile)
        return creds
    except Exception, e:
		print "Error loading oauth secret from local file called 'brightcove_oauth.txt'"
		print "\tThere should be a local file in this directory called brightcove_oauth.txt "
		print "\tWhich has contents like this:"
		print """
	
		{
		"client_id": "f65faf61-e370-4640-72d9-7e67z34fa8b",
		"client_secret": "KyqYqgbdpgc313lNQPO1O2322vRVLsU7lZdjkWgPTdsWzV9zI1gixGQNk7Clb123ZuTIx5oNHMjq4mTwzMEKjAtzg3tyA+r09zm"
		}
	
		"""

		sys.exit("System error: " + str(e) );


# get the oauth 2.0 token
def getAuthToken(creds):
	
    conn = httplib.HTTPSConnection("oauth.brightcove.com")
	
    url =  "/v3/access_token"
	
    params = {
		"grant_type": "client_credentials"
    }
	
    client = creds["client_id"];
    client_secret = creds["client_secret"];
	
    authString = base64.encodestring('%s:%s' % (client, client_secret)).replace('\n', '')
	
    requestUrl = url + "?" + urllib.urlencode(params)
	
    headersMap = {
		"Content-Type": "application/x-www-form-urlencoded",
		"Authorization": "Basic " + authString
    };
	
    conn.request("POST", requestUrl, headers=headersMap)
	
    response = conn.getresponse()
	
    if response.status == 200:
        data = response.read()
        result = json.loads( data )
		
        return result["access_token"]


# call analytics api for video views in the last 30 days
def getVideoViews( token ):

    conn = httplib.HTTPSConnection("data.brightcove.com")
	
    url =  "/analytics-api/videocloud/account/2632443407001/report/"
	
    params = {
		"dimensions": "video",
		"limit": "10",
		"sort": "video_view",
		"fields": "video,video_name,video_view",
		"format": "json"
    }
	
    requestUrl = url + "?" + urllib.urlencode(params)
	
    headersMap = {
        "Authorization": "Bearer " + token
    };
	
    conn.request("POST", requestUrl, headers=headersMap)
	
    response = conn.getresponse()
	
    if response.status == 200:
        data = response.read()
        result = json.loads( data )
        return result
    elif response.status == 401:
        # if we get a 401 it is most likely because the token is expired.
        raise AuthError
    else:
        raise Exception('API_CALL_ERROR' + " error " + str(response.status) )

		
def demo():

    creds = loadSecret()
    token = getAuthToken(creds)
  
    try:
        results = getVideoViews( token )
    except AuthError, e:
        # handle an auth error by re-fetching a auth token again
        token = getAuthToken(creds)
        results = getVideoViews( token )

    # print the video views
    print results
     
if __name__ == "__main__":  
  demo();

