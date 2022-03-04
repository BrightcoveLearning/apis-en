var BCLS = (function(window, document) {
    var accountId,
        clientId,
        clientSecret,
        // api stuff
        proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/mrss-proxy.php',
        baseURL = 'https://cms.api.brightcove.com/v1/accounts/',
        limit = 25,
        totalVideos = 0,
        totalCalls = 0,
        callNumber = 0,
        videosCompleted = 0,
        videosArray = [],
        summaryData = {},
        csvStr,
        summaryCsvStr,
        customFields = [],
        // elements
        account_id = document.getElementById('account_id'),
        client_id = document.getElementById('client_id'),
        client_secret = document.getElementById('client_secret'),
        tag = document.getElementById('tag'),
        videoCount = document.getElementById('videoCount'),
        makeReport = document.getElementById('makeReport'),
        content,
        logger = document.getElementById('logger'),
        logText = document.getElementById('logText'),
        csvData = document.getElementById('csvData'),
        apiRequest = document.getElementById('apiRequest'),
        allButtons = document.getElementsByName('button'),
        pLogGettingVideos = document.createElement('p'),
        pLogGettingRenditions = document.createElement('p'),
        pLogFinish = document.createElement('p'),
        spanIntro2 = document.createElement('span'),
        spanOf2 = document.createElement('span'),
        spanRenditionsTotal = document.createElement('span'),
        spanRenditionsCount = document.createElement('span'),
        spanRenditionsTotalEl,
        spanRenditionsCountEl;

    /**
     * tests for all the ways a variable might be undefined or not have a value
     * @param {String|Number} x the variable to test
     * @return {Boolean} true if variable is defined and has a value
     */
    function isDefined(x) {
        if (x === '' || x === null || x === undefined) {
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
     * sort an array of objects based on an object property
     * @param {array} targetArray - array to be sorted
     * @param {string|number} objProperty - object property to sort on
     * @return sorted array
     */
    function sortArray(targetArray, objProperty) {
        targetArray.sort(function(a, b) {
            var propA = a[objProperty],
                propB = b[objProperty];
            // sort ascending; reverse propA and propB to sort descending
            if (propA < propB) {
                return -1;
            } else if (propA > propB) {
                return 1;
            } else {
                return 0;
            }
        });
        return targetArray;
    }

    function processRenditions(renditions, callback) {
        var i,
            iMax = renditions.length,
            hlsRenditions = [],
            mp4Renditions = [],
            flvRenditions = [],
            otherRenditions = [];
        // separate renditions by type
        for (i = 0; i < iMax; i += 1) {
            if (renditions[i].video_container === 'M2TS') {
                hlsRenditions.push(renditions[i]);
            } else if (renditions[i].video_container === 'MP4') {
                mp4Renditions.push(renditions[i]);
            } else if (renditions[i].video_container === 'FLV') {
                flvRenditions.push(renditions[i]);
            } else {
                otherRenditions.push(renditions[i]);
            }
        }
        // sort renditions by encoding rate
        callback(hlsRenditions, mp4Renditions, flvRenditions, otherRenditions);
    }

    /**
     * determines whether specified item is in an array
     *
     * @param {array} array to check
     * @param {string} item to check for
     * @return {boolean} true if item is in the array, else false
     */
    function arrayContains(arr, item) {
        var i,
            iMax = arr.length;
        for (i = 0; i < iMax; i++) {
            if (arr[i] === item) {
                return true;
            }
        }
        return false;
    }

    function processCustomFields(fields) {
        var field;
        for (field in fields) {
            if (!arrayContains(customFields,field)) {
                customFields.push(field);
            }
        }
    }


    function startCSVStrings() {
        var i = 0, iMax;
        csvStr = '"ID","Name","Description","Date Added","Date Last Modified","Filename","Resolution","Duration(sec)","HLS Renditions (bitrate range KBPS)","MP4 Renditions (bitrate range KBPS)","FLV Renditions (bitrate range KBPS)",';
        if (customFields) {
            iMax = customFields.length;
            for (i; i < iMax; i++) {
                csvStr += '"' + customFields[i] + '",';
            }
        }
        csvStr += '\r\n';
    }

    function writeReport() {
        var i,
            iMax,
            j,
            jMax,
            video,
            hlsLowRate,
            hlsHighRate,
            mp4LowRate,
            mp4HighRate,
            flvLowRate,
            flvHighRate,
            resWidth,
            resHeight,
            rendition = {};
        if (videosArray.length > 0) {
            iMax = videosArray.length;
            for (i = 0; i < iMax; i += 1) {
                video = videosArray[i];
                // replace any line breaks in description, as that will break the CSV
                if (video.description) {
                    video.description = video.description.replace(/(?:\r\n|\r|\n)/g, ' ');
                }
                // generate the video detail row
                hlsLowRate = (video.hlsRenditions.length > 0) ? video.hlsRenditions[0].encoding_rate / 1000 : 0;
                hlsHighRate = (video.hlsRenditions.length > 0) ? video.hlsRenditions[video.hlsRenditions.length - 1].encoding_rate / 1000 : 0;
                mp4LowRate = (video.mp4Renditions.length > 0) ? video.mp4Renditions[0].encoding_rate / 1000 : 0;
                mp4HighRate = (video.mp4Renditions.length > 0) ? video.mp4Renditions[video.mp4Renditions.length - 1].encoding_rate / 1000 : 0;
                flvLowRate = (video.flvRenditions.length > 0) ? video.flvRenditions[0].encoding_rate / 1000 : 0;
                flvHighRate = (video.flvRenditions.length > 0) ? video.flvRenditions[video.flvRenditions.length - 1].encoding_rate / 1000 : 0;
                if (video.flvRenditions.length > 0) {
                    rendition = video.flvRenditions[video.flvRenditions.length - 1];
                } else if (video.mp4Renditions.length > 0) {
                    rendition = video.mp4Renditions[video.mp4Renditions.length - 1];
                } else if (video.hlsRenditions.length > 0) {
                    rendition = video.hlsRenditions[video.hlsRenditions.length - 1];
                } else {
                    rendition.frame_width = "unknown";
                    rendition.frame_height = "unknown";
                }
                resWidth = rendition.frame_width;
                resHeight = rendition.frame_height;
                // add csv row
                csvStr += '"' + video.id + '","' + video.name + '","' + video.description + '","' + video.created_at + '","' + video.updated_at + '","' + video.original_filename + '","' + resWidth + 'x' + resHeight + '","' + video.duration / 1000 + '","' + video.hlsRenditions.length + ' (' + hlsLowRate + '-' + hlsHighRate + ')","' + video.mp4Renditions.length + ' (' + mp4LowRate + '-' + mp4HighRate + ')","' + video.flvRenditions.length + ' (' + flvLowRate + '-' + flvHighRate + ')",';
                if (customFields) {
                    jMax = customFields.length;
                    for (j = 0; j < jMax; j++) {
                            if (video.custom_fields.hasOwnProperty(customFields[j])) {
                                csvStr += '"' + video.custom_fields[customFields[j]] + '",';
                            } else {
                                csvStr += '"",';
                            }
                    }
                    csvStr += '\r\n';
                } else {
                    csvStr += '\r\n';
                }
            }
            csvData.textContent += csvStr;
            // content = document.createTextNode('Finished! See the results or get the CSV data below.');
            pLogFinish.textContent = 'Finished! See the results or get the CSV data below.';
            // reportDisplay.innerHTML = summaryReportStr + reportStr;
            enableButtons();
        }
    }

    /**
     * sets up the data for the API request
     * @param {String} id the id of the button that was clicked
     */
    function setRequestData(id) {
        var endPoint = '',
            requestData = {};
        // disable buttons to prevent a new request before current one finishes
        disableButtons();
        switch (id) {
            case 'getCount':
                endPoint = accountId + '/counts/videos?sort=created_at';
                if (isDefined(tag.value)) {
                    endPoint += '&q=%2Btags:' + tag.value;
                }
                requestData.url = baseURL + endPoint;
                requestData.requestType = 'GET';
                apiRequest.textContent = requestData.url;
                getMediaData(requestData, id);
                break;
            case 'getCustomFields':
                endPoint = accountId + '/video_fields';
                requestData.url = baseURL + endPoint;
                requestData.requestType = 'GET';
                apiRequest.textContent = requestData.url;
                getMediaData(requestData, id);
                break;
            case 'getVideos':
                var offset = (limit * callNumber);
                endPoint = accountId + '/videos?sort=created_at&limit=' + limit + '&offset=' + offset;
                if (isDefined(tag.value)) {
                    endPoint += '&q=%2Btags:' + tag.value;
                }
                requestData.url = baseURL + endPoint;
                requestData.requestType = 'GET';
                apiRequest.textContent = requestData.url;
                getMediaData(requestData, id);
                break;
            case 'getVideoRenditions':
                var i,
                    iMax = videosArray.length,
                    callback = function(renditions) {
                        if (renditions.length > 0) {
                            // get the best MP4 rendition
                            processRenditions(renditions, function(hlsRenditions, mp4Renditions, flvRenditions, otherRenditions) {
                                if (hlsRenditions.length > 0) {
                                    sortArray(hlsRenditions, 'encoding_rate');
                                }

                                videosArray[callNumber].hlsRenditions = hlsRenditions;
                                if (mp4Renditions.length > 0) {
                                    sortArray(mp4Renditions, 'encoding_rate');
                                }
                                videosArray[callNumber].mp4Renditions = mp4Renditions;
                                if (flvRenditions.length > 0) {
                                    sortArray(flvRenditions, 'encoding_rate');
                                }
                                videosArray[callNumber].flvRenditions = flvRenditions;
                                // if (otherRenditions.length > 0) {
                                //     sortArray(otherRenditions, 'encoding_rate');
                                // }
                                // videosArray[callNumber].otherRenditions = otherRenditions;
                            });
                        } else {
                            videosArray[callNumber].hlsRenditions = [];
                            videosArray[callNumber].mp4Renditions = [];
                            videosArray[callNumber].flvRenditions = [];
                        }
                        videosCompleted++;
                        logText.textContent = totalVideos + ' videos found; videos retrieved: ' + videosCompleted;
                        callNumber++;
                        if (callNumber < totalVideos) {
                            setRequestData('getVideoRenditions');
                        } else {
                            // create csv headings
                            startCSVStrings();
                            // write the report
                            writeReport();
                        }
                    };
                videosArray[callNumber].hlsRenditions = [];
                videosArray[callNumber].mp4Renditions = [];
                videosArray[callNumber].flvRenditions = [];
                videosArray[callNumber].otherRenditions = [];
                endPoint = accountId + '/videos/' + videosArray[callNumber].id + '/assets/renditions';
                requestData.url = baseURL + endPoint;
                requestData.requestType = 'GET';
                apiRequest.textContent = requestData.url;
                spanRenditionsCountEl.textContent = callNumber + 1;
                getMediaData(requestData, id, callback);
                break;
        }
    }

    /**
     * send API request to the proxy
     * @param  {Object} requestData options for the request
     * @param  {String} requestID the type of request = id of the button
     * @param  {Function} [callback] callback function
     */
    function getMediaData(options, requestID, callback) {
        var httpRequest = new XMLHttpRequest(),
            responseRaw,
            parsedData,
            requestParams,
            dataString,
            renditions,
            field,
            i = 0,
            iMax,
            // response handler
            getResponse = function() {
                var videoCount;
                try {
                    if (httpRequest.readyState === 4) {
                        if (httpRequest.status >= 200 && httpRequest.status < 300) {
                            // check for completion
                            if (requestID === 'getCount') {
                                responseRaw = httpRequest.responseText;
                                parsedData = JSON.parse(responseRaw);
                                // set total videos
                                videoCount = parsedData.count;
                                if (totalVideos === "All") {
                                    totalVideos = videoCount;
                                } else {
                                    totalVideos = (totalVideos < videoCount) ? totalVideos : videoCount;
                                }
                                totalCalls = Math.ceil(totalVideos / limit);
                                logText.textContent = totalVideos + ' videos found; getting account custom fields';
                                setRequestData('getCustomFields');
                            } else if (requestID === 'getCustomFields') {
                                responseRaw = httpRequest.responseText;
                                parsedData = JSON.parse(responseRaw);
                                for (field in parsedData.custom_fields) {
                                    customFields.push(field);
                                }
                                logText.textContent = 'Custom fields retrieved; getting videos...';
                                spanRenditionsTotalEl.textContent = totalVideos;
                                setRequestData('getVideos');
                            } else if (requestID === 'getVideos') {
                                if (httpRequest.responseText === '[]') {
                                    // no video returned
                                    alert('no video returned');
                                }
                                responseRaw = httpRequest.responseText;
                                parsedData = JSON.parse(responseRaw);
                                videosArray = videosArray.concat(parsedData);
                                callNumber++;
                                if (callNumber < totalCalls) {
                                    setRequestData('getVideos');
                                } else {
                                    callNumber = 0;
                                    spanRenditionsCountEl.textContent = callNumber + 1;
                                    spanRenditionsTotalEl.textContent = totalVideos;
                                    setRequestData('getVideoRenditions');
                                }
                            } else if (requestID === 'getVideoRenditions') {
                                if (httpRequest.responseText === '[]') {
                                    // no video returned
                                    renditions = [];
                                    callback(renditions);
                                } else {
                                    responseRaw = httpRequest.responseText;
                                    renditions = JSON.parse(responseRaw);
                                    // increment offset
                                    callback(renditions);
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
        // event listeners
        csvData.addEventListener('click', function() {
            this.select();
        });
        // set up the log elements
        content = document.createTextNode('Getting renditions for video ');
        spanIntro2.appendChild(content);
        content = document.createTextNode(' of ');
        spanOf2.appendChild(content);
        spanRenditionsCount.setAttribute('id', 'spanRenditionsCount');
        spanRenditionsTotal.setAttribute('id', 'spanRenditionsTotal');
        pLogGettingRenditions.appendChild(spanIntro2);
        pLogGettingRenditions.appendChild(spanRenditionsCount);
        pLogGettingRenditions.appendChild(spanOf2);
        pLogGettingRenditions.appendChild(spanRenditionsTotal);
        logger.appendChild(pLogGettingRenditions);
        spanRenditionsCountEl = document.getElementById('spanRenditionsCount');
        spanRenditionsTotalEl = document.getElementById('spanRenditionsTotal');
        logger.appendChild(pLogFinish);

    }

    // button event handlers
    makeReport.addEventListener('click', function() {
        // get the inputs
        clientId = client_id.value;
        clientSecret = client_secret.value;
        totalVideos = getSelectedValue(videoCount);
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
        // get video count
        setRequestData('getCount');

    });

    init();
})(window, document);
