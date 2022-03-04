var BCLS = (function (window, document, Pikaday) {
"use strict";
var proxyURL = "https://solutions.brightcove.com/bcls/bcls-proxy/video-report-by-reference-id-proxy.php",
    useMyAccount = document.getElementById("useMyAccount"),
    basicInfo = document.getElementById("basicInfo"),
    $accountID = document.getElementById('accountID'),
    accountID = "1752604059001",
    $client_id = document.getElementById('client_id'),
    client_id = null,
    $client_secret = document.getElementById('client_secret'),
    client_secret = null,
    $requestType = document.getElementById('requestType'),
    to = document.getElementById("to"),
    from = document.getElementById("from"),
    now = new Date(),
    nowMS = now.valueOf(),
    fromMS = nowMS - (30 * 24 * 60 * 60 * 1000),
    fromPicker,
    toPicker,
    fromDate = new Date(fromMS),
    nowISO = now.toISOString(),
    fromISO = fromDate.toISOString(),
    $reference_id = document.getElementById('reference_id'),
    reference_id = "bison4825296720001,budapest1,budapest2",
    $request = document.getElementById('request'),
    requestInputs = document.getElementsByClassName('aapi-request'),
    submitButton = document.getElementById('submitButton'),
    $selectData = document.getElementById('selectData'),
    responseFrame = document.getElementById('responseFrame'),
    endDate = '',
    startDate = '',
    requestOptions = {},
    i,
    iMax;

/**
 * Logging function - safe for IE
 * @param  {string} context description of the data
 * @param  {*} message the data to be logged by the console
 * @return {}
 */
function bclslog(context, message) {
    if (window["console"] && console["log"]) {
        console.log(context, message);
    }
    return;
}

// more robust test for strings "not defined"
function isDefined(v) {
    if (v === "" || v === null || v === undefined || v === NaN) {
        return false;
    }
    return true;
}

// remove space after comma and URI encode
function removeSpaces(str) {
    if (isDefined(str)) {
        str = str.replace(", ", ",");
        str = encodeURI(str);
        return str;
    }
}

// construct the request
function buildRequest() {
    var account_id = (isDefined($accountID.value)) ? $accountID.value : accountID,
    reference_ids = (isDefined($reference_id.value)) ? $reference_id.value.split(',') : reference_id.split(','),
    searchStr = '',
    i,
    iMax;
    iMax = reference_ids.length;
    for (i = 0; i < iMax; i++) {
        reference_ids[i] = 'reference_id:' + encodeURI(reference_ids[i]);
    }
    if (isDefined($client_id.value)) {
        requestOptions.client_id = $client_id.value;
    }
    if (isDefined($client_secret.value)) {
        requestOptions.client_secret = $client_secret.value;
    }
    searchStr = reference_ids.join('+');
    // build the request
    requestOptions.url = "https://analytics.api.brightcove.com/v1";
    requestOptions.url += "/data?accounts=" + account_id + "&dimensions=video";
    // check for time filters
    startDate = from.value;
    if (startDate !== " ") {
        requestOptions.url += "&from=" + startDate;
    }
    endDate = to.value;
    if (endDate !== " ") {
        requestOptions.url += "&to=" + endDate;
    }
    // add limit and fields
    requestOptions.url += "&limit=all&fields=engagement_score,play_rate,video,video_duration,video_engagement_1,video_engagement_100,video_engagement_25,video_engagement_50,video_engagement_75,video_impression,video_name,video_percent_viewed,video_seconds_viewed,video_view,video.reference_id";
    // add ref id filter
    requestOptions.url += "&where=video.q==" + searchStr;
    $request.textContent = requestOptions.url;
    $request.setAttribute("value", requestOptions.url);
}

/**
 * send API request to the proxy
 * @param  {Object} requestData options for the request
 * @param  {Function} callback the callback function to invoke
 */
function getData(options, callback) {
    var httpRequest = new XMLHttpRequest(),
        parsedData,
        requestParams,
        dataString,
        // response handler
        getResponse = function() {
            try {
              if (httpRequest.readyState === 4) {
                if (httpRequest.status >= 200 && httpRequest.status < 300) {
                  parsedData = JSON.parse(httpRequest.responseText);
                  callback(parsedData);
                } else {
                  alert('There was a problem with the request. Request returned ' + httpRequest.status);
                }
              }
            } catch (e) {
              alert('Caught Exception: ' + e);
            }
        };
        // set up request data
    requestParams = 'url=' + encodeURIComponent(options.url) + '&requestType=GET';
    if (options.client_id && options.client_secret) {
        requestParams += '&client_id=' + options.client_id + '&client_secret=' + options.client_secret;
    }

    // set response handler
    httpRequest.onreadystatechange = getResponse;
    // open the request
    httpRequest.open('POST', proxyURL);
    // set headers
    httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // open and send request
    httpRequest.send(requestParams);
}

// add date pickers to the date input fields
fromPicker = new Pikaday({
  field: from,
  format: 'YYYY-MM-DD',
  onSelect: buildRequest
});
toPicker = new Pikaday({
  field: to,
  format: 'YYYY-MM-DD',
  onSelect: buildRequest
});

to.addEventListener('change', buildRequest);
from.addEventListener('change', buildRequest);
// populate to/from fields with default values
nowISO = nowISO.substring(0, nowISO.indexOf("T"));
fromISO = fromISO.substring(0, fromISO.indexOf("T"));
to.value = nowISO;
from.value = fromISO;

// set event listeners
useMyAccount.addEventListener("click", function () {
    if (basicInfo.getAttribute('style') === 'display:none;') {
        basicInfo.setAttribute('style', 'display:block;');
        useMyAccount.innerHTML = "Use Sample Account";
    } else {
        basicInfo.setAttribute('style', 'display:none;');
        useMyAccount.innerHTML = "Use My Account Instead";
    }
});
// set listener for form fields
iMax = requestInputs.length;
for (i = 0; i < iMax; i++) {
    requestInputs[i].addEventListener("change", buildRequest);
}
// send request
submitButton.addEventListener("click", function() {
    getData(requestOptions, function(response) {
        bclslog('response', response);
        responseFrame.textContent = JSON.stringify(response, null, '  ');
    });
});
// select all the data
$selectData.addEventListener("click", function() {
    responseFrame.select();
});
// generate initial request
bclslog('building request');
buildRequest();
})(window, document, Pikaday);
