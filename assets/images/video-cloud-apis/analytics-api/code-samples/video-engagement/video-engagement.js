var BCLS = (function (window, document) {
    'use strict';
    var // aapi stuff
        useMyAccount = document.getElementById('useMyAccount'),
        basicInfo = document.getElementById('basicInfo'),
        proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/engagement-report-proxy.php',
        $accountID = document.getElementById('accountID'),
        account_id = '1752604059001',
        $client_id = document.getElementById('client_id'),
        client_id = null,
        $client_secret = document.getElementById('client_secret'),
        client_secret = null,
        $scopeSelect = document.getElementById('scopeSelect'),
        scope = 'account',
        $playerID = document.getElementById('playerID'),
        player_id = '2fc88f47-3e0f-45bc-9a11-97d9d2f22392_default',
        $videoID = document.getElementById('videoID'),
        video_id = '4093643993001',
        $pid = document.getElementById('pid'),
        $vid = document.getElementById('vid'),
        $requestButton = document.getElementById('requestButton'),
        $request = document.getElementById('request'),
        $submitButton = document.getElementById('submitButton'),
        $requestInputs = document.getElementsByClassName('.aapi-request'),
        responseFrame = document.getElementById('responseFrame'),
        requestOptions = {},
        requestURL = '',
        chartEngagement = '#chartEngagement',
        responseData,
        i,
        iMax;

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
    function isDefined(v) {
        if(v !== '' && v !== null && v !== 'undefined') { return true; }
        else { return false; }
    }

    // create graph
    function makeEngagementGraph(jsonObject) {
        var options = {pointDot : false},
            chartData = {},
            labels = [],
            data = [],
            video_engagement = jsonObject.timeline.values,
            video_duration = 100,
            series = {},
            video_name = jsonObject.video_name,
            ctx,
            myNewChart;
        // process response data
        video_engagement.forEach( function (element, index, video_engagement) {
            if ((index) % 10 === 0) {
                labels[index] = index + '%';
            } else {
                labels[index] = '';
            }

            data[index] = element;
        });
        // chartData
        chartData = {
            labels : labels,
            datasets : [
                {
                    fillColor : 'rgba(151,187,205,0.5)',
                    strokeColor : 'rgba(151,187,205,1)',
                    pointColor : 'rgba(151,187,205,1)',
                    pointStrokeColor : '#fff',
                    data : data
                }
            ]
        };
        //Get the context of the canvas element we want to select
        ctx = document.getElementById('chartEngagement').getContext('2d');
        myNewChart = new Chart(ctx).Line(chartData, options);
    }

    function buildRequest() {
        player_id = (isDefined($playerID.value)) ? $playerID.value : player_id;
        video_id = (isDefined($videoID.value)) ? $videoID.value : video_id;
        account_id = (isDefined($accountID.value)) ? $accountID.value : account_id;
        // add client credentials if any
        if (isDefined($client_id.value)) {
            requestOptions.client_id = $client_id.value;
        }
        if (isDefined($client_secret.value)) {
            requestOptions.client_secret = $client_secret.value;
        }

        // build the request
        requestOptions.url = 'https://analytics.api.brightcove.com/v1';
        requestOptions.url += '/engagement/accounts/' + account_id;
        if (scope === 'players') {
            requestOptions.url += '/players/' + player_id;
        } else if (scope === 'videos') {
            requestOptions.url+= '/videos/' + video_id;
        }
        $request.textContent = requestOptions.url;
        $request.setAttribute('value', requestOptions.url);
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
    // set event listeners
    useMyAccount.addEventListener('click', function () {
        if (basicInfo.getAttribute('style') === 'display:none;') {
            basicInfo.setAttribute('style', 'display:block;');
            useMyAccount.innerHTML = 'Use Sample Account';
        } else {
            basicInfo.setAttribute('style', 'display:none;');
            useMyAccount.innerHTML = 'Use My Account Instead';
        }
    });
    // listener for videos request
    iMax = $requestInputs.length;
    for (i = 0; i < iMax; i++) {
        $requestInputs[i].addEventListener('change', buildRequest);
    }
    // rebuild request when scope selector changes
    $scopeSelect.addEventListener('change', function (evt) {
        scope = $scopeSelect.value;
        if (scope === 'account') {
            $vid.setAttribute('style', 'display:none;');
            $pid.setAttribute('style', 'display:none;');
        } else if (scope === 'players') {
            $pid.setAttribute('style', 'display:block;');
            $vid.setAttribute('style', 'display:none;');
        } else if (scope === 'videos') {
            $pid.setAttribute('style', 'display:none;');
            $vid.setAttribute('style', 'display:block;');
        }
        buildRequest();
    });
    // submit request
    $submitButton.addEventListener('click', function(){
        getData(requestOptions, function(response) {
            bclslog('response', response);
            responseFrame.textContent = JSON.stringify(response, null, '  ');
            makeEngagementGraph(response);
        });
    });

    // generate initial request
    buildRequest();
})(window, document);
