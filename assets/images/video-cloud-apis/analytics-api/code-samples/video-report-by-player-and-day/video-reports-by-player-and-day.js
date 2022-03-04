var BCLS = (function (window, document, datepickr) {
    var callNumber = 0,
        useMyAccount = document.getElementById("useMyAccount"),
        basicInfo = document.getElementById("basicInfo"),
        accountID = document.getElementById("accountID"),
        clientID = document.getElementById("clientID"),
        clientSecret = document.getElementById("clientSecret"),
        dateSelector = document.getElementById("dateSelector"),
        playerSelector = document.getElementById("playerSelector"),
        videoSelector = document.getElementById("videoSelector"),
        reportTableBody = document.getElementById("reportTableBody"),
        csvDisplay = document.getElementById('csvDisplay'),
        proxyURL = "https://solutions.brightcove.com/bcls/bcls-proxy/doc-samples-proxy-v2.php",
        currentPlayerIndex = 0,
        currentVideoIndex = 0,
        currentDayIndex = 0,
        currentPlayer,
        currentPlayerName,
        currentVideo,
        currentVideoName,
        currentDay,
        playerMax,
        videoMax,
        dayMax,
        daysArray = [],
        dateToMS,
        dateFromMS,
        videoData,
        playerData,
        playersArray = [],
        analyticsData = {},
        playerID,
        videoID,
        dayMS,
        fromDate = document.getElementById("fromDatePicker"),
        toDate = document.getElementById("toDatePicker"),
        getData = document.getElementById("getData"),
        requestDisplay = document.getElementById('requestDisplay'),
        gettingDataDisplay = document.getElementById("gettingDataDisplay"),
        today = new Date(),
        monthAgo = new Date(today - (30 * 24 * 60 * 60 * 1000)),
        playerSelectTemplate = "{{#items}}<option value=\"{{player}}\">{{player_name}}</options>{{/items}}",
        videoSelectTemplate = "{{#items}}<option value=\"{{video}}\">{{video_name}}</options>{{/items}}",
        callType;
        /**
         * Logging function - safe for IE
         * @param  {string} context description of the data
         * @param  {*} message the data to be logged by the console
         * @return {}
         */
        function bclslog(context, message) {
            if (window["console"] && console["log"]) {
              console.log(context, message);
            }
            return;
        }
        // more robust test for strings "not defined"
        function isDefined (v) {
            if (v === "" || v === null || v === undefined || v === NaN) {
              return false;
            }
            return true;
        }
        /**
         * get the 3-letter name for a month
         * @param {number} month 0-based number of the month
         */
         function getMonthName(month) {
            var name;
            switch (parseInt(month)) {
                case 0:
                name = "Jan";
                break;
                case 1:
                name = "Feb";
                break;
                case 2:
                name = "Mar";
                break;
                case 3:
                name = "Apr";
                break;
                case 4:
                name = "May";
                break;
                case 5:
                name = "Jun";
                break;
                case 6:
                name = "Jul";
                break;
                case 7:
                name = "Aug";
                break;
                case 8:
                name = "Sep";
                break;
                case 9:
                name = "Oct";
                break;
                case 10:
                name = "Nov";
                break;
                case 11:
                name = "Dec";
                break;
            }
            return name;
        }
        function displayData() {
            var displayStr, csvDisplayString = '', playerObject, videoObject, template, i, iMax, item;
            currentPlayer = playerSelector.options[playerSelector.selectedIndex].value;
            // bclslog('currentPlayer', currentPlayer);
            currentVideoIndex = videoSelector.selectedIndex;
            playerObject = analyticsData[currentPlayer];
            // bclslog('analyticsData[currentPlayer]', analyticsData[currentPlayer]);
            // bclslog('currentVideoIndex', currentVideoIndex);
            // bclslog('playerObject.items[currentVideoIndex]', playerObject.items[currentVideoIndex]);
            videoObject = playerObject.items[currentVideoIndex];
            // bclslog('videoObject', videoObject);
            displayStr = "<tr style=\"background-color:#64AAB2;color:#FFF;\"><th colspan=\"6\">" + playerObject.player_name + "</th></tr>";
            cvsDisplayString = '"Video Name","","Total Plays","Total Average Seconds Viewed","Total Seconds Viewed" \n';
            displayStr += '<tr><td></td><td>' + videoObject.video_name + '</td><td>Totals</td><td>' + videoObject.totalPlays + '</td><td>' + videoObject.totalAvgSecondsViewed + '</td><td>' + videoObject.totalSecondsViewed + '</td></tr>';
            csvDisplayString += '"' + videoObject.video_name + '","Totals","' + videoObject.totalPlays + '","' + videoObject.totalAvgSecondsViewed + '","' + videoObject.totalSecondsViewed + '" \n' + '"Date","Views","Avg Viewed Seconds","Total Viewed Seconds" \n';
            iMax = videoObject.items.length;
            for (i = 0; i < iMax; i++) {
                item = videoObject.items[i];
                displayStr += '<tr><td colspan=\"2\"></td><td>' + item.date + '</td><td>' + item.video_view + '</td><td>' + item.avgSecondsViewed + '</td><td>' + item.totalSecondsViewed + '</td></tr>';
                csvDisplayString += '"' + item.date + '","' + item.video_view + '","' + item.avgSecondsViewed + '","' + item.totalSecondsViewed + '" \n';
            }
            csvDisplay.value = csvDisplayString;
            reportTableBody.innerHTML = displayStr;
        }
        function getTotals() {
            var player, video, i, iMax, j, jMax, item, date, thisVideo;
            for (player in analyticsData) {
                jMax = analyticsData[player].items.length;
                for (j = 0; j < jMax; j++) {
                    thisVideo = analyticsData[player].items[j];
                    iMax = thisVideo.items.length;
                    thisVideo.totalPlays = 0;
                    thisVideo.totalSecondsViewed = 0;
                    thisVideo.totalCompletedViews = 0;
                    for (i = 0; i < iMax; i++) {
                        item = thisVideo.items[i];
                        if (isDefined(item.date)) {
                            date = new Date(item.date);
                            item.date = dateToISO(date);
                            thisVideo.totalPlays += item.video_view;
                            thisVideo.totalSecondsViewed += item.totalSecondsViewed;
                        } else {
                            bclslog('item with no date', item);
                        }


                    }
                    if (thisVideo.totalPlays > 0) {
                        thisVideo.totalAvgSecondsViewed = thisVideo.totalSecondsViewed / thisVideo.totalPlays;
                        thisVideo.totalCompletedViews = thisVideo.totalCompletedViews / thisVideo.totalPlays;
                    } else {
                        thisVideo.totalAvgSecondsViewed = 0;
                        thisVideo.totalCompletedViews = 0;
                    }
                    gettingDataDisplay.textContent = 'Data processing complete';
                }
            }
        }
        function makeAnalyticsCall(callURL) {
            var httpRequest = new XMLHttpRequest(),
                options = {},
                newItem = {},
                data,
                requestParams,
                newEl,
                txt,
                getResponse = function () {
                    var i,
                        j,
                        k,
                        player,
                        video,
                        itemsmax,
                        analytics,
                        item,
                        newItem = {},
                        thisVideo;
                    try {
                        if (httpRequest.readyState === 4) {
                              if (httpRequest.status >= 200 && httpRequest.status < 300) {
                                data = JSON.parse(httpRequest.responseText);
                                bclslog('data', data);
                            } else {
                              alert('There was a problem with the request. Request returned ' + httpRequest.status);
                            }
                        }
                    } catch (e) {
                        bclslog('e', e);
                    }
                    if (isDefined(data)) {
                        switch (callType) {
                            case "players":
                            frag = new DocumentFragment();
                            callNumber++;
                            // save the data for getting the analytics
                            playerData = data;
                            newEl = document.createElement('option');
                            txt = document.createTextNode('Select a Player');
                            newEl.appendChild(txt);
                            frag.appendChild(newEl);
                            playerMax = playerData.items.length;

                            // add players to the analytics data object
                            for (i = 0; i < playerData.items.length; i++) {

                                playerData.items[i].player = (isDefined(playerData.items[i].player)) ? playerData.items[i].player : "noPlayerId";
                                if (playerData.items[i].player !== "noPlayerId") {
                                    playersArray.push(playerData.items[i].player);
                                }
                                playerData.items[i].player_name = (isDefined(playerData.items[i].player_name)) ? playerData.items[i].player_name : "noPlayerName";
                                if (isDefined(playerData.items[i].player)) {
                                    analyticsData[playerData.items[i].player] = {};
                                    analyticsData[playerData.items[i].player].player_name = playerData.items[i].player_name;
                                    analyticsData[playerData.items[i].player].items = [];
                                }
                                newEl = document.createElement('option');
                                txt = document.createTextNode(playerData.items[i].player_name);
                                newEl.appendChild(txt);
                                newEl.setAttribute('value', playerData.items[i].player);
                                frag.appendChild(newEl);
                            }
                            // populate the player selector
                            playerSelector.appendChild(frag);
                            playerSelector.options[0].setAttribute("selected", "selected");
                            getVideoData();
                            break;
                            case "videos":
                            frag = new DocumentFragment();
                            callNumber++;
                            // save the data for getting the analytics
                            videoData = data;
                            newEl = document.createElement('option');
                            txt = document.createTextNode('Select a Video');
                            newEl.appendChild(txt);
                            frag.appendChild(newEl);
                            // add videos to the analytics data object
                            videoMax = videoData.items.length;
                            for (player in analyticsData) {
                                for (j = 0; j < videoMax; j++) {
                                    video = videoData.items[j];
                                    video.video_name = (isDefined(video.video_name)) ? video.video_name : "unknown";
                                    video.video = (isDefined(video.video)) ? video.video : "unknown";
                                    analyticsData[player].items[j] = {};
                                    analyticsData[player].items[j].id = video.video;
                                    analyticsData[player].items[j].video_name = video.video_name;
                                    analyticsData[player].items[j].items = [];
                                    newEl = document.createElement('option');
                                    txt = document.createTextNode(video.video_name);
                                    newEl.appendChild(txt);
                                    newEl.setAttribute('value', video.video);
                                    frag.appendChild(newEl);
                                }
                            }
                            // populate the video selector
                            videoSelector.appendChild(frag);
                            videoSelector.options[0].setAttribute("selected", "selected");
                            getAnalyticsData();
                            break;
                            case "analytics":
                            callNumber++;
                            itemsmax = data.items.length;
                            // bclslog('data',data);
                            videoMax = analyticsData[currentPlayer].items.length;
                            for (k = 0; k < videoMax; k++) {
                                thisVideo = analyticsData[currentPlayer].items[k];
                                newItem = {};
                                newItem.video_view = 0;
                                newItem.avgSecondsViewed = 0;
                                newItem.totalSecondsViewed = 0;
                                newItem.date = currentDay.from;
                                for (i = 0; i < itemsmax; i++) {
                                    if (data.items[i].video === thisVideo.id) {
                                        item = data.items[i];
                                        newItem.video_view = item.video_view;
                                        newItem.avgSecondsViewed = item.video_seconds_viewed / item.video_view;
                                        newItem.totalSecondsViewed = item.video_seconds_viewed;
                                    }
                                }
                                analyticsData[currentPlayer].items[k].items.push(newItem);
                            }
                            if (currentDayIndex < dayMax - 1) {
                                currentDayIndex++;
                                getAnalyticsData();
                            } else if (currentPlayerIndex < playerMax - 1) {
                                currentDayIndex = 0;
                                currentVideoIndex = 0;
                                currentPlayerIndex++;
                                getAnalyticsData();
                            } else {
                                gettingDataDisplay.textContent = "Data retrieved - " + callNumber + " API calls made - processing data...";
                                // bclslog("analyticsData", analyticsData);
                                getTotals();
                            }
                            break;
                        }
                    }
                };
            if (isDefined(clientID.value)) {
                options.client_id = clientID.value;
            }
            if (isDefined(clientSecret.value)) {
                options.client_secret =  clientSecret.value;
            }
            options.url = callURL;
            options.requestMethod = "GET";
            options.account_id = accountID.value;
            options.requestData = null;
            // set up request data
            // set response handler
            httpRequest.onreadystatechange = getResponse;
            // open the request
            httpRequest.open('POST', proxyURL);
            // open and send request
            httpRequest.send(JSON.stringify(options));
        }
        // get the analytics data for the videos
        function getAnalyticsData() {
            var callURL,
            account_id = (isDefined(accountID.value)) ? accountID.value : "1752604059001";
            gettingDataDisplay.innerHTML = "Getting analytics data - making request number " + callNumber;
            callType = "analytics";
            currentPlayer = playerData.items[currentPlayerIndex].player;
            // currentVideo = videoData.items[currentVideoIndex].video;
            currentDay = daysArray[currentDayIndex];
            callURL = "https://analytics.api.brightcove.com/v1/data?accounts=" + account_id + "&dimensions=video&from=" + currentDay.from + "&to=" + currentDay.to + "&where=player==" + currentPlayer + "&fields=video_view,video_seconds_viewed,video";
            requestDisplay.textContent = callURL;
            makeAnalyticsCall(callURL);

        }
        // get the video analytics data
        function getVideoData() {
            var callURL = "";
            account_id = (isDefined(accountID.value)) ? accountID.value : "1752604059001";
            gettingDataDisplay.innerHTML = "Getting video data...";
            callType = "videos";
            callURL = "https://analytics.api.brightcove.com/v1/data?accounts=" + account_id + "&dimensions=video&limit=10&fields=video,video_name&sort=-video_view&from=" + dateFromMS + "&to=" + dateToMS;
            requestDisplay.textContent = callURL;
            makeAnalyticsCall(callURL);
        }
        // get all players for the selected time period
        function getPlayersData() {
            var callURL = "";
            account_id = (isDefined(accountID.value)) ? accountID.value : "1752604059001";
            gettingDataDisplay.innerHTML = "Getting player data...";
            callType = "players";
            callURL = "https://analytics.api.brightcove.com/v1/data?accounts=" + account_id + "&dimensions=player&limit=5&fields=player,player_name&sort=-video_view&from=" + dateFromMS + "&to=" + dateToMS;
            requestDisplay.textContent = callURL;
            makeAnalyticsCall(callURL);
        }
    // add date pickers to the date input fields
    datepickr(fromDate, {
        'dateFormat': 'Y-m-d'
    });
    datepickr(toDate, {
        'dateFormat': 'Y-m-d'
    });
    /**
     * return ISO 8601 date string (YYYY-MM-DD) for JS date
     * @param {Date} date a Date object
     * @return {String} the date in ISO format (date part only)
     */
    function dateToISO(date) {
        var y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDate(),
            isoDate;
        y = y.toString();
        m = m + 1;
        if (m < 10) {
            m = "0" + m.toString();
        } else {
            m = m.toString();
        }
        if (d < 10) {
            d = "0" + d.toString();
        } else {
            d = d.toString();
        }
        isoDate = y + "-" + m + "-" + d;
        return isoDate;
    }
    // default date range values
    toDate.value = dateToISO(today);
    fromDate.value = dateToISO(monthAgo);

    getData.addEventListener("click", function () {
        var totalDays, i;
        dateFromMS = new Date(fromDate.value).valueOf();
        dateToMS = new Date(toDate.value).valueOf();
        /**
        * what follows is just math
        * to create to and from params for API calls
        * 86400000 = 1 day in milliseconds
        */
        totalDays = Math.round((dateToMS - dateFromMS)/86400000);
        for (i = 0; i < (totalDays - 1); i++) {
            daysArray[i] = {from : dateFromMS + (i * 86400000), to : dateFromMS + ((i + 1) * 86400000) - 1};
        }
        dayMax = daysArray.length;
        getPlayersData();
    });
    videoSelector.addEventListener("change", displayData);
    playerSelector.addEventListener("change", function() {
        videoSelector.setAttribute('style', '');
        displayData();
    });
    useMyAccount.addEventListener("click", function () {
        if (basicInfo.getAttribute('style') === "display:none;") {
            basicInfo.setAttribute('style', 'display:block;');
            useMyAccount.innerHTML = "Use Sample Account";
        } else {
            basicInfo.setAttribute('style', 'display:none;');
            useMyAccount.innerHTML = "Use My Account Instead";
        }
    });
    csvDisplay.addEventListener('click', function() {
        this.select();
    });
})(window, document, datepickr);
