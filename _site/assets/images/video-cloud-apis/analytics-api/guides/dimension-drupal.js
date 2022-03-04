var BCLS_dimensions = (function(window, document, aapi_model) {
  var header = document.querySelector('article.bcls-article'),
    dimension = header.getAttribute('data-dimension'),
    description = document.getElementById('description'),
    paramTableBody = document.getElementById('paramTableBody'),
    fields = document.getElementById('fields'),
    filters = document.getElementById('filters'),
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
   * add the dimension description
   */
  function addDescription() {
    description.textContent = dimensionObj.description;
  }

  /**
   * inject the url param table
   */
  function addURLParams() {
    var param,
      thisParam,
      tr,
      td,
      txt,
      code,
      frag = new DocumentFragment();
    for (param in aapi_model.urlparams) {
      if (arrayContains(dimensionObj.urlparams, param)) {
        thisParam = aapi_model.urlparams[param];
        tr = document.createElement('tr');
        td = document.createElement('td');
        code = document.createElement('code');
        txt = document.createTextNode(param);
        tr.appendChild(td);
        code.appendChild(txt);
        td.appendChild(code);
        td = document.createElement('td');
        txt = document.createTextNode(thisParam.description);
        tr.appendChild(td);
        td.appendChild(txt);
        td = document.createElement('td');
        if (thisParam.required) {
          txt = document.createTextNode('yes');
        } else {
          txt = document.createTextNode('no');
        }
        tr.appendChild(td);
        td.appendChild(txt);
        td = document.createElement('td');
        txt = document.createTextNode(thisParam.values);
        tr.appendChild(td);
        td.appendChild(txt);
        td = document.createElement('td');
        txt = document.createTextNode(thisParam.default);
        tr.appendChild(td);
        td.appendChild(txt);
        frag.appendChild(tr);
      }
    }
    paramTableBody.appendChild(frag);
  }

  /**
   * inject the field values
   */
  function addFieldValues() {
    var i,
      iMax,
      li,
      txt,
      code,
      frag = new DocumentFragment();
    iMax = dimensionObj.fields.length;
    for (i = 0; i < iMax; i++) {
      li = document.createElement('li');
      code = document.createElement('code')
      txt = document.createTextNode(dimensionObj.fields[i]);
      code.appendChild(txt);
      li.appendChild(code);
      frag.appendChild(li);
    }
    fields.appendChild(frag);
  }

  /**
   * inject the filter values
   */
  function addFilterValues() {
    filters.textContent = 'Filter values: ' + dimensionObj.filter_values.join(', ');
  }

  /**
   * inject the sample requests
   */
  function addSampleRequests() {
    dimensionRequest.textContent = dimensionObj.samples[0].dimension;
    filterRequest.textContent = dimensionObj.samples[1].filter;
    if (dimensionObj.samples[1].filter == 'Not applicable') {
      disable(sendFilterRequest);
      sendFilterRequest.removeEventListener('click', function() {
        buildRequest('filter');
      });
    }
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

  function init() {
    addDescription();
    addURLParams();
    addFieldValues();
    addFilterValues();
    addSampleRequests();
  }

  init();


})(window, document, aapi_model);
