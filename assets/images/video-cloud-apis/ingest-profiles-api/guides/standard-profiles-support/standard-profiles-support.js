var BCLS = (function (window, document, Handlebars, bclsProfiles_cached) {
    'use strict';
    var mainSection = document.getElementById('main'),
        jsonData = document.getElementById('jsonData'),
        proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy.php',
        requestData = 'client_id=cca7ae2a-503d-472e-996c-3aa664d4aa95&client_secret=OE43iNQ6HluFxM2I_f6QDfGLoSSW28jnDWbX8gDgS6GIFD2P6VNWKbRHyln0I5aVyoSeil0l5ikWYQ2hUbR99g&url=' + encodeURI('https://ingestion.api.brightcove.com/v1/accounts/3921507403001/profiles') + '&requestBody=null&requestType=GET',
        data = bclsProfiles_cached,
        liveProfiles = ['Live - HD', 'Live - Standard', 'Live - Premium HD'],
        currentProfiles = ['screencast-1280', 'smart-player-transition', 'single-bitrate-high', 'videocloud-default-v1', 'single-bitrate-standard', 'high-resolution'],
        profileListTemplate = '{{#BCLSprofilesArray}}<tr><td><a href=\"#{{name}}\">{{name}}</a></td><td class=\"bcl-center\">{{videoRenditions}}</td><td class=\"bcl-center\">{{audioRenditions}}</td><td class=\"bcl-center\">{{imageRenditions}}</td><td>{{description}}</td></tr>{{/BCLSprofilesArray}}',
        navLabel = [],
        // functions
        buildSummaryTable,
        buildDetailTables,
        buildJsonData,
        getProfileData,
        removeExtraProfiles,
        isItemInArray,
        dedupe,
        isDefined,
        bclslog;

    /**
     * tests for all the ways a variable might be undefined or not have a value
     * @param {*} x the variable to test
     * @return {Boolean} true if variable is defined and has a value
     */
    isDefined = function (x) {
        if (x === '' && x === null && x !== undefined && x === NaN) {
            return false;
        }
        return true;
    };

    /**
     * dedupe a simple array of strings or numbers
     * @param {array} arr the array to be deduped
     * @return {array} out the deduped array
     */
    dedupe = function (arr) {
        var i,
            len = arr.length,
            out = [],
            obj = {};

        for (i = 0; i < len; i++) {
            obj[arr[i]] = 0;
        }
        for (i in obj) {
            out.push(i);
        }
        return out;
    };

    /**
     * determines whether specified item is in an array
     *
     * @param {array} array to check
     * @param {string} item to check for
     * @return {boolean} true if item is in the array, else false
     */
    isItemInArray = function (arr, item) {
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
     * Logging function - safe for IE
     * @param  {string} context description of the data
     * @param  {*} message the data to be logged by the console
     * @return {}
     */
    bclslog = function (context, message) {
        if (window['console'] && console['log']) {
            console.log(context, message);
        }
        return;
    };
    /**
     * [removeExtraProfiles description]
     */
    removeExtraProfiles = function () {
        var i = data.BCLSprofilesArray.length,
            item;

        while (i > 0) {
            i--;
            item = data.BCLSprofilesArray[i];
            if (!isItemInArray(currentProfiles, item.name)) {
                data.BCLSprofilesArray.splice(i, 1);
            }
        }

    };

    buildSummaryTable = function () {
        var newSectionNode = document.createElement('section'),
            sectionHeadingNode = document.createElement('h2'),
            sectionIntroNode = document.createElement('p'),
            profileTableNode = document.createElement('table'),
            profiletheadNode = document.createElement('thead'),
            profiletbodyNode = document.createElement('tbody'),
            sectionHeadingElem,
            sectionIntroElem,
            profileTableElem,
            profiletheadElem,
            profiletbodyElem,
            template = profileListTemplate,
            profileDescriptions = [
                {'name': 'Live - HD', 'description': 'High definition rendition set for Live'},
                {'name': 'Live - Premium HD', 'description': 'Premium rendition set for Live'},
                {'name': 'Live - Standard', 'description': 'Standard rendition set for Live'},
                {'name': 'screencast-1280', 'description': 'Profile for screencasts'},
                {'name': 'smart-player-transition', 'description': 'General purpose settings to deliver quality content for accounts that use a mixture of Smart Player and Brightcove Player. Resolutions range from 480x270 to 1280x720.'},
                {'name': 'single-bitrate-high', 'description': 'legacy profile - not recommended for use'},
                {'name': 'high-resolution', 'description': 'General purpose settings to deliver high quality content for a wide range content types and screen sizes. Resolutions range from 480x270 to 1920x1080 with a max video bitrate of 4000 kbps.'},
                {'name': 'videocloud-default-v1', 'description': 'Default profile for Video Cloud accounts. A range of sizes and bitrates to accommodate general video publishing scenarios.'},
                {'name': 'single-bitrate-standard', 'description': 'A good range of MP4 renditions, no HLS'}
            ],
            i, iMax, j, jMax, k, kMax, item;
        iMax = data.BCLSprofilesArray.length;
        // massage data
        for (i = 0; i < iMax; i++) {
            item = data.BCLSprofilesArray[i];
            item.videoRenditions = 0;
            item.audioRenditions = 0;
            item.imageRenditions = 0;
            jMax = item.renditions.length;
            item.numRenditions = jMax;
            kMax = profileDescriptions.length;
            for (k = 0; k < kMax; k++) {
                if (item.name === profileDescriptions[k].name) {
                    item.description = profileDescriptions[k].description;
                }
            }

            for (j = 0; j < jMax; j++) {
                if (item.renditions[j].format === 'ts') {
                    item.renditions[j].format = 'ts (HLS)';
                }
                if (item.renditions[j].media_type === 'video') {
                    item.videoRenditions++;
                } else if (item.renditions[j].media_type === 'image') {
                    item.imageRenditions++;
                } else if (item.renditions[j].media_type === 'audio') {
                    item.audioRenditions++;
                }
            }

        }
        newSectionNode.setAttribute('id', 'summaryTableSection');
        newSectionNode.setAttribute('class', 'bcls-section');
        sectionHeadingNode.setAttribute('id', 'summaryTableHeading');
        sectionIntroNode.setAttribute('id', 'summarySectionIntro');
        profileTableNode.setAttribute('id', 'profileSummaryTable');
        profileTableNode.setAttribute('class', 'bcls-table');
        profiletheadNode.setAttribute('id', 'profileSummaryTableThead');
        profiletheadNode.setAttribute('class', 'bcls-table__head');
        profiletbodyNode.setAttribute('id', 'profileSummaryTableTbody');
        profiletbodyNode.setAttribute('class', 'bcls-table__body');
        newSectionNode.appendChild(sectionHeadingNode);
        newSectionNode.appendChild(sectionIntroNode);
        newSectionNode.appendChild(profileTableNode);
        profileTableNode.appendChild(profiletheadNode);
        profileTableNode.appendChild(profiletbodyNode);
        mainSection.appendChild(newSectionNode);
        sectionHeadingElem = document.getElementById('summaryTableHeading');
        sectionIntroElem = document.getElementById('summarySectionIntro');
        profiletheadElem = document.getElementById('profileSummaryTableThead');
        profiletbodyElem = document.getElementById('profileSummaryTableTbody');
        sectionHeadingElem.innerHTML = 'Standard Profiles List';
        sectionIntroElem.innerHTML = 'Click on a profile name to see details of the renditions it includes. Note that the actual renditions created will depend on the quality of the source video.';
        profiletheadElem.innerHTML = '<tr><th>Profile Name</th><th>Video Renditions</th><th>Audio Renditions</th><th>Image Renditions</th><th>Description</th></tr>';
        template = Handlebars.compile(profileListTemplate);
        profiletbodyElem.innerHTML = template(data);
    };
    buildDetailTables = function () {
        bclslog('building data tables');
        var newSectionNode,
            sectionHeadingNode,
            sectionHeadingLink,
            renditionTableNode,
            renditiontheadNode,
            renditiontbodyNode,
            sectionHeadingElem,
            renditionTableElem,
            renditiontheadElem,
            renditiontbodyElem,
            i, j, jMax,
            iMax = data.BCLSprofilesArray.length,
            headings,
            rendition,
            renditionProperty;
        for (i = 0; i < iMax; i++) {
            var headersArray = [],
                thStr = '',
                tbStr = '',
                l,
                lMax,
                re = /_/g;
            newSectionNode = document.createElement('section');
            sectionHeadingNode = document.createElement('h2');
            sectionHeadingLink = document.createElement('a');
            sectionHeadingLink.setAttribute('href', '#' + data.BCLSprofilesArray[i].name + '-json');
            newSectionNode.setAttribute('id', data.BCLSprofilesArray[i].name);
            newSectionNode.setAttribute('class', 'bcls-section');
            sectionHeadingNode.setAttribute('id', data.BCLSprofilesArray[i].name + '_summaryTableHeading');
            sectionHeadingLink.appendChild(sectionHeadingNode);
            newSectionNode.appendChild(sectionHeadingLink);

            mainSection.appendChild(newSectionNode);
            sectionHeadingElem = document.getElementById(data.BCLSprofilesArray[i].name + '_summaryTableHeading');
            // sectionSubHeadingElem = document.getElementById(data.BCLSprofilesArray[i].name + '_summarySubHeading');
            // sectionTableHeadingElem = document.getElementById(data.BCLSprofilesArray[i].id + '_profileSummaryTable');
            sectionHeadingElem.innerHTML = data.BCLSprofilesArray[i].name;
            jMax = data.BCLSprofilesArray[i].renditions.length;
            renditionTableNode = document.createElement('table');
            renditiontheadNode = document.createElement('thead');
            renditiontbodyNode = document.createElement('tbody');
            renditionTableNode.setAttribute('id', data.BCLSprofilesArray[i].id + '_profileSummaryTable');
            renditionTableNode.setAttribute('class', 'bcls-table');
            renditiontheadNode.setAttribute('id', data.BCLSprofilesArray[i].id + '_profileSummaryTableThead');
            renditiontheadNode.setAttribute('class', 'bcls-table__head');
            renditiontbodyNode.setAttribute('id', data.BCLSprofilesArray[i].id + '_profileSummaryTableTbody');
            renditiontbodyNode.setAttribute('class', 'bcls-table__body');
            newSectionNode.appendChild(renditionTableNode);
            renditionTableNode.appendChild(renditiontheadNode);
            renditionTableNode.appendChild(renditiontbodyNode);
            renditiontheadElem = document.getElementById(data.BCLSprofilesArray[i].id + '_profileSummaryTableThead');
            renditiontbodyElem = document.getElementById(data.BCLSprofilesArray[i].id + '_profileSummaryTableTbody');
            // get all properties and build the table headers
            for (j = 0; j < jMax; j++) {
                var prop;
                thStr += '<tr>';
                rendition = data.BCLSprofilesArray[i].renditions[j];
                for (prop in rendition) {
                    if (prop !== 'id') {
                        headersArray.push(prop);
                    }
                }
            }
            // dedupe the headers
            headersArray = dedupe(headersArray);
            // write the th elements to the string
            lMax = headersArray.length;
            for (l = 0; l < lMax; l++) {
                thStr += '<th>' + headersArray[l].replace(re, ' ') + '</th>';
            }
            thStr += '</tr>';
            renditiontheadElem.innerHTML = thStr;
            // now add the body row for each rendition
            for (j = 0; j < jMax; j++) {
                tbStr = '<tr>';
                rendition = data.BCLSprofilesArray[i].renditions[j];
                for (l = 0; l < lMax; l++) {
                    tbStr += '<td>';
                    tbStr += isDefined(rendition[headersArray[l]]) ? rendition[headersArray[l]] : '';
                    tbStr += '</td>';
                }
                tbStr += '</tr>';
                renditiontbodyElem.innerHTML += tbStr;
            }
        }
        buildJsonData();
    };


    buildJsonData = function () {
        var i,
            iMax = data.BCLSprofilesArray.length,
            item,
            headingElem,
            preElem,
            pElem;
        for (i = 0; i < iMax; i++) {
            item = data.BCLSprofilesArray[i];
            item.name += '-copy';
            item.account_id = '{your_account_id}';
            delete item.id;
            delete item.reference_id;
            delete item.version;
            delete item.date_created;
            delete item.date_last_modified;
            headingElem = document.createElement('h3');
            headingElem.appendChild(document.createTextNode(item.name.replace('-copy', ' JSON')));
            headingElem.setAttribute('id', item.name.replace('copy', 'json'));
            pElem = document.createElement('p');
            pElem.appendChild(document.createTextNode('Before using the JSON, you must replace "{your_account_id}" with your own account id.'));
            preElem = document.createElement('pre');
            preElem.appendChild(document.createTextNode(JSON.stringify(item, null, '  ')));
            jsonData.appendChild(headingElem);
            jsonData.appendChild(pElem);
            jsonData.appendChild(preElem);
        }
        bclslog('content built');
    };

    getProfileData = function () {
        var httpRequest = new XMLHttpRequest(),
            proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy.php',
            getResponse = function () {
                bclslog('getting data');
                try {
                    if (httpRequest.readyState === 4) {
                      if (httpRequest.status >= 200 && httpRequest.status < 300) {
                          bclslog(httpRequest.responseText);
                          data.BCLSprofilesArray = JSON.parse(httpRequest.responseText);
                          removeExtraProfiles();
                          buildSummaryTable();
                          buildDetailTables();

                      } else {
                        bclslog('There was a problem with the request. Request returned: ', httpRequest.status);
                        // just use cached data and build the tables
                        data = bclsProfiles_cached;
                        removeExtraProfiles();
                        buildSummaryTable();
                        buildDetailTables();

                      }
                    }
                  }
                  catch(e) {
                    bclslog('Caught Exception: ', e);
                  }
            };
        // set response handler
        httpRequest.onreadystatechange = getResponse;
        // open the request
        httpRequest.open('POST', proxyURL);
        // set headers
        httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        // open and send request
        httpRequest.send(requestData);
    };
    getProfileData();

    // BCLSmain.createInPageNav();
})(window, document, Handlebars, bclsProfiles_cached);
