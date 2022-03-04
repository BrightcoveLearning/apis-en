var BCLS = ( function (window, document, creds) {
    var account_id_field = document.getElementById("account_id"),
        account_id,
        client_id_field = document.getElementById("client_id"),
        client_id = null,
        client_secret_field = document.getElementById("client_secret"),
        client_secret = null,
        setRequest_btn = document.getElementById("setRequest"),
        apiRequest = null,
        apiRequest_field = document.getElementById("apiRequest"),
        submit_button = document.getElementById("submit"),
        response = document.getElementById("response"),
        totalVideos = 0,
        offset = 0,
        callNumber = 0,
        requestBody,
        videoData_display = document.getElementById("videoData"),
        videoData,
        t1,
        currentVideo,
        // functions
        isDefined,
        cleanString,
        cleanUpData,
        submitRequest,
        setRequest,
        logResponse,
        init;
    // is defined
    isDefined = function(x){
        if(x !== "" && x !== null && x !== undefined){
            return true;
        } else{
            return false;
        }
    };
    // function to remove spaces from string
    cleanString = function (str) {
        // remove spaces
        str = str.replace(/\s/g, "");
        return str;
    };
    // clean up data before submitting
    cleanUpData = function () {
        var i, iMax, item;
        iMax = videoData.length;
        for (i = 0; i < iMax; i++) {
            item = videoData[i];
            // truncate over-long descriptions
            if (item.description.length > 120) {
                item.description = item.description.substr(0, 250) + "...";
            }
            // use name for missing descriptions
            if (item.description === "") {
                item.description = item.name;
            }
        }
        // console.log("videoData Cleaned", videoData);
    };
    // function to set up request
    setRequest = function () {

        currentVideo = videoData[callNumber];
        if (isDefined(currentVideo)) {
            apiRequest = "https://cms.api.brightcove.com/v1/accounts/" + account_id + "/videos/" + currentVideo.id;
            requestBody = '{"description":"' + currentVideo.description + '"}';
            // display the request URL
            apiRequest_field.textContent = apiRequest;
            submitRequest();
        }

    };
    // function to set the request
    logResponse = function (data) {
        response.innerHTML += data + ",<br />";
    };
    // function to make API request
    submitRequest = function () {
        var httpRequest = new XMLHttpRequest(),
            proxyURL = "https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy.php",
            requestData,
            getResponse = function () {
                try {
                    if (httpRequest.readyState === 4) {
                      if (httpRequest.status >= 200 && httpRequest.status < 300) {
                        logResponse(httpRequest.responseText);
                        if (callNumber < totalVideos) {
                            callNumber++;
                            setRequest();
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
        if (account_id === null || client_id === null || client_secret === null) {
            alert("You must provide an account id, client id, and client secret");
            return false;
        }
        // get latest request URL in case use edited it
        apiRequest = cleanString(apiRequest_field.value);
        // set up request data
        requestData = "client_id=" + client_id + "&client_secret=" + client_secret + "&url=" + encodeURIComponent(apiRequest) + "&requestBody=" + encodeURIComponent(requestBody) + "&requestType=PATCH";
        // set response handler
        httpRequest.onreadystatechange = getResponse;
        // open the request
        httpRequest.open("POST", proxyURL);
        // set headers
        httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        // open and send request
        httpRequest.send(requestData);
    };
    // init function to set up event listeners
    init = function () {
        // event listeners
        setRequest_btn.addEventListener("click", function () {
            // trim any leading/trailing spaces from the input strings
            account_id = cleanString(account_id_field.value) || creds.account_id;
            client_id = cleanString(client_id_field.value) || creds.client_id;
            client_secret = cleanString(client_secret_field.value) || creds.client_secret;
            // get and clean up video data
            videoData = JSON.parse(videoData_display.value);
            totalVideos = videoData.length;
            cleanUpData();
            // set up the request
            setRequest();
        });
    }
    // initialize - set up data
    init();

})(window, document, creds);
