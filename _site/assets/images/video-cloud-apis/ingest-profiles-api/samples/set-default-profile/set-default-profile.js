var BCLS = ( function (window, document) {
        var // account stuff
        accountId,
        bcToken,
        clientId,
        clientSecret,
        newProfile,
        // api stuff
        oauthProxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/oauth-proxy.php',
        ipProxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/ip-proxy.php',
        oauthURL = 'https://oauth.brightcove.com/v4/client_credentials',
        ipURL = 'https://ingestion.api.brightcove.com/v1/accounts/',
        ipURLsuffix = '/configuration',
        totalCalls = 0,
        callNumber = 0,
        responseArray = [],
        accountsArray = [],
        defaultAccounts = ['57838016001', '921483702001', '1937897674001'],
        profilesArray = ['smart-player-transition', 'videocloud-default-v1', 'high-resolution', 'screencast-1280', 'single-bitrate-high', 'single-bitrate-standard'],
        operationsArray = ['video-cloud/ingest-profiles/profile/read', 'video-cloud/ingest-profiles/profile/write', 'video-cloud/ingest-profiles/account/read', 'video-cloud/ingest-profiles/account/write'],
        // elements
        bc_token = document.getElementById('bc_token'),
        // getCredentials = document.getElementById('getCredentials'),
        account_ids = document.getElementById('account_ids'),
        bc_token = document.getElementById('bc_token'),
        account_ids_cred = document.getElementById('account_ids_cred'),
        client_id = document.getElementById('client_id'),
        client_secret = document.getElementById('client_secret'),
        profileSelect = document.getElementById('profileSelect'),
        setDefaults = document.getElementById('setDefaults'),
        logger = document.getElementById('logger'),
        apiRequest = document.getElementById('apiRequest'),
        apiResponse = document.getElementById('apiResponse');

    /**
     * Logging function - safe for IE
     * @param  {string} context - description of the data
     * @param  {*} message - the data to be logged by the console
     * @return {}
     */
    bclslog = function (context, message) {
        if (window["console"] && console["log"]) {
          console.log(context, message);
        }
        return;
    };


    /**
     * remove spaces from a string
     * @param {String} str string to process
     */
    function removeSpaces(str) {
        str= str.replace(/\s/g, '');
        return str;
    }

    /**
     * tests for all the ways a variable might be undefined or not have a value
     * @param {String|Number} x the variable to test
     * @return {Boolean} true if variable is defined and has a value
     */
    function isDefined(x){
        if ( x === "" || x === null || x === undefined || x === NaN) {
            return false;
        }
        return true;
    }

    /**
     * get selected value for single select element
     * @param {htmlElement} e the select element
     */
    function getSelectedValue(e) {
        return e.options[e.selectedIndex].value;
    }


    /**
     * disables a button so user can't submit new request until current one finishes
     */
    function disableButton(button) {
        button.setAttribute('disabled', 'disabled');
        button.setAttribute('style', 'opacity:.5,cursor:not-allowed;');
    }

    /**
    * enables a button
    * @param {htmlElement} button - the button to enable
    */
    function enableButton(button) {
        button.removeAttribute('disabled');
        button.setAttribute('style', 'opacity:1;cursor:pointer;');
    }

    /**
     * sets up the data for the API request
     * @param {String} id the id of the button that was clicked
     */
    function setRequestData(id, type, configId) {
        var i,
            iMax,
            requestData = {};
        switch (id) {
            case 'getCredentials':
                var dataStr2 = '{"identity": {"type": "video-cloud-account","account-id":',
                    maxScope = [],
                    callback = function (credentials) {
                        client_id.value = credentials.client_id;
                        client_secret.value = credentials.client_secret;
                        account_ids.value = account_ids_cred.value;
                        disableButton(getCredentials);
                    };
                // proxy url
                proxyURL = oauthProxyURL;
                // set up data
                requestData.requestType = type;
                requestData.name = 'Set_Defaults_App';
                requestData.bc_token = bcToken;
                requestData.maximum_scope = '[';
                iMax = accountsArray.length;
                for (i = 0; i < iMax; i++) {
                    maxScope[i] = {};
                    maxScope[i].identity = {};
                    maxScope[i].identity.type = 'video-cloud-account';
                    maxScope[i].identity['account-id'] = parseInt(accountsArray[i]);
                    maxScope[i].operations = operationsArray;
                }
                requestData.maximum_scope = JSON.stringify(maxScope);
                requestData.url = oauthURL;
                sendRequest(requestData, proxyURL, id, callback);
                break;
            case 'setDefaults':
                var reqBody = {}, now,
                    callback = function(response) {
                    now = new Date().toISOString();
                    logger.textContent = 'Finished at ' + now;
                    apiResponse.textContent = JSON.stringify(response, null, '  ');
                }
                logger.textContent = 'Processing account: ' + accountsArray[callNumber];
                endPoint = accountsArray[callNumber];
                proxyURL = ipProxyURL;
                requestData.url = ipURL + endPoint + ipURLsuffix;
                requestData.requestType = type;
                reqBody.account_id = parseInt(accountsArray[callNumber]);
                reqBody.default_profile_id = newProfile;
                if (isDefined(configId)) {
                    bclslog('configId', configId);
                    reqBody.id = configId;
                }
                requestData.requestBody = JSON.stringify(reqBody);
                bclslog('requestBody', requestData.requestBody);
                apiRequest.textContent = requestData.url;
                sendRequest(requestData, proxyURL, id, callback);
                break;
        }
    }

    /**
     * send API request to the proxy
     * @param  {Object} requestData options for the request
     * @param  {String} requestID the type of request = id of the button
     * @param  {Function} [callback] callback function
     */
    function sendRequest(options, proxyURL, requestID, callback) {
        var httpRequest = new XMLHttpRequest(),
            responseRaw,
            parsedData,
            requestParams,
            dataString,
            configId,
            // response handler
            getResponse = function() {
                try {
                    if (httpRequest.readyState === 4) {
                        if (httpRequest.status >= 200 && httpRequest.status < 300) {
                            // check for completion
                            if (requestID === 'getCredentials') {
                                responseRaw = httpRequest.responseText;
                                parsedData = JSON.parse(responseRaw);
                                callback(parsedData);
                            } else if (requestID === 'setDefaults') {
                                responseRaw = httpRequest.responseText;
                                bclslog('responseRaw', responseRaw);
                                parsedData = JSON.parse(responseRaw);
                                bclslog('parsedData', parsedData);
                                if (options.requestType === 'POST') {
                                    configId = parsedData.id;
                                    setRequestData('setDefaults', 'PUT', configId);
                                } else if (options.requestType === 'PUT') {
                                    responseArray.push(parsedData);
                                    callNumber++;
                                    if (callNumber < totalCalls) {
                                        setRequestData('setDefaults', 'POST');
                                    } else {
                                        callback(responseArray);
                                    }
                                }
                            } else {
                              alert('There was a problem with the request. Request returned ' + httpRequest.status);
                            }
                        }
                    }
                } catch (e) {
                    alert('Caught Exception: ' + e);
                }
            };
        // set up request data
        requestParams = "url=" + encodeURIComponent(options.url) + "&requestType=" + options.requestType;
        // for the IP API call
        // add request body if any
        if (isDefined(options.requestBody)) {
            requestParams += '&requestBody=' + options.requestBody;
        }
        // only add client id and secret if both were submitted
        if (isDefined(clientId) && isDefined(clientSecret)) {
            requestParams += '&client_id=' + clientId + '&client_secret=' + clientSecret;
        }
        // for the OAuth API call
        if (isDefined(options.name) && isDefined(options.maximum_scope) && isDefined(options.bc_token)) {
            requestParams += '&name=' + options.name + '&maximum_scope=' + options.maximum_scope.replace(reSlash, '') + '&bc_token=' + options.bc_token;
        }

        // set response handler
        httpRequest.onreadystatechange = getResponse;
        // open the request
        httpRequest.open('POST', proxyURL);
        // set headers
        httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        // open and send request
        bclslog('requestParams', requestParams);
        httpRequest.send(requestParams);
    }

    function init() {
        var i,
            iMax,
            opt;
        // set up profiles selector
        iMax = profilesArray.length;
        for (i = 0; i < iMax; i++) {
            opt = document.createElement('option');
            opt.value = profilesArray[i];
            opt.text = profilesArray[i];
            profileSelect.add(opt, null)
        }
        // event handlers
        setDefaults.addEventListener('click', function() {
            var accountIds;
            // get the inputs
            clientId = client_id.value;
            clientSecret = client_secret.value;
            newProfile = getSelectedValue(profileSelect);
            // only use entered account id if client id and secret are entered also
            if (isDefined(clientId) && isDefined(clientSecret)) {
                if (isDefined(account_ids.value)) {
                    accountIds = removeSpaces(account_ids.value);
                    accountsArray = accountIds.split(',');
                } else {
                    window.alert('To use your own account, you must specify an account id, and client id, and a client secret - since at least one of these is missing, a sample account will be used');
                    clientId = '';
                    clientSecret = '';
                    accountsArray = defaultAccounts;
                }
            } else {
                accountsArray = defaultAccounts;
            }
            totalCalls = accountsArray.length;
            setRequestData('setDefaults', 'POST');
        });

        // getCredentials.addEventListener('click', function() {
        //     var accountIds;
        //     if (isDefined(account_ids_cred.value) && isDefined(bc_token.value)) {
        //         disableButton(setDefaults);
        //         account_ids_cred.value = removeSpaces(account_ids_cred.value);
        //         account_ids.value = account_ids_cred.value;
        //         accountsArray = account_ids_cred.value.split(',');
        //         bcToken = bc_token.value;
        //         logger.textContent = 'Got the inputs, setting default profile...'
        //         setRequestData('getCredentials', 'POST');
        //     } else {
        //         window.alert('You must include a BC_TOKEN and an account id to get your credentials - if you already have credentials for ingest profiles, just enter the client id and secret in the form below');
        //     }
        // });
        apiResponse.addEventListener('click', function() {
            apiResponse.select();
        });
    }
    // kick things off
    init();
})(window, document);
