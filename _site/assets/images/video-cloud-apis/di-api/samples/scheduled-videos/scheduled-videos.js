var BCLS = ( function (window, document) {
    var fromDatePicker         = document.getElementById('fromDatePicker'),
        toDatePicker           = document.getElementById('toDatePicker'),
        account_id             = document.getElementById('account_id'),
        client_id              = document.getElementById('client_id'),
        client_secret          = document.getElementById('client_secret'),
        ingest_profile_display = document.getElementById('ingest_profile_display'),
        custom_profile_display = document.getElementById('custom_profile_display'),
        video_url              = document.getElementById('video_url'),
        video_name             = document.getElementById('video_name'),
        di_url                 = document.getElementById('di_url'),
        cms_url                = document.getElementById('cms_url'),
        di_submit              = document.getElementById('di_submit'),
        responseEl             = document.getElementById('responseEl'),
        profilesArray = ['videocloud-default-v1', 'high-resolution', 'screencast-1280', 'smart-player-transition', 'single-bitrate-high', 'audio-only', 'single-bitrate-standard'],
        name,
        video,
        default_video          = 'https://support.brightcove.com/test-assets/videos/greatblueheron.mp4',
        fromPicker,
        toPicker,
        video_id,
        account,
        cid,
        csec,
        starts_at,
        ends_at,
        profile,
        now                    = new Date(),
        // get the date part of the date-time string
        nowISO                 = now.toISOString().substr(0, 10);

    /**
     * tests for all the ways a variable might be undefined or not have a value
     * @param {*} x the variable to test
     * @return {Boolean} true if variable is defined and has a value
     */
    function isDefined(x) {
        if ( x === '' || x === null || x === undefined) {
            return false;
        }
        return true;
    }

    /**
     * get selected value for single select element
     * @param {htmlElement} e the select element
     * @return {Object} object containing the `value`, text, and selected `index`
     */
    function getSelectedValue(e) {
        var selected = e.options[e.selectedIndex],
            val = selected.value,
            txt = selected.textContent,
            idx = e.selectedIndex;
        return {
            value: val,
            text: txt,
            index: idx
        };
    }

    /**
     * createRequest sets up requests, send them to makeRequest(), and handles responses
     * @param  {string} type the request type
     */
    function createRequest(type) {
        var options    = {},
            cmsBaseURL = 'https://cms.api.brightcove.com/v1/accounts/' + account,
            diBaseURL  = 'https://ingest.api.brightcove.com/v1/accounts/' + account,
            endpoint,
            responseDecoded;


        // set credentials
        options.client_id     = cid;
        options.client_secret = csec;
        options.proxyURL      = 'https://solutions.brightcove.com/bcls/bcls-proxy/brightcove-learning-proxy.php';

        switch (type) {
            case 'createVideo':
                endpoint                               = '/videos';
                options.url                            = cmsBaseURL + endpoint;
                options.requestType                    = 'POST';
                options.requestBody                    = {};
                options.requestBody.name               = name;
                options.requestBody.schedule           = {};
                options.requestBody.schedule.starts_at = starts_at;
                if (isDefined(ends_at)) {
                    options.requestBody.schedule.ends_at = ends_at;
                }
                cms_url.textContent                     = JSON.stringify(options.requestBody, null, '  ');
                makeRequest(options, function(response) {
                    responseDecoded = JSON.parse(response);
                    responseEl.textContent = JSON.stringify(responseDecoded, null, '  ');
                    video_id = responseDecoded.id;
                    createRequest('ingestVideo');
                });
                break;
            // additional cases
            case 'ingestVideo':
            endpoint                       = '/videos/' + video_id + '/ingest-requests';
            options.url                    = diBaseURL + endpoint;
            options.requestType            = 'POST';
            options.requestBody            = {};
            options.requestBody.master     = {};
            options.requestBody.master.url = video;
            options.requestBody.profile    = profile;
            options.requestBody.callbacks  = ['https://solutions.brightcove.com/bcls/di-api/di-callbacks.php'];
            di_url.textContent                     = JSON.stringify(options.requestBody, null, '  ');


            makeRequest(options, function(response) {
                responseDecoded = JSON.parse(response);
                responseEl.textContent = 'Your request has been submitted - your Job ID is ' + responseDecoded.id;
            });
                break;
            default:
                console.log('Should not be getting to the default case - bad request type sent');
                break;
        }
    }

    /**
     * send API request to the proxy
     * @param  {Object} options for the request
     * @param  {String} options.url the full API request URL
     * @param  {String="GET","POST","PATCH","PUT","DELETE"} requestBody [options.requestType="GET"] HTTP type for the request
     * @param  {String} options.proxyURL proxyURL to send the request to
     * @param  {String} options.client_id client id for the account (default is in the proxy)
     * @param  {String} options.client_secret client secret for the account (default is in the proxy)
     * @param  {String} options.requestType HTTP type for the request
     * @param  {JSON} [options.requestBody] Data to be sent in the request body in the form of a JSON string
     * @param  {Function} [callback] callback function that will process the response
     */
    function makeRequest(options, callback) {
        var httpRequest = new XMLHttpRequest(),
            response,
            requestParams,
            dataString,
            proxyURL    = options.proxyURL,
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
        if (options.client_id && options.client_secret) {
            requestParams += '&client_id=' + options.client_id + '&client_secret=' + options.client_secret;
        }
        // add request data if any
        if (options.requestBody) {
            requestParams += '&requestBody=' + JSON.stringify(options.requestBody);
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

    // initialize
    function init() {
        var i,
            iMax = profilesArray.length,
            newOpt;
        // add date pickers to the date input fields
        fromPicker = new Pikaday({
          field: fromDatePicker,
          format: 'YYYY-MM-DD'
        });
        toPicker = new Pikaday({
          field: toDatePicker,
          format: 'YYYY-MM-DD'
        });
        // set initial from value
        fromDatePicker.value = nowISO;
        // add options for standard ingest profiles
        for (i = 0; i < iMax; i++) {
            newOpt = new Option(profilesArray[i]);
            ingest_profile_display.add(newOpt);
        }
        // add event listener for the submit button
        di_submit.addEventListener('click', function() {
            account = (isDefined(account_id.value)) ? account_id.value : '57838016001';
            cid = client_id.value;
            csec = client_secret.value;
            starts_at = fromDatePicker.value;
            ends_at = toDatePicker.value;
            if (isDefined(custom_profile_display.value)) {
                profile = custom_profile_display.value;
            } else {
                profile = getSelectedValue(ingest_profile_display).text;
            }
            video = (isDefined(video_url.value)) ? video_url.value : default_video;
            name = (isDefined(video_name.value)) ? video_name.value : video.substr(video.lastIndexOf('/') + 1);
            createRequest('createVideo');
        });
    }
    // call init to set things up
    init();

})(window, document);
