var BCLS = (function(window, document) {
  // account info
  const use_my_account = document.getElementById('use_my_account'),
      basic_info    = document.getElementById('basic_info'),
      account      = document.getElementById('account'),
      cid          = document.getElementById('cid'),
      secret       = document.getElementById('secret'),
      get_videos   = document.getElementById('get_videos'),
    // value below is for BrightcoveLearning
    // default client id and secret should be stored in the proxy
      default_account_id = '57838016001',
    // request and response display elements
    apiRequest         = document.getElementById('apiRequest'),
    requestData        = document.getElementById('requestData'),
    results            = document.getElementById('results');
    // for input fields
    let  videos_array = [],
      fields_array = [
        {
          name: 'custom_fields',
          type: 'object',
          properties: [
            'field_name',
            'value'
          ]
        },
        {
          name: 'description',
          type: 'string'
        },
        {
          name: 'link',
          type: 'object',
          properties: [
            'text',
            'url'
          ]
        },
        {
          name: 'long_description',
          type: 'string'
        },
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'tags',
          type: 'array'
        },
        'tags'
      ],

    // data objects
    updateData = {},
    client_id,
    client_secret,
    account_id,
    video_id;

  // set event listeners
  use_my_account.addEventListener('click', function() {
    if (basic_info.getAttribute('style') === 'display:none;') {
      basic_info.setAttribute('style', 'display:block;');
      use_my_account.textContent = 'Use Sample Account';
    } else {
      basic_info.setAttribute('style', 'display:none;');
      use_my_account.textContent = 'Use My Account Instead';
    }
  });

  addCue.addEventListener('click', function() {
    var cue            = {};
        cue.name       = name.value;
        cue.type       = getSelectedValue(type).value;
        cue.time       = parseFloat(time.value);
        cue.metadata   = metadata.value;
        cue.force_stop = isChecked(force_stop);
    updateData.cue_points.push(cue);
    name.value              = '';
    time.value              = '';
    metadata.value          = '';
    addCue.textContent      = 'Add Another Cue Point';
    requestData.textContent = JSON.stringify(updateData, null, '  ');
  });

  setRequest.addEventListener('click', function() {
    // get or set values for the request
    if (account.value) {
      account_id = account.value;
    } else {
      account_id = default_account_id;
    }
    if (cid.value) {
      client_id = cid.value;
    }
    if (secret.value) {
      client_secret = secret.value;
    }
    video_id = getSelectedValue(video).value;
    createRequest('updateVideo');
  });


  get_videos.addEventListener('click', function() {
    if (account.value && cid.value && secret.value) {
      account_id    = account.value;
      client_id     = cid.value;
      client_secret = secret.value;
      createRequest('getVideos');
    } else {
      alert('The account id, client id, and client secret are required if you wish to use your own account');
    }
  });


  /**
   * tests for all the ways a variable might be undefined or not have a value
   * @param {*} x the variable to test
   * @return {Boolean} true if variable is defined and has a value
   */
  function isDefined(x) {
    if (x === '' || x === null || x === undefined) {
      return false;
    }
    return true;
  }

  /**
   * remove spaces from a string
   * @param {String} str string to process
   * @return {String} trimmed string
   */
  function removeSpaces(str) {
    str = str.replace(/\s/g, '');
    return str;
  }

  /**
   * disables all buttons so user can't submit new request until current one finishes
   */
  function disableButtons() {
    var i,
      iMax = allButtons.length;
    for (i = 0; i < iMax; i++) {
      allButtons[i].setAttribute('disabled', 'disabled');
    }
  }

  /**
   * re-enables all buttons
   */
  function enableButtons() {
    var i,
      iMax = allButtons.length;
    for (i = 0; i < iMax; i++) {
      allButtons[i].removeAttribute('disabled');
    }
  }

  /**
   * get selected value for single select element
   * @param {htmlElement} e the select element
   * @return {Object} object containing the `value`, text, and selected `index`
   */
  function getSelectedValue(e) {
    var selected = e.options[e.selectedIndex],
        val      = selected.value,
        txt      = selected.textContent,
        idx      = e.selectedIndex;
    return {
      value: val,
      text : txt,
      index: idx
    };
  }

  /**
   * determines if checkbox is checked
   * @param  {htmlElement}  e the checkbox to check
   * @return {Boolean}  true if box is checked
   */
  function isChecked(e) {
    if (e.checked) {
      return true;
    }
    return false;
  }

  /**
   * createRequest sets up requests, send them to makeRequest(), and handles responses
   * @param  {string} type the request type
   */
  function createRequest(type) {
    var options    = {},
        cmsBaseURL = 'https://cms.api.brightcove.com/v1/accounts/' + account_id,
      endpoint,
      responseDecoded,
      i,
      iMax,
      el,
      txt;
    // set credentials and proxy url
    // if no client id and secret entered, let the proxy use defaults
    if (cid.value.length > 0 && secret.value.length > 0) {
      options.client_id     = cid.value;
      options.client_secret = secret.value;
    }
    options.proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy-v2.php';

    switch (type) {
      case 'getVideos':
        endpoint            = '/videos?q=playable:true&limit=20';
        options.url         = cmsBaseURL + endpoint;
        options.requestType = 'GET';
        makeRequest(options, function(response) {
          responseDecoded = JSON.parse(response);
          // add options to the video selector
          if (Array.isArray(responseDecoded)) {
            // remove existing options
            iMax = video.length;
            for (i = 0; i < iMax; i++) {
              video.remove(i);
            }
            // add new options
            iMax = responseDecoded.length;
            for (i = 0; i < iMax; i++) {
              el = document.createElement('option');
              el.setAttribute('value', responseDecoded[i].id);
              if (i === 0) {
                el.setAttribute('selected', 'selected');
              }
              txt = document.createTextNode(responseDecoded[i].name);
              el.appendChild(txt);
              video.appendChild(el);
            }
          }
        });
        break;
      case 'updateVideo':
        endpoint                = '/videos/' + video_id;
        options.url             = cmsBaseURL + endpoint;
        options.requestType     = 'PATCH';
        options.requestBody     = JSON.stringify(updateData);
        apiRequest.textContent  = options.url;
        requestData.textContent = JSON.stringify(updateData, null, '  ');
        makeRequest(options, function(response) {
          responseDecoded     = JSON.parse(response);
          results.textContent = JSON.stringify(responseDecoded, null, '  ');
        });
        break;
        // additional cases
      default:
        console.log('Should not be getting to the default case - bad request type sent');
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
     * JSON.strinify(options)
     */
    // set response handler
    httpRequest.onreadystatechange = getResponse;
    // open the request
    httpRequest.open('POST', proxyURL);
    // set headers if there is a set header line, remove it
    // open and send request
    httpRequest.send(JSON.stringify(options));
  }


  function init() {
    // array for cue point data
    updateData.cue_points = [];
    // initially get videos from BrightcoveLearning account
    account_id = default_account_id;
    createRequest('getVideos');
  }

  init();


})(window, document);

