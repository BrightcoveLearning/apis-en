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
        cms_url_display = document.getElementById("cms_url"),
        cmsURL = "https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy.php",
        videoDataDisplay = document.getElementById("videoData"),
        // Dynamic Ingest API stuff
        profilesArray = ['high-resolution', 'balanced-nextgen-player', 'screencast-1280', 'mp4-only', 'smart-player-transition', 'balanced-high-definition', 'low-bandwidth-devices', 'balanced-standard-definition', 'single-rendition', 'Live - Standard', 'high-bandwidth-devices', 'single-bitrate-high', 'audio-only', 'videocloud-default-v1', 'Live - Premium HD', 'Live - HD', 'single-bitrate-standard', 'screencast'],
        di_url_display = document.getElementById("di_url"),
        di_submit_display = document.getElementById("di_Submit"),
        diURL = "https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy.php",
        response = document.getElementById("response"),
        videoData = [],
        totalVideos,
        videoNumber = 0,
        currentJobs = 0,
        t1,
        t2,
        totalIngested = 0,
        defaults = {account_id: 57838016001,client_id: "37cd3c5d-6f18-4702-bfb6-4fbc1cd095f1",client_secret: "gLSQANqe6A2PzJce_6xA4bTNu844up5-CSrC-jxNfur4EaOgWKRcqq_GTxKjhMpPSflMdNEhFdBmNe0qsTIZSQ"},
        callbacks = '["https://solutions.brightcove.com/bcls/di-api/di-callbacks.php"]';

    /*************************
    logging
    *************************/
    function bclslog(context, message) {
        if (window["console"] && console["log"]) {
          console.log(context, message);
        };
    };

    // is defined
    function isDefined(x){
        if(x === "" || x === null || x === undefined){
            return false;
        } else{
            return true;
        }
    };
    // set options for the CMS API request
    function setCMSOptions() {
        var options = {};
        // truncate description if too long
        videoData[videoNumber].description = videoData[videoNumber].description.substr(0, 120) + "...";
        options.client_id = client_id;
        options.client_secret = client_secret;
        options.requestBody = '{"name":"' + videoData[videoNumber].name + '","description":"' + videoData[videoNumber].description + '","reference_id":"' + videoData[videoNumber].reference_id + '","tags":' + JSON.stringify(videoData[videoNumber].tags) + '}';
        options.requestType = "POST";
        options.url = cms_url_display.value;
        bclslog("cmsoptions", options);
        // now submit the request
        submitRequest(options, cmsURL, "cms");
    };
    // set options for the Dynamic Ingest API request
    function setDIOptions() {
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
        options.requestBody = '{"master":{"url":"' + videoData[videoNumber].url +'"},"profile":"' + ingest_profile + '","callbacks":' + callbacks + '}';
        bclslog("di request body ", options.requestBody);
        options.requestType = "POST";
        options.url = di_url_display.value;
        bclslog("dioptions", options);
        // now submit the request
        submitRequest(options, diURL, "di");
    };
    // function to set the request
    function logResponse(type, data) {
        response.textContent += type + ": " + data + ",\n";
    };

    // function to submit Request
    function submitRequest(options, proxyURL, type) {
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
                        switch (type) {
                            case "cms":
                            if (responseData.indexOf("TIMEOUT") > 0) {
                                // videoNumber++;
                                t1 = setTimeout(setCMSOptions, 1000);
                            } else {
                                parsedData = JSON.parse(responseData);
                                di_url_display.value = "https://ingest.api.brightcove.com/v1/accounts/" + account_id + "/videos/" + parsedData.id + "/ingest-requests";
                                setDIOptions();
                            }
                            break;
                            case "di":
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
                                    t2 = setTimeout(setCMSOptions, 1800000);
                                } else {
                                    // pause to avoid CMS API timeouts
                                    t2 = setTimeout(setCMSOptions, 1000);
                                }
                            }
                            break;
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
        var i, now = new Date().valueOf();
        videoData = JSON.parse(videoDataDisplay.value);
        totalVideos = videoData.length;
        // to insure uniqueness,
        for (i = 0; i < totalVideos; i++) {
            videoData[i].reference_id += "_" + now.toString();
        }
        // in case of stop/start, reset videoNumber to 0
        videoNumber = 0;
        // get account inputs
        account_id = isDefined(account_id_display.value) ? account_id_display.value : defaults.account_id;
        client_id = isDefined(client_id_display.value) ? client_id_display.value : defaults.client_id;
        client_secret = isDefined(client_secret_display.value) ? client_secret_display.value : defaults.client_secret;
        cms_url_display.value = "https://cms.api.brightcove.com/v1/accounts/" + account_id + "/videos";
        // set CMS API options for first video
        setCMSOptions();
    });
    // initialize
    function init() {
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
