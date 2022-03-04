var BCLS = (function(window, document, aapi_model) {
    var dimension = 'device_os',
        description = document.getElementById('description'),
        paramTableBody = document.getElementById('paramTableBody'),
        fields = document.getElementById('fields'),
        filters = document.getElementById('filters'),
        dimensionRequest = document.getElementById('dimensionRequest'),
        filterRequest = document.getElementById('filterRequest'),
        responseEl = document.getElementById('response'),
        sendDimensionRequest = document.getElementById('sendDimensionRequest'),
        sendFilterRequest = document.getElementById('sendFilterRequest'),
        dimensionObj = aapi_model.dimensions[dimension],
        proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/dimension-guides-proxy.php';

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

    /**
     * disable a field or control
     * @param {HTMLelement} e the element to disable
     */
    function disable(e) {
        e.setAttribute('style', 'opacity:.5;cursor:not-allowed;');
    }

    /**
     * add the dimension description
     */
    function addDescription() {
        description.textContent = dimensionObj.description;
    }

    /**
     * inject the url param table
     */
    function addURLParams() {
        var param,
            thisParam,
            tr,
            td,
            txt,
            frag = new DocumentFragment();
        for (param in aapi_model.urlparams) {
            if (arrayContains(dimensionObj.urlparams, param)) {
                thisParam = aapi_model.urlparams[param];
                tr = document.createElement('tr');
                td = document.createElement('td');
                txt = document.createTextNode(param);
                tr.appendChild(td);
                td.appendChild(txt);
                td = document.createElement('td');
                txt = document.createTextNode(thisParam.description);
                tr.appendChild(td);
                td.appendChild(txt);
                td = document.createElement('td');
                if (thisParam.required) {
                    txt = document.createTextNode('yes');
                } else {
                    txt = document.createTextNode('no');
                }
                tr.appendChild(td);
                td.appendChild(txt);
                td = document.createElement('td');
                txt = document.createTextNode(thisParam.values);
                tr.appendChild(td);
                td.appendChild(txt);
                td = document.createElement('td');
                txt = document.createTextNode(thisParam.default);
                tr.appendChild(td);
                td.appendChild(txt);
                frag.appendChild(tr);
            }
        }
        paramTableBody.appendChild(frag);
    }

    /**
     * inject the field values
     */
    function addFieldValues() {
        var i,
            iMax,
            li,
            txt,
            frag = new DocumentFragment();
        iMax = dimensionObj.fields.length;
        for (i = 0; i < iMax; i++) {
            li = document.createElement('li');
            txt = document.createTextNode(dimensionObj.fields[i]);
            li.appendChild(txt);
            frag.appendChild(li);
        }
        fields.appendChild(frag);
    }

    /**
     * inject the filter values
     */
    function addFilterValues() {
        filters.textContent = 'Filter values: ' + dimensionObj.filter_values.join(', ');
    }

    /**
     * inject the sample requests
     */
    function addSampleRequests() {
        dimensionRequest.textContent = dimensionObj.samples[0].dimension;
        filterRequest.textContent = dimensionObj.samples[1].filter;
        if (dimensionObj.samples[1].filter == 'Not applicable') {
            disable(sendFilterRequest);
            sendFilterRequest.removeEventListener('click', function() {
                buildRequest('filter');
            });
        }
    }

    /**
     * handler for API request responses
     */
    function apiCallback(response) {
        responseEl.textContent = JSON.stringify(response, null, '  ');
    }

    /**
     * Builds the API requests and handles responses
     * @param {String} type the request type (getCount | getVideos | getAnalytics)
     */
    function buildRequest(type) {
        var requestOptions = {};
        switch (type) {
            case 'dimension':
                requestOptions.url = dimensionObj.samples[0].dimension;
                getData(requestOptions, type, apiCallback);
                break;
            case 'filter':
                requestOptions.url = dimensionObj.samples[1].filter;
                getData(requestOptions, type, apiCallback);
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
        // set response handler
        httpRequest.onreadystatechange = getResponse;
        // open the request
        httpRequest.open('POST', proxyURL);
        // set headers
        httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        // open and send request
        httpRequest.send(requestParams);
    }

    // event listeners
    sendDimensionRequest.addEventListener('click', function() {
        buildRequest('dimension');
    });

    sendFilterRequest.addEventListener('click', function() {
        buildRequest('filter');
    });

    function init() {
        addDescription();
        addURLParams();
        addFieldValues();
        addFilterValues();
        addSampleRequests();
    }

    init();


})(window, document, aapi_model);
