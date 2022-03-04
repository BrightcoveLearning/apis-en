var BCLS = (function(window, document, aapi_model) {
  var cmsBaseURL              = 'https://cms.api.brightcove.com/v1/accounts/',
      aapiBaseURL             = 'https://analytics.api.brightcove.com/v1/data',
      proxyURL                = 'https://solutions.brightcove.com/bcls/bcls-proxy/aapi-proxy.php',
      videoIds                = [],
      videoIdSets             = [],
      dimension,
      selectedDimensions      = [],
      fieldsToReturn          = [],
      fieldsCheckBoxes,
      dimensionCheckboxes,
      videoCount              = 0,
      totalVideoCalls         = 0,
      videoCallNumber         = 0,
      totalAnalyticsCalls     = 0,
      analyticsCallNumber     = 0,
      analyticsObject         = {},
      accountId,
      clientId,
      clientSecret,
      searchString,
      pageSize                = 25,
      account_id              = document.getElementById('account_id'),
      client_id               = document.getElementById('client_id'),
      client_secret           = document.getElementById('client_secret'),
      returnFields            = document.getElementById('returnFields'),
      fieldsButton            = document.getElementById('fieldsButton'),
      deselectFieldsButton    = document.getElementById('deselectFieldsButton'),
      dimensionsCol1          = document.getElementById('dimensionsCol1'),
      dimensionsCol2          = document.getElementById('dimensionsCol2'),
      fieldsCol1              = document.getElementById('fieldsCol1'),
      fieldsCol2              = document.getElementById('fieldsCol2'),
      dateSelect              = document.getElementById('dateSelect'),
      count                   = document.getElementById('count'),
      allButtons              = document.getElementsByTagName('button'),
      getData                 = document.getElementById('getData'),
      apiRequest              = document.getElementById('apiRequest'),
      apiMethod               = document.getElementById('apiMethod'),
      generatedContent        = document.getElementById('generatedContent'),
      responseData            = document.getElementById('responseData'),
      logger                  = document.getElementById('logger'),
      videoIds = [],
      i,
      iMax;

    /**
    * tests for all the ways a variable (string or number) might be undefined or not have a value
    * @param {String|Numbar} x the variable to test
    * @return {Boolean} true if variable is defined and has a value
    **/
    function isDefined(x) {
        if ( x === "" || x === null || x === undefined || x === NaN) {
           return false;
        }
        return true;
    }

    /**
     * get selected value for single select element
     * @param {htmlElement} e the select element
     * @return {Object} object containing the `value` and selected `index`
     */
    function getSelectedValue(e) {
        var val = e.options[e.selectedIndex].value,
            idx = e.selectedIndex;
        return {
            value: val,
            index: idx
        };
    }

    /**
     * determines whether specified item is in an array
     *
     * @param {array} array to check
     * @param {string} item to check for
     * @return {boolean} true if item is in the array, else false
     */
    function isItemInArray(arr, item) {
        var i,
            iMax = arr.length;
        for (i = 0; i < iMax; i++) {
            if (arr[i] === item) {
                return true;
            }
        }
        return false;
    }

    /**
     * find index of an object in array of objects
     * based on some property value
     *
     * @param {array} targetArray array to search
     * @param {string} objProperty object property to search
     * @param {string} value of the property to search for
     * @return {integer} index of first instance if found, otherwise returns -1
    */
    function findObjectInArray(targetArray, objProperty, value) {
        var i, totalItems = targetArray.length, objFound = false;
        for (i = 0; i < totalItems; i++) {
            if (targetArray[i][objProperty] === value) {
                objFound = true;
                return i;
            }
        }
        if (objFound === false) {
            return -1;
        }
    }

    /**
     * dedupe a simple array of strings or numbers
     * @param {array} arr the array to be deduped
     * @return {array} the deduped array
     */
    function dedupe(arr) {
        var i,
            len = arr.length,
            out = [],
            obj = {};

        for (i = 0;i < len; i++) {
            obj[arr[i]] = 0;
        }
        for (i in obj) {
            out.push(i);
        }
        return out;
    }

    /**
     * getSelectedCheckboxes returns an array of the values
     * of checked checkboxes
     * @param {htmlElementCollection} checkboxCollection a collection of the checkbox elements, usually gotten by document.getElementsByName()
     * @param {Array} targetArray the array to store the values in
     */
    function getSelectedCheckboxes(checkboxCollection) {
        var i,
            tmpArray = [],
            iMax = checkboxCollection.length;
        for (i = 0; i < iMax; i += 1) {
            if (checkboxCollection[i].checked) {
                tmpArray.push(checkboxCollection[i].value);
            }
        }
        return tmpArray;
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
        return;
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
        return;
    }

    /**
     * updateRequestDisplay - gets the selected checkboxes and update the fields list display
     */
    function updateRequestDisplay() {
        apiRequest.textContent = 'https://analytics.api.brightcove.com/v1/data?accounts=ACCOUNT_ID';
        if (selectedDimensions.length > 0) {
            apiRequest.textContent += '&dimensions=' + selectedDimensions.join(',');
        }
        if (fieldsToReturn.length > 0) {
            apiRequest.textContent += '&fields=' + fieldsToReturn.join(',');
        }
    }

    /**
     * adds dimension options from the aapi_model
     */
    function addDimensionOptions() {
        var i,
            iMax,
            dimensionsArray = [],
            j,
            jMax,
            option,
            input,
            label,
            text,
            br,
            half;
        // clear existing dimension checkboxes
        dimensionsCol1.innerHTML = '';
        dimensionsCol2.innerHTML = '';
        // add the return field options
        dimensionsArray = aapi_model.dimensions;
        i = dimensionsArray.length;
        while (i > 0) {
            i--;
            if (isItemInArray(aapi_model.combinations.video.incompatible_dimensions, dimensionsArray[i].name)) {
                dimensionsArray.splice(i, 1);
            }
        }
        iMax = dimensionsArray.length;
        half = Math.ceil(iMax / 2);
        for (i = 0; i < half; i += 1) {
            input = document.createElement('input');
            label = document.createElement('lable');
            input.setAttribute('name', 'dimensionsChk');
            input.setAttribute('id', 'dim' + dimensionsArray[i].name);
            input.setAttribute('data-index', 'i');
            input.setAttribute('type', 'checkbox');
            input.setAttribute('value', dimensionsArray[i].name);
            label.setAttribute('for', 'dim' + dimensionsArray[i].name);
            text = document.createTextNode(' ' + dimensionsArray[i].name);
            br = document.createElement('br');
            dimensionsCol1.appendChild(input);
            dimensionsCol1.appendChild(label);
            label.appendChild(text);
            dimensionsCol1.appendChild(br);
            }
        for (i = half; i < iMax; i += 1) {
            input = document.createElement('input');
            label = document.createElement('lable');
            input.setAttribute('name', 'dimensionsChk');
            input.setAttribute('id', 'dim' + dimensionsArray[i].name);
            input.setAttribute('data-index', 'i');
            input.setAttribute('type', 'checkbox');
            input.setAttribute('value', dimensionsArray[i].name);
            label.setAttribute('for', 'dim' + dimensionsArray[i].name);
            text = document.createTextNode(' ' + dimensionsArray[i].name);
            br = document.createElement('br');
            dimensionsCol2.appendChild(input);
            dimensionsCol2.appendChild(label);
            label.appendChild(text);
            dimensionsCol2.appendChild(br);
        }
        // get a reference to the checkbox collection
        dimensionCheckboxes = document.getElementsByName('dimensionsChk');
    }

    /**
     * addFieldOptions generates checkboxes for each field
     * available for the selected dimension
     *
     * @ {Number} idx the index of the dimension object in the aapi_model
     */
    function addFieldOptions() {
        var fieldsArray = [],
            dimensionName,
            dimensionIndex,
            thisDimensionFields,
            i,
            iMax,
            j,
            jMax,
            input,
            label,
            text,
            br,
            half;
        // clear existing field checkboxes
        fieldsCol1.innerHTML = '';
        fieldsCol2.innerHTML = '';

        dimensionName = selectedDimensions.join('__');
        // video is always part of the dimensions
        if (!isItemInArray(selectedDimensions, 'video')) {
            dimensionName += '__video';
        }
        console.log('aapi_model.combinations[dimensionName]', aapi_model.combinations[dimensionName]);
        // dimensionIndex = findObjectInArray(aapi_model.dimensions, 'name', dimensionName);
        fieldsArray = aapi_model.combinations[dimensionName].fields;
        // add the return field options
        iMax = fieldsArray.length;
        half = Math.ceil(iMax / 2);
        for (i = 0; i < half; i += 1) {
            input = document.createElement('input');
            label = document.createElement('label');
            input.setAttribute('name', 'fieldsChk');
            input.setAttribute('id', 'field' + fieldsArray[i]);
            input.setAttribute('type', 'checkbox');
            input.setAttribute('value', fieldsArray[i]);
            label.setAttribute('for', 'field' + fieldsArray[i]);
            text = document.createTextNode(' ' + fieldsArray[i]);
            br = document.createElement('br');
            fieldsCol1.appendChild(input);
            fieldsCol1.appendChild(label);
            label.appendChild(text);
            fieldsCol1.appendChild(br);
        }
        for (i = half; i < iMax; i += 1) {
            input = document.createElement('input');
            label = document.createElement('label');
            input.setAttribute('name', 'fieldsChk');
            input.setAttribute('id', 'field' + fieldsArray[i]);
            input.setAttribute('type', 'checkbox');
            input.setAttribute('value', fieldsArray[i]);
            label.setAttribute('for', 'field' + fieldsArray[i]);
            text = document.createTextNode(' ' + fieldsArray[i]);
            br = document.createElement('br');
            fieldsCol2.appendChild(input);
            fieldsCol2.appendChild(label);
            label.appendChild(text);
            fieldsCol2.appendChild(br);
        }
        // get a reference to the checkbox collection
        fieldsCheckboxes = document.getElementsByName('fieldsChk');
    }

    /**
     * splitVideoIdsIntoSets - splits the videoIds array into
     * sets of 100 or less (because you can only get analytics
     * on about 100 videos at a time without exceeding the maximum
     * url length for the Analytics API request)
     */
    function splitVideoIdsIntoSets() {
        var tmpArray = [];
        // grab the first 100 as a new array, push into sets array
        tmpArray = videoIds.splice(0, 100);
        videoIdSets.push(tmpArray);
        // function recalls itself until videoIds array is empty
        if (videoIds.length > 0) {
            splitVideoIdsIntoSets();
        } else {
            return;
        }
    }

    /**
     * sets up the data for the API request
     * @param {String="getCount","getVideos","getData"} id the id for the call type
     */
    function setRequestData(id) {
        var endPoint = searchString,
            requestData = {},
            baseURL;
        // disable buttons to prevent a new request before current one finishes
        disableButtons();
        switch (id) {
            case 'getCount':
                baseURL = cmsBaseURL + accountId + '/counts/videos?';
                endPoint = searchString;
                requestData.url = baseURL + endPoint;
                requestData.requestType = 'GET';
                apiRequest.textContent = requestData.url;
                apiMethod.textContent = requestData.requestType;
                getMediaData(requestData, id);
                break;
            case 'getVideos':
                baseURL = cmsBaseURL + accountId + '/videos?';
                endPoint = searchString + '&limit=' + pageSize + '&sort=created_at&offset=' + pageSize * videoCallNumber;
                requestData.url = baseURL + endPoint;
                requestData.requestType = 'GET';
                apiRequest.textContent = requestData.url;
                apiMethod.textContent = requestData.requestType;
                getMediaData(requestData, id);
                break;
            case 'getAnalytics':
                var videoIdStr = videoIdSets[analyticsCallNumber].join(',');
                baseURL = aapiBaseURL;
                dimension = selectedDimensions.join(',');
                endPoint = '?accounts=' + accountId + '&dimensions=' + dimension + '&where=video==' + videoIdStr + '&fields=' + fieldsToReturn.join(',');
                requestData.url = baseURL + endPoint;
                requestData.requestType = 'GET';
                apiRequest.textContent = requestData.url;
                apiMethod.textContent = requestData.requestType;
                getMediaData(requestData, id);
                break;
        }
    }

    /**
     * send API request to the proxy
     * @param  {Object} requestData options for the request
     * @param  {String} requestID the type of request = id of the button
     */
    function getMediaData(options, requestID) {
        var httpRequest = new XMLHttpRequest(),
            responseRaw,
            parsedData,
            requestParams,
            dataString,
            i,
            iMax,
            // response handler
            getResponse = function() {
                try {
                  if (httpRequest.readyState === 4) {
                    if (httpRequest.status >= 200 && httpRequest.status < 300) {
                      // check for completion
                      if (requestID === 'getCount') {
                        if (httpRequest.responseText === '[]') {
                            // no video returned
                            alert('no video returned');
                        }
                        responseRaw = httpRequest.responseText;
                        responseData.textContent = responseRaw;
                        parsedData = JSON.parse(responseRaw);
                        // set total videos
                        videoCount = parsedData.count;
                        // calulate total video calls
                        totalVideoCalls = Math.ceil(videoCount / pageSize);
                        console.log('count', videoCount);
                        console.log('totalVideoCalls', totalVideoCalls);
                        count.textContent = 'Total videos: ' + videoCount;
                        setRequestData('getVideos');
                    } else if (requestID === 'getVideos') {
                        responseRaw = httpRequest.responseText;
                        responseData.textContent = responseRaw;
                        parsedData = JSON.parse(responseRaw);
                        console.log('parsedData', parsedData);
                        // add the video ids to the videoIds array
                        iMax = parsedData.length;
                        for (i = 0; i < iMax; i += 1) {
                            videoIds.push(parsedData[i].id);
                        }
                        // if there are more videos, make another requestID
                        videoCallNumber++;
                        if (videoCallNumber < totalVideoCalls) {
                            // make the next call
                            setRequestData('getVideos');
                        } else {
                            console.log('videoIds', videoIds);
                            // got all the videos, move on
                            // split the videoIds array into sets of 100
                            splitVideoIdsIntoSets();
                            console.log('videoIdSets', videoIdSets);
                            // make the analytics requests
                            setRequestData('getAnalytics');
                        }
                    } else if (requestID === 'getAnalytics') {
                        responseRaw = httpRequest.responseText;
                        responseData.textContent = responseRaw;
                        parsedData = JSON.parse(responseRaw);
                        console.log('parsedData', parsedData);
                        // add this data to the summation object
                        analyticsObject.item_count += parsedData.item_count;
                        analyticsObject.summary.video_view += parsedData.summary.video_view;
                        iMax = parsedData.items.length;
                        for (i = 0; i < iMax; i += 1) {
                            analyticsObject.items.push(parsedData.items[i]);
                        }
                        // check to see if there are more calls to make
                        analyticsCallNumber++;
                        if (analyticsCallNumber < totalAnalyticsCalls) {
                            // make the next call
                            setRequestData('getAnalytics');
                        } else {
                            // we are done - display the final results
                            responseData.textContent = JSON.stringify(analyticsObject, null, '  ');
                        }
                      }
                    } else {
                      alert('There was a problem with the request. Request returned ' + httpRequest.status);
                    }
                  }
                } catch (e) {
                  alert('Caught Exception: ' + e);
                }
            };
        // set up request data
        requestParams = 'url=' + encodeURIComponent(options.url) + '&requestType=' + options.requestType;
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
        // set up dimensions
        addDimensionOptions();
        // set up fields
        // set up analytics object
        analyticsObject.item_count = 0;
        analyticsObject.summary = {};
        analyticsObject.summary.video_view = 0;
        analyticsObject.items = [];
        // event listeners
        getData.addEventListener('click', function() {
            var i,
                iMax,
                selectedDateObj,
                    dimensionObj,
                    displayFields = '';
                // make sure arrays are emptied out
                selectedDimensions = [];
                fieldsToReturn = [];
            // get account values
            accountId = isDefined(account_id.value) ? account_id.value : '1752604059001';
            console.log('accountId', accountId);
            clientId = client_id.value;
            clientSecret = client_secret.value;
            // get dimension in case it wasn't changed
            selectedDimensions = getSelectedCheckboxes(dimensionCheckboxes);
            // in case nothing was selected
            if (selectedDimensions.length === 0) {
                selectedDimensions = ['video'];
            }
            // get date range in case it wasn't changed
            selectedDateObj = getSelectedValue(dateSelect);
            searchString = 'q=created_at:%2D' + selectedDateObj.value + 'd..';
            // get the array of fields from the fieldsCheckboxes
            fieldsToReturn = getSelectedCheckboxes(fieldsCheckboxes);
            if (fieldsToReturn.length === 0) {
                // in case nothing was selected
                fieldsToReturn = ['video_view'];
            }
            // make the request
            // get the video count
            setRequestData('getCount');
        });

        // dimensions
        iMax = dimensionCheckboxes.length;
        for (i = 0; i < iMax; i += 1) {
            dimensionCheckboxes[i].addEventListener('click', function() {
                var dateArray = [],
                j,
                jMax,
                thisDimension,
                idx;
                // empty selected dimensions arrays
                selectedDimensions = [];
                selectedDimensions = getSelectedCheckboxes(dimensionCheckboxes);
                if (aapi_model.combinations.hasOwnProperty(selectedDimensions.join('__'))) {
                    addFieldOptions();
                } else {
                    fieldsCol1.innerHTML = '<strong>The dimension combination is not valid</strong>';
                    fieldsCol2.innerHTML = '';
                }
            });
        }


        fieldsButton.addEventListener('click', function() {
            var i,
                    iMax = fieldsCheckboxes.length;
            for (i = 0; i < iMax; i += 1) {
                    fieldsCheckboxes[i].setAttribute('checked', 'checked');
            }
                fieldsToReturn = getSelectedCheckboxes(fieldsCheckboxes);
                // update fields display
                updateRequestDisplay();
        });

        deselectFieldsButton.addEventListener('click', function() {
            var i,
                    iMax = fieldsCheckboxes.length;
            for (i = 0; i < iMax; i += 1) {
                    fieldsCheckboxes[i].removeAttribute('checked');
            }
                fieldsToReturn = [];
                // update fields display
                updateRequestDisplay();
        });

        dateSelect.addEventListener('change', function() {
            var selectedValueObj = getSelectedValue(dateSelect);
            searchString = 'q=created_at:%2D' + selectedValueObj.value + 'd..';
        });

    }

    init();
})(window, document, aapi_model);
