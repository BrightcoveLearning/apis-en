/**
 * send API request to the proxy
 * @param  {Object} requestData options for the request
 * @param  {String} requestData options.url the full API request URL
 * @param  {String="GET","POST","PATCH","PUT","DELETE"} requestData [options.requestType="GET"] HTTP type for the request
 * @param  {String} requestData [options.client_id] client id for the account (default is in the proxy)
 * @param  {String} requestData [options.client_secret] client secret for the account (default is in the proxy)
 * @param  {JSON} requestData [options.requestData] Data to be sent in the request body in the form of a JSON string
 * @param  {Function} [callback] callback function that will process the response
 */
function makeRequest(options, callback) {
    var httpRequest = new XMLHttpRequest(),
        response,
        requestParams,
        dataString,
        proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/clips-proxy.php',
        // response handler
        getResponse = function() {
            try {
                if (httpRequest.readyState === 4) {
                    if (httpRequest.status >= 200 && httpRequest.status < 300) {
                        response = httpRequest.responseText;
                        // some API requests return '{null}' for empty responses - breaks JSON.parse
                        if (response === '{null}') {
                            response = null;
                        }
                        // return the response
                        callback(response);
                    } else {
                        alert('There was a problem with the request. Request returned ' + httpRequest.status);
                    }
                }
            } catch (e) {
                alert('Caught Exception: ' + e);
            }
        };
    /**
     * set up request data
     * the proxy used here takes the following params:
     * url - the full API request (required)
     * requestType - the HTTP request type (default: GET)
     * clientId - the client id (defaults here to a Brightcove sample account value - this should always be stored on the server side if possible)
     * clientSecret - the client secret (defaults here to a Brightcove sample account value - this should always be stored on the server side if possible)
     * requestBody - request body for write requests (optional JSON string)
     */
    requestParams = "url=" + encodeURIComponent(options.url) + "&requestType=" + options.requestType;
    // only add client id and secret if both were submitted
    if (client_id.value && client_secret.value) {
        requestParams += '&client_id=' + clientId + '&client_secret=' + clientSecret;
    }
    // add request data if any
    if (options.requestData) {
        requestParams += '&requestData=' + options.requestData;
    }

    // set response handler
    httpRequest.onreadystatechange = getResponse;
    // open the request
    httpRequest.open('POST', proxyURL);
    // set headers
    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // open and send request
    httpRequest.send(requestParams);
}
