var BCLS = (function (window, document, Pikaday) {
    'use strict';
    var proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/geo-report-proxy.php',
        useMyAccount = document.getElementById('useMyAccount'),
        basicInfo = document.getElementById('basicInfo'),
        $accountID = document.getElementById('accountID'),
        account_id = '1752604059001',
        $client_id = document.getElementById('client_id'),
        $client_secret = document.getElementById('client_secret'),
        client_id = '',
        client_secret = '',
        $videoSelector = document.getElementById('videoSelector'),
        $reportTableBody = document.getElementById('reportTableBody'),
        fromDatePicker = document.getElementById('fromDatePicker'),
        toDatePicker = document.getElementById('toDatePicker'),
        $getData = document.getElementById('getData'),
        $gettingDataDisplay = document.getElementById('gettingDataDisplay'),
        video_info = document.getElementById('video_info'),
        $requestURL = document.getElementById('requestURL'),
        currentVideo,
        currentVideoObj,
        analyticsData = {},
        chartData = [],
        callType,
        fromPicker,
        toPicker,
        now = new Date(),
        nowMS = now.valueOf(),
        then = new Date(nowMS - (1000 * 60 * 60 * 24 * 30)), // 30 days ago in milliseconds
        nowISO = now.toISOString().substr(0, 10), // get the date part of the date-time string
        thenISO = then.toISOString().substr(0, 10); // get the date part of the date-time string
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
         * get selected value for single select element
         * @param {htmlElement} e the select element
         * @return {Object} object containing the `value` and selected `index`, and the option text
         */
        function getSelectedValue(e) {
            var val = e.options[e.selectedIndex].value,
                txt = e.options[e.selectedIndex].textContent,
                idx = e.selectedIndex;
            return {
                value: val,
                text: txt,
                index: idx
            };
        }

        /**
         * builds the data display
         * @param {Object[]} array of analytics items
         */
        function displayData(items) {
            var newTr,
                newTd,
                txt,
                results = new DocumentFragment();
            // display the video info
            video_info.textContent = 'Video: ' + currentVideoObj.text + ' (' + currentVideoObj.value + ')';
            items.forEach(function(item, index, items) {
                newTr = document.createElement('tr');
                newTd = document.createElement('td');
                txt = document.createTextNode(item.country_name);
                newTd.appendChild(txt);
                newTr.appendChild(newTd);
                newTd = document.createElement('td');
                txt = document.createTextNode(item.video_view);
                newTd.appendChild(txt);
                newTr.appendChild(newTd);
                newTd = document.createElement('td');
                txt = document.createTextNode(item.video_seconds_viewed);
                newTd.appendChild(txt);
                newTr.appendChild(newTd);
                results.appendChild(newTr);
            });
            $reportTableBody.appendChild(results);
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
                txt,
                i,
                iMax,
                item,
                fields,
                frag = new DocumentFragment();
            // add credentials if submitted
            if (isDefined(client_id) && isDefined(client_secret)) {
                requestOptions.client_id = client_id;
                requestOptions.client_secret = client_secret;
            }
            switch (type) {
                case 'getVideos':
                requestOptions.url = 'https://analytics.api.brightcove.com/v1/data?accounts=' + account_id + '&dimensions=video&limit=all&fields=video,video.name&sort=-video_view&from=' + fromDatePicker.value + '&to=' + toDatePicker.value;
                $requestURL.textContent = requestOptions.url;
                getData(requestOptions, type, function(response) {
                    // create the video selector items from the response items
                    newEl = document.createElement('option');
                    newEl.setAttribute('value', '');
                    txt = document.createTextNode('Select a video');
                    newEl.appendChild(txt);
                    frag.appendChild(newEl);
                    iMax = response.items.length;
                    for (i = 0; i < iMax; i++) {
                        item = response.items[i];
                        newEl = document.createElement('option');
                        newEl.setAttribute('value', item.video);
                        txt = document.createTextNode(item['video.name']);
                        newEl.appendChild(txt);
                        frag.appendChild(newEl);
                    }
                    // append the options to the video selector
                    $videoSelector.appendChild(frag);
                });
                    break;
                case 'getAnalytics':
                    currentVideo = currentVideoObj.value;
                    // fields to return
                    fields = 'country,country_name,video_view,video_seconds_viewed';
                    requestOptions.url = 'https://analytics.api.brightcove.com/v1/data?accounts=' + account_id + '&dimensions=country&limit=all&fields=' + fields + '&from=' + fromDatePicker.value + '&to=' + toDatePicker.value + '&where=video==' + currentVideo;
                    $requestURL.textContent = requestOptions.url;
                    getData(requestOptions, type, function(response) {
                        // display the data
                        displayData(response.items);
                    });
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
      field: fromDatePicker,
      format: 'YYYY-MM-DD'
    });
    toPicker = new Pikaday({
      field: toDatePicker,
      format: 'YYYY-MM-DD'
    });
    // set initial from/to values
    fromDatePicker.value = thenISO;
    toDatePicker.value = nowISO;

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
    $videoSelector.addEventListener('change', function () {
        // get video and geo selections
        currentVideoObj = getSelectedValue($videoSelector);
        buildRequest('getAnalytics');
    });
    $getData.addEventListener('click', function() {
        account_id = (isDefined($accountID.value)) ? $accountID.value : account_id;
        $gettingDataDisplay.textContent = 'Getting video data...';
        buildRequest('getVideos');
    });

    return {};
})(window, document, Pikaday);
