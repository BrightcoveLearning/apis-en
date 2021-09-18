var BCLS_dimensions = (function(window, document, aapi_model) {
  var header = document.querySelector('h1'),
    dimension = header.getAttribute('data-dimension'),
    dimensionRequest = document.getElementById('dimensionRequest'),
    filterRequest = document.getElementById('filterRequest'),
    responseEl = document.getElementById('response'),
    sendDimensionRequest = document.getElementById('sendDimensionRequest'),
    sendFilterRequest = document.getElementById('sendFilterRequest'),
    dimensionObj = aapi_model.dimensions[dimension],
    proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy-v2.php'
  account_id = '1752604059001';

  /**
   * determines whether specified item is in an array
   *
   * @param {array} array to check
   * @param {string} item to check for
   * @return {boolean} true if item is in the array, else false
   */
  function arrayContains(arr, item) {
    var i,
      iMax = arr.length;
    for (i = 0; i < iMax; i++) {
      if (arr[i] === item) {
        return true;
      }
    }
    return false;
  }

  /**
   * disable a field or control
   * @param {HTMLelement} e the element to disable
   */
  function disable(e) {
    e.setAttribute('style', 'opacity:.5;cursor:not-allowed;');
  }


  /**
   * handler for API request responses
   */
  function apiCallback(response) {
    var responseParsed = JSON.parse(response);
    responseEl.textContent = JSON.stringify(responseParsed, null, '  ');
  }

  /**
   * Builds the API requests and handles responses
   * @param {String} type the request type (getCount | getVideos | getAnalytics)
   */
  function buildRequest(type) {
    var options = {};
    options.proxyURL = proxyURL;
    options.account_id = account_id;
    switch (type) {
      case 'dimension':
        options.url = dimensionObj.samples[0].dimension;
        makeRequest(options, apiCallback);
        break;
      case 'filter':
        options.url = dimensionObj.samples[1].filter;
        makeRequest(options, apiCallback);
        break;
    }
  }

  /**
   * send API request to the proxy
   * @param  {Object} options for the request
   * @param  {String} options.url the full API request URL
   * @param  {String="GET","POST","PATCH","PUT","DELETE"} requestData [options.requestType="GET"] HTTP type for the request
   * @param  {String} options.proxyURL proxyURL to send the request to
   * @param  {String} options.client_id client id for the account (default is in the proxy)
   * @param  {String} options.client_secret client secret for the account (default is in the proxy)
   * @param  {JSON} [options.requestBody] Data to be sent in the request body in the form of a JSON string
   * @param  {Function} [callback] callback function that will process the response
   */
  function makeRequest(options, callback) {
    var httpRequest = new XMLHttpRequest(),
      response,
      requestParams,
      dataString,
      proxyURL = options.proxyURL,
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
     * the proxy used here takes the following request body:
     * JSON.stringify(options)
     */
    // set response handler
    httpRequest.onreadystatechange = getResponse;
    // open the request
    httpRequest.open('POST', proxyURL);
    // set headers if there is a set header line, remove it
    // open and send request
    httpRequest.send(JSON.stringify(options));
  }

  // event listeners
  sendDimensionRequest.addEventListener('click', function() {
    buildRequest('dimension');
  });

  sendFilterRequest.addEventListener('click', function() {
    buildRequest('filter');
  });


})(window, document, aapi_model);
