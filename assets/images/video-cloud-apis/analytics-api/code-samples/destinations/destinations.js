var BCLS = (function (window, document) {
    'use strict';
    var proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/destinations-proxy.php',
        useMyAccount = document.getElementById('useMyAccount'),
        basicInfo = document.getElementById('basicInfo'),
        accountID = document.getElementById('accountID'),
        account_id = '1752604059001',
        clientId = document.getElementById('client_id'),
        clientSecret = document.getElementById('client_secret'),
        client_id = null,
        client_secret = null,
        videoSelector = document.getElementById('videoSelector'),
        destinationReportTableBody = document.getElementById('destinationReportTableBody'),
        destinationCSV = document.getElementById('destinationCSV'),
        playerReportTableBody = document.getElementById('playerReportTableBody'),
        playerDomainCSV = document.getElementById('playerDomainCSV'),
        getDataButton = document.getElementById('getData'),
        gettingDataDisplay = document.getElementById('gettingDataDisplay'),
        requestURL = document.getElementById('requestURL'),
        currentVideo,
        currentVideoObj,
        analyticsData = {},
        chartData = [],
        callType;
        /**
         * Logging function - safe for IE
         * @param  {string} context description of the data
         * @param  {*} message the data to be logged by the console
         * @return {}
         */
        function bclslog(context, message) {
            if (window['console'] && console['log']) {
              console.log(context, message);
            }
            return;
        }

        // more robust test for strings 'not defined'
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
         * Builds the API requests and handles responses
         * @param {String} type the request type (getCount | getVideos | getAnalytics)
         */
        function buildRequest(type) {
            var requestOptions = {},
                tmpArray,
                newVideoItem = {},
                videoItem,
                newEl,
                a,
                csvStr,
                txt,
                i,
                iMax,
                item,
                fields,
                frag;
            // add credentials if submitted
            if (isDefined(clientId.value) && isDefined(clientSecret.value)) {
                requestOptions.client_id = clientId.value;
                requestOptions.client_secret = clientSecret.value;
            }
            gettingDataDisplay.textContent = 'Getting data, please wait....';
            switch (type) {
                case 'getDesinations':
                requestOptions.url = 'https://analytics.api.brightcove.com/v1/data?accounts=' + account_id + '&dimensions=destination_domain,destination_path&limit=all&fields=destination_domain,destination_path,video_view&sort=destination_domain&from=alltime';
                requestURL.textContent = requestOptions.url;
                getData(requestOptions, type, function(response) {
                    // create the video selector items from the response items
                    frag = new DocumentFragment();
                    csvStr = '"URL","Video Views"\n';
                    iMax = response.items.length;
                    for (i = 0; i < iMax; i++) {
                        item = response.items[i];
                        newEl = document.createElement('tr');
                        frag.appendChild(newEl);
                        newEl = document.createElement('td');
                        frag.appendChild(newEl);
                        a = document.createElement('a');
                        newEl.appendChild(a);
                        txt = document.createTextNode(item.destination_domain + item.destination_path);
                        csvStr += '"//' + item.destination_domain + item.destination_path + '",';
                        a.setAttribute('href', '//' + item.destination_domain + item.destination_path);
                        a.appendChild(txt);
                        newEl = document.createElement('td');
                        txt = document.createTextNode(item.video_view);
                        newEl.appendChild(txt);
                        frag.appendChild(newEl);
                        csvStr += '"' + item.video_view + '"\n';
                    }
                    // append the options to the video selector
                    destinationReportTableBody.appendChild(frag);
                    destinationCSV.textContent = csvStr;
                    buildRequest('getPlayerDomains');
                });
                    break;
                case 'getPlayerDomains':
                    // fields to return
                    fields = 'player,player_name,destination_domain,video_view,';
                    requestOptions.url = 'https://analytics.api.brightcove.com/v1/data?accounts=' + account_id + '&dimensions=player,destination_domain&limit=all&fields=' + fields  + '&sort=player';
                    requestURL.textContent = requestOptions.url;
                    getData(requestOptions, type, function(response) {
                        // display the data
                        frag = new DocumentFragment();
                        csvStr = '"Domain","Player ID","Player Name","Video Views"\n';
                        iMax = response.items.length;
                        for (i = 0; i < iMax; i++) {
                            item = response.items[i];
                            newEl = document.createElement('tr');
                            frag.appendChild(newEl);
                            newEl = document.createElement('td');
                            frag.appendChild(newEl);
                            txt = document.createTextNode(item.destination_domain);
                            csvStr += '"' + item.destination_domain + '",';
                            newEl.appendChild(txt);
                            frag.appendChild(newEl);
                            newEl = document.createElement('td');
                            frag.appendChild(newEl);
                            txt = document.createTextNode(item.player);
                            newEl.appendChild(txt);
                            csvStr += '"' + item.player + '",';
                            newEl = document.createElement('td');
                            frag.appendChild(newEl);
                            txt = document.createTextNode(item.player_name);
                            newEl.appendChild(txt);
                            csvStr += '"' + item.player_name + '",';
                            newEl = document.createElement('td');
                            frag.appendChild(newEl);
                            txt = document.createTextNode(item.video_view);
                            newEl.appendChild(txt);
                            csvStr += '"' + item.video_view + '"\n';
                        }
                        playerReportTableBody.appendChild(frag);
                        playerDomainCSV.textContent = csvStr;
                    });
                    gettingDataDisplay.textContent = 'Finished!';
                    break;
            }
        }

        /**
         * send API request to the proxy
         * @param  {Object} requestData options for the request
         * @param  {String} requestID the type of request
         * @param  {Function} callback the callback function to invoke
         */
        function getData(options, type, callback) {
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
                          bclslog('response', parsedData);
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

    // set event listeners
    useMyAccount.addEventListener('click', function () {
        if (basicInfo.getAttribute('style') === 'display:none') {
            basicInfo.setAttribute('style', 'display:block');
            useMyAccount.textContent = 'Use Sample Account';
        } else {
            basicInfo.setAttribute('style', 'display:none');
            useMyAccount.textContent = 'Use My Account Instead';
        }

    });
    getDataButton.addEventListener('click', function() {
        account_id = (isDefined(accountID.value)) ? accountID.value : account_id;
        gettingDataDisplay.textContent = 'Getting video data...';
        buildRequest('getDesinations');
    });

    return {};
})(window, document);
