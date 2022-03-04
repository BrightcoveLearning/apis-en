var BCLS = ( function (window, document, aapi_model, Prism) {
    var filterAllowableValues = document.getElementById("filterAllowableValues"),
        paramTable = document.getElementById("paramTable"),
        combination,
        proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/aapi-proxy.php',
        dimension,
        selectedDimensions      = [],
        fromDate,
        fieldsToReturn          = [],
        fieldsCheckboxes,
        dimensionCheckboxes,
        accountId,
        clientId,
        clientSecret,
        searchString,
        account_id              = document.getElementById('account_id'),
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
        fieldsArrayDisplay,
        generatedContent        = document.getElementById('generatedContent'),
        responseData            = document.getElementById('responseData'),
        dimensionsParam,
        fromDisplay             = document.getElementById('fromDisplay'),
        logger                  = document.getElementById('logger'),
        i,
        iMax;

    /**
     * logging
     */
    function bclslog(context, message) {
        if (window["console"] && console["log"]) {
          console.log(context, message);
        }
    }
    /**
     * builds param summary table
     */
    function buildParamTable() {
        var thisParam,
            str = "",
            i,
            iMax = aapi_model.params.length;
            for (i = 0; i < iMax; i++) {
                thisParam = aapi_model.params[i];
                str += "<tr><td>" + thisParam.name + "</td><td>" + thisParam.required + "</td><td>" + thisParam.description + "</td><td>" + thisParam.values + "</td><td>" + thisParam.default + "</td></tr>";
            }
            paramTable.innerHTML = str;
    }
    /**
     * built filter values
     */
    function buildFilterValueTable() {
        var thisDimension,
            thisValues,
            i,
            iMax = aapi_model.dimensions.length,
            j,
            jMax,
            str = "";
        for (i = 0; i < iMax; i++) {
            thisDimension = aapi_model.dimensions[i];
            thisValues = thisDimension.filter_values;
            str += "<tr><td>" + thisDimension.name + "</td><td><ul>";
            jMax = thisValues.length;
            for (j = 0; j < jMax; j++) {
                str += "<li>" + thisValues[j] + "</li>";
            }
            str += "</td></tr>";
        }
        filterAllowableValues.innerHTML = str;
    }
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
        }
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
    };

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
    function getSelectedCheckboxes(checkboxCollection, targetArray) {
        var i,
            iMax = checkboxCollection.length;
        for (i = 0; i < iMax; i += 1) {
            if (checkboxCollection[i].checked) {
                targetArray.push(checkboxCollection[i].value);
            }
        }
        return targetArray;
    }

    /**
     * disables all buttons so user can't submit new request until current one finishes
     */
    function disableButtons() {
        var i,
            iMax = allButtons.length;
        for (i = 0; i < iMax; i++) {
            allButtons[i].setAttribute('disabled', 'disabled');
            allButtons[i].setAttribute('style', 'opacity:.5;cursor:not-allowed;');
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
            allButtons[i].removeAttribute('style');
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
        if (isDefined(fromDate)) {

        }
    }

    /**
     * adds dimension options from the aapi_model
     */
    function addDimensionOptions() {
        var i,
            iMax,
            input,
            text,
            label,
            br,
            half;
        // clear existing dimension checkboxes
        dimensionsCol1.innerHTML = '';
        dimensionsCol2.innerHTML = '';
        // add the return field options
        iMax = aapi_model.dimensions.length;
        half = Math.ceil(iMax / 2);
        for (i = 0; i < half; i += 1) {
            input = document.createElement('input');
            label = document.createElement('label');
            input.setAttribute('name', 'dimensionsChk');
            input.setAttribute('id', 'dim' + aapi_model.dimensions[i].name);
            input.setAttribute('data-index', i);
            input.setAttribute('type', 'checkbox');
            input.setAttribute('value', aapi_model.dimensions[i].name);
            label.setAttribute('for', 'dim' + aapi_model.dimensions[i].name);
            text = document.createTextNode(' ' + aapi_model.dimensions[i].name);
            br = document.createElement('br');
            dimensionsCol1.appendChild(input);
            dimensionsCol1.appendChild(label);
            label.appendChild(text);
            dimensionsCol1.appendChild(br);
        }
        for (i = half; i < iMax; i += 1) {
            input = document.createElement('input');
            label = document.createElement('label');
            input.setAttribute('name', 'dimensionsChk');
            input.setAttribute('id', 'dim' + aapi_model.dimensions[i].name);
            input.setAttribute('data-index', 'i');
            input.setAttribute('type', 'checkbox');
            input.setAttribute('value', aapi_model.dimensions[i].name);
            label.setAttribute('for', 'dim' + aapi_model.dimensions[i].name);
            text = document.createTextNode(' ' + aapi_model.dimensions[i].name);
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
     * available for the selected dimensions
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
        // set up event listeners
        iMax = fieldsCheckboxes.length;
        for (i = 0; i < iMax; i += 1) {
            fieldsCheckboxes[i].addEventListener('click', function() {
                fieldsToReturn = getSelectedCheckboxes(fieldsCheckboxes, fieldsToReturn);
                updateRequestDisplay();
            });
        }
    }

    /**
     * sets up the data for the API request
     * @param {String="getCount","getVideos","getData"} id the id for the call type
     */
    function setRequestData(id) {
        var requestData = {},
        baseURL = 'https://analytics.api.brightcove.com/v1/data';
        // disable buttons to prevent a new request before current one finishes
        disableButtons();
        endPoint = '?accounts=' + accountId + '&dimensions=' + selectedDimensions.join(',') + '&fields=' + fieldsToReturn.join(',');
        requestData.url = baseURL + endPoint;
        requestData.requestType = 'GET';
        apiRequest.textContent = requestData.url;
        getMediaData(requestData, id);
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
                        responseRaw = httpRequest.responseText;
                        responseData.textContent = responseRaw;
                        parsedData = JSON.parse(responseRaw);
                        responseData.textContent = JSON.stringify(parsedData, null, '  ');
                        // Rerun Prism syntax highlighting on the current page
                        Prism.highlightAll();
                        // re-enable buttons
                        enableButtons();
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
        if (options.requestBody) {
            dataString = JSON.stringify(options.requestBody);
            requestParams += "&requestBody=" + encodeURIComponent(dataString);
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
        buildParamTable();
        buildFilterValueTable();
        // set up dimensions
        addDimensionOptions();
        // initially disable buttons
        disableButtons();
        // set up fields
        // selectedDimensions = ['video'];
        // addFieldOptions();
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
            accountId = account_id.value;
            // get dimension in case it wasn't changed
            selectedDimensions = getSelectedCheckboxes(dimensionCheckboxes, selectedDimensions);
            // get the array of fields from the fieldsCheckboxes
            fieldsToReturn = getSelectedCheckboxes(fieldsCheckboxes, fieldsToReturn);
            // make the request
            setRequestData('getAnalytics');
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
                selectedDimensions = getSelectedCheckboxes(dimensionCheckboxes, selectedDimensions);
                if (aapi_model.combinations.hasOwnProperty(selectedDimensions.join('__'))) {
                    addFieldOptions();
                    // get earliest date === latest date for selected dimensions
                    jMax = selectedDimensions.length;
                    for (j = 0; j < jMax; j += 1) {
                        dateArray = dateArray.concat(aapi_model.combinations[selectedDimensions[j]].from);
                    }
                    dateArray.sort();
                    fromDate = dateArray[dateArray.length - 1];
                    // display earliest data
                    fromDisplay.textContent = fromDate;
                } else {
                    fieldsCol1.innerHTML = '<strong>The dimension combination is not valid</strong>';
                    fieldsCol2.innerHTML = '';
                }
                if (selectedDimensions.length > 0) {
                    // enable buttons
                    enableButtons();
                } else {
                    disableButtons();
                }


            });
        }

        fieldsButton.addEventListener('click', function() {
            var i,
                iMax = fieldsCheckboxes.length;
            for (i = 0; i < iMax; i += 1) {
                fieldsCheckboxes[i].setAttribute('checked', 'checked');
            }
            fieldsToReturn = getSelectedCheckboxes(fieldsCheckboxes, fieldsToReturn);
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
    };
    init();
    return {}
})(window, document, aapi_model, Prism);
