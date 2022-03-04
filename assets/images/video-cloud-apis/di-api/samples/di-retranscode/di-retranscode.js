var BCLS = ( function (window, document) {
    var // CMS API stuff
        account_id_display = document.getElementById("account_id"),
        account_id,
        client_id_display = document.getElementById("client_id"),
        client_id,
        client_secret_display = document.getElementById("client_secret"),
        client_secret,
        ingest_profile_display = document.getElementById("ingest_profile_display"),
        ingest_profile,
        custom_profile_display = document.getElementById("custom_profile_display"),
        videoDataDisplay = document.getElementById("videoData"),
        // Dynamic Ingest API stuff
        profilesArray = ['videocloud-default-v1', 'high-resolution', 'screencast-1280', 'smart-player-transition', 'single-bitrate-high', 'audio-only', 'single-bitrate-standard'],
        di_url_display = document.getElementById("di_url"),
        di_submit_display = document.getElementById("di_Submit"),
        diURL = "https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy.php",
        response = document.getElementById("response"),
        videoData = [],
        totalVideos,
        videoNumber = 0,
        currentJobs = 0,
        t2,
        totalIngested = 0,
        defaults = {account_id: 57838016001,client_id: "37cd3c5d-6f18-4702-bfb6-4fbc1cd095f1",client_secret: "gLSQANqe6A2PzJce_6xA4bTNu844up5-CSrC-jxNfur4EaOgWKRcqq_GTxKjhMpPSflMdNEhFdBmNe0qsTIZSQ"},
        // functions
        isDefined,
        bclslog,
        logResponse,
        doIngest,
        submitRequest,
        setDIOptions,
        init;

    /**
     * Logging function - safe for IE
     * @param  {string} context - description of the data
     * @param  {*} message - the data to be logged by the console
     * @return {}
     */
    bclslog = function (context, message) {
        if (window.console && console.log) {
          console.log(context, message);
        }
        return;
    };


    // is defined
    isDefined = function(x){
        if (x !== "" && x !== null && x !== undefined){
            return true;
        } else{
            return false;
        }
    };
    // set options for the Dynamic Ingest API request
    setDIOptions = function () {
        var options = {},
            custom_profile_display_value = custom_profile_display.value;
        // get the ingest profile
        if (isDefined(custom_profile_display_value)) {
            ingest_profile = custom_profile_display_value;
        } else {
            ingest_profile = ingest_profile_display.options[ingest_profile_display.selectedIndex].value;
        }
        options.client_id = client_id;
        options.client_secret = client_secret;
        di_url_display.value = "https://ingest.api.brightcove.com/v1/accounts/" + account_id + "/videos/" + videoData[videoNumber].id + "/ingest-requests";
        options.requestBody = '{"master":{"use_archived_master": true },"profile":"' + ingest_profile + '"}';
        options.requestType = "POST";
        options.url = di_url_display.value;
        bclslog('options', options);
        // now submit the request
        submitRequest(options, diURL, "di");
    };
    // function to set the request
    logResponse = function (type, data) {
        response.textContent += type + ": " + data + ",\n";
    };

    // function to submit Request
    submitRequest = function (options, proxyURL, type) {
        var httpRequest = new XMLHttpRequest(),
            requestData,
            responseData,
            parsedData,
            getResponse = function () {
                try {
                    if (httpRequest.readyState === 4) {
                      if (httpRequest.status >= 200 && httpRequest.status < 300) {
                        logResponse(type, httpRequest.responseText);
                        responseData = httpRequest.responseText;
                        if (responseData.indexOf("error_code") < 0) {
                            // handle the response
                        totalIngested++;
                        logResponse("totalIngested", totalIngested);
                        if (videoNumber < totalVideos - 1) {
                            videoNumber++;
                            currentJobs++;
                            logResponse('Processing video number', videoNumber);
                            logResponse('Current jobs: ', currentJobs);
                            // if currentJobs is > 99, need to pause
                            if (currentJobs > 99) {
                                // reset currentJobs
                                currentJobs = 0;
                                // wait 30 min before resuming
                                t2 = setTimeout(setDIOptions, 1800000);
                            } else {
                                // pause to avoid CMS API timeouts
                                t2 = setTimeout(setDIOptions, 1000);
                            }
                        }
                    } else {
                        logResponse("DI", "Request failed; retrying video number: " + videoData[videoNumber].id);
                        videoNumber++;
                        // give proxy a second to rest
                        t2 = setTimeout(setDIOptions, 1000);
                    }

                      } else {
                        alert("There was a problem with the request. Request returned " + httpRequest.status);
                      }
                    }
                  }
                  catch(e) {
                    alert('Caught Exception: ' + e);
                  }
            };
        bclslog('options', options);
        // set up request data
        requestData = "client_id=" + options.client_id + "&client_secret=" + options.client_secret + "&url=" + encodeURIComponent(options.url) + "&requestBody=" + encodeURIComponent(options.requestBody) + "&requestType=" + options.requestType;
        // set response handler
        httpRequest.onreadystatechange = getResponse;
        // open the request
        httpRequest.open("POST", proxyURL);
        // set headers
        httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        // open and send request
        httpRequest.send(requestData);
    };
    di_submit_display.addEventListener("click", function () {
        bclslog("in button handler", videoDataDisplay.value);
        videoData = JSON.parse(videoDataDisplay.value);
        totalVideos = videoData.length;
        bclslog("videoData length");
        // to insure uniqueness,
        bclslog("totalVideos", totalVideos);
        // in case of stop/start, reset videoNumber to 0
        videoNumber = 0;
        // get account inputs
        account_id = isDefined(account_id_display.value) ? account_id_display.value : defaults.account_id;
        client_id = isDefined(client_id_display.value) ? client_id_display.value : defaults.client_id;
        client_secret = isDefined(client_secret_display.value) ? client_secret_display.value : defaults.client_secret;
        // set CMS API options for first video
        setDIOptions();
    });
    // initialize
    init = function () {
        var i,
            iMax = profilesArray.length,
            newOpt;
        // add options for standard ingest profiles
        for (i = 0; i < iMax; i++) {
            newOpt = new Option(profilesArray[i]);
            ingest_profile_display.add(newOpt);
        }
    };
    // call init to set things up
    init();
})(window, document);
