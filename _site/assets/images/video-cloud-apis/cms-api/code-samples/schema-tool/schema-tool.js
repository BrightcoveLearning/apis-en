var BCLS = (function (document, Handlebars) {
    "use strict";
    var proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/schema-tool-proxy.php',
        accountID = document.getElementById('accountID'),
        account_id,
        clientID = document.getElementById('clientID'),
        clientSecret = document.getElementById('clientSecret'),
        playerID = document.getElementById('playerID'),
        playerWidth = document.getElementById('playerWidth'),
        playerHeight = document.getElementById('playerHeight'),
        videoID = document.getElementById('videoID'),
        video_id,
        generateMicrodata = document.getElementById('generateMicrodata'),
        generateJSON_ld = document.getElementById('generateJSON_ld'),
        publishingCode = document.getElementById('publishingCode'),
        videoData = null,
        defaults = {},
        useTemplate,
        template,
        result,
        schemaTemplates = {
            MicroData: '<!-- Start Schema Code --> \n <div id="content"> \n <div itemscope itemtype="http://schema.org/VideoObject"> \n <meta itemprop="name" content="{{name}}"> \n <meta itemprop="description" content="{{description}}"> \n <meta itemprop="videoID" content="{{id}}"> \n <meta itemprop="duration" content="{{duration}}"> \n <link itemprop="thumbnail" href="{{thumbnailURL}}"> \n <link itemprop="embedURL" href="http://players.brightcove.net/{{account_id}}/{{playerID}}_default/index.html?videoID={{id}}"><meta itemprop="width" content="{{width}}"><meta itemprop="height" content="{{height}}"> \n <!-- End Schema Code --> \n <!-- Start Player Code --> \n <iframe src="//players.brightcove.net/{{accountID}}/default_default/index.html?videoID={{id}}" style="width:{{playerWidth}};height:{{playerHeight}}" allowfullscreen webkitallowfullscreen mozallowfullscreen><\/iframe>  height:{{playerHeight}} \n <!-- End Player Code --> \n <\/div> \n <\/div>',
            json_ld: '<!-- Start Schema Code --> \n <script type="application/ld+json"> \n {"@context": "http://schema.org/", \n "@type": "VideoObject", \n "name": "{{name}}", \n "@id": "{{url}}", \n "datePublished": "{{created_at}}", \n "interactionStatistic": [ \n {"@type": "InteractionCounter", \n "interactionType": "http://schema.org/WatchAction", \n "userInteractionCount": "{{total_plays}}" \n ]} \n </script> \n <!-- End Schema Code --> \n <!-- Start Player Code --> \n <iframe src="//players.brightcove.net/{{accountID}}/default_default/index.html?videoID={{id}}" style="width:{{playerWidth}};height:{{playerHeight}}" allowfullscreen webkitallowfullscreen mozallowfullscreen><\/iframe>  height:{{playerHeight}} \n <!-- End Player Code --> \n '
        };

    /**
     * determines whether a var has value
     * @param  {*}  x var to evaluate - note that if x = {} or [], true will be returned
     * @return {Boolean}   whether var has a value
     */
    function isDefined(x) {
        if (x === '' || x === null || x === undefined || x === NaN) {
            return false;
        }
        return true;
    }

    /**
     * utility to extract h/m/s from seconds
     * @param {number} secs - seconds to convert to Thh:mm:ss
     * @return {String} ISO 8601 time string
     */
    function secondsToTime(secs) {
        var hours = Math.floor(secs / (60 * 60)),
            divisor_for_minutes = secs % (60 * 60),
            minutes = Math.floor(divisor_for_minutes / 60),
            divisor_for_seconds = divisor_for_minutes % 60,
            seconds = Math.ceil(divisor_for_seconds);

        if (hours < 10) {
            hours = '0' + hours.toString();
        } else {
            hours = hours.toString();
        }

        if (minutes < 10) {
            minutes = '0' + minutes.toString();
        } else {
            minutes = minutes.toString();
        }

        if (seconds < 10) {
            seconds = '0' + seconds.toString();
        } else {
            seconds = seconds.toString();
        }

        return 'T' + hours + ':' + minutes + ':' + seconds;
    }

    /**
     * send API request to the proxy
     * @param  {Object} options options for the request
     */
    function getMediaData(options) {
        var httpRequest = new XMLHttpRequest(),
            requestParams,
            // response handler
            getResponse = function () {
                try {
                    if (httpRequest.readyState === 4) {
                        if (httpRequest.status >= 200 && httpRequest.status < 300) {
                            // add/remove folder video return no data
                            videoData = JSON.parse(httpRequest.responseText);
                            videoData.url = 'http://http://players.brightcove.net/' + account_id + '/default_default/index.html';
                            generateSchema();
                            // re-enable the buttons
                        } else {
                            alert('There was a problem with the request. Request returned ' + httpRequest.status);
                        }
                    }
                } catch (e) {
                    alert('Caught Exception: ' + e);
                }
            };
        // set up request data
        requestParams = "url=" + encodeURIComponent(options.url) + "&requestType=" + options.requestType;

        // set response handler
        httpRequest.onreadystatechange = getResponse;
        // open the request
        httpRequest.open('POST', proxyURL);
        // set headers
        httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        // open and send request
        httpRequest.send(requestParams);
    }

    function generateSchema() {
        console.log('videoData', videoData);
        // insert other data that the schema needs
        videoData.playerID = isDefined(playerID.textContent) ? playerID.textContent : defaults.playerID;
        videoData.playerWidth = isDefined(playerWidth.textContent) ? playerWidth.textContent : defaults.playerWidth;
        videoData.playerHeight = isDefined(playerHeight.textContent) ? playerHeight.textContent : defaults.playerHeight;
        // convert the duration to ISO format schema needs
        videoData.duration = secondsToTime(videoData.duration / 1000);
        template = Handlebars.compile(schemaTemplates[useTemplate]);
        result = template(videoData);
        publishingCode.textContent = result;
    }
    // set listeners for buttons
    generateMicrodata.addEventListener("click", function () {
        // data setup
        var options = {};
        useTemplate = 'MicroData';
        options.client_id = (isDefined(clientID.value)) ? clientID.value : defaults.client_id;
        options.client_secret = (isDefined(clientSecret.value)) ? clientSecret.value : defaults.client_secret;
        account_id = (isDefined(accountID.value)) ? accountID.value : defaults.account_id;
        video_id = (isDefined(videoID.value)) ? videoID.value : defaults.videoID;
        options.url = 'https://cms.api.brightcove.com/v1/accounts/' + account_id + '/videos/' + video_id;
        options.requestType = "GET";
        getMediaData(options);
    });

    generateJSON_ld.addEventListener("click", function () {
        // data setup
        console.log('click');
        var options = {};
        useTemplate = 'json_ld';
        options.client_id = (isDefined(clientID.value)) ? clientID.value : defaults.client_id;
        options.client_secret = (isDefined(clientSecret.value)) ? clientSecret.value : defaults.client_secret;
        account_id = (isDefined(accountID.value)) ? accountID.value : defaults.account_id;
        video_id = (isDefined(videoID.value)) ? videoID.value : defaults.videoID;
        options.url = 'https://cms.api.brightcove.com/v1/accounts/' + account_id + '/videos/' + video_id;
        options.requestType = "GET";
        getMediaData(options);
    });

    publishingCode.addEventListener('click', function() {
        publishingCode.select();
    });

    function init() {
        defaults.account_id = '1752604059001';
        defaults.playerID = '28e29e6d-bed3-4db9-8d70-8d55b8aa3091';
        defaults.videoID = '4454620113001';
        defaults.playerWidth = '480';
        defaults.playerHeight = '270';
        // proxy has credentials for the default account, so no need to send them
        defaults.client_id = '';
        defaults.client_secret = '';
    }

    init();
})(document, Handlebars);
