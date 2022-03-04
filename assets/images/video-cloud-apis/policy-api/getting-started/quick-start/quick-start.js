var BCLS = (function() {
    var account_id = document.getElementById('account_id'),
        client_id = document.getElementById('client_id'),
        client_secret = document.getElementById('client_secret'),
        accountId,
        clientId,
        client_secret,
        apiRequest = document.getElementById('apiRequest'),
        requestBody = document.getElementById('requestBody'),
        apiResponse = document.getElementById('apiResponse'),
        generateKey = document.getElementById('generateKey'),
        allButtons = document.getElementsByTagName('button'),
        // api urls
        proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/mrss-proxy.php',
        baseURL = 'https://policy.api.brightcove.com/v1/accounts/',
        urlSuffix = '/policy_keys';

    /**
     * tests for all the ways a variable might be undefined or not have a value
     * @param {*} x the variable to test
     * @return {Boolean} true if variable is defined and has a value
     */
    function isDefined(x) {
        if ( x === '' || x === null || x === undefined || x === NaN) {
            return false;
        }
        return true;
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
     * sets up the data for the API request
     * @param {String} id the id of the button that was clicked
     */
    function setRequestData() {
        var requestData = {},
            callback = function(response) {
                apiResponse.textContent = JSON.stringify(response, null, '  ');
                enableButtons();
            }
            // disable buttons to prevent a new request before current one finishes
        disableButtons();
        requestData.url = baseURL + accountId + urlSuffix;
        requestData.requestType = 'POST';
        requestData.requestBody = '{"key-data": {"account-id": "' + accountId + '"}}';
        apiRequest.textContent = requestData.url;
        requestBody.textContent = JSON.stringify(JSON.parse(requestData.requestBody), null, '  ');
        sendRequest(requestData, callback);
    }

    /**
     * send API request to the proxy
     * @param  {Object} requestData options for the request
     * @param  {String} requestID the type of request = id of the button
     * @param  {Function} [callback] callback function
     */
    function sendRequest(options, callback) {
        var httpRequest = new XMLHttpRequest(),
            responseRaw,
            parsedData,
            requestParams,
            dataString,
            // response handler
            getResponse = function() {
                try {
                    if (httpRequest.readyState === 4) {
                        if (httpRequest.status >= 200 && httpRequest.status < 300) {
                            // check for completion
                            responseRaw = httpRequest.responseText;
                            parsedData = JSON.parse(responseRaw);
                            // increment offset
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
    requestParams = "url=" + encodeURIComponent(options.url) + "&requestType=" + options.requestType + '&requestBody=' + options.requestBody;
    // only add client id and secret if both were submitted
    if (isDefined(clientId) && isDefined(clientSecret)) {
        requestParams += '&client_id=' + clientId + '&client_secret=' + clientSecret;
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

function init() {
    // event handlers
    generateKey.addEventListener('click', function() {
        // get the inputs
        clientId = client_id.value;
        clientSecret = client_secret.value;
        // only use entered account id if client id and secret are entered also
        if (isDefined(clientId) && isDefined(clientSecret)) {
            if (isDefined(account_id.value)) {
                accountId = account_id.value;
            } else {
                window.alert('To use your own account, you must specify an account id, and client id, and a client secret - since at least one of these is missing, a sample account will be used');
                clientId = '';
                clientSecret = '';
                accountId = '1752604059001';
            }
        } else {
            accountId = '1752604059001';
        }
        setRequestData();
    });
    apiResponse.addEventListener('click', function() {
        apiResponse.select();
    });
}

init();
})();
