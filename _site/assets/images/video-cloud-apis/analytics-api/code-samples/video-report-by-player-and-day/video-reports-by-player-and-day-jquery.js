var BCLS = (function (window, document, datepickr) {
    var callNumber = 0,
        useMyAccount = document.getElementById("useMyAccount"),
        basicInfo = document.getElementById("basicInfo"),
        accountID = document.getElementById("accountID"),
        client_id = document.getElementById("client_id"),
        client_secret = document.getElementById("client_secret"),
        dateSelector = document.getElementById("dateSelector"),
        playerSelector = document.getElementById("playerSelector"),
        videoSelector = document.getElementById("videoSelector"),
        reportTableBody = document.getElementById("reportTableBody"),
        csvDisplay = document.getElementById('csvDisplay'),
        proxyURL = "https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy.php",
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
        gettingDataDisplay = document.getElementById("gettingDataDisplay"),
        today = new Date(),
        monthAgo = new Date(today - (30 * 24 * 60 * 60 * 1000)),
        dataDisplayBodyTemplate = "<td>{{video_name}}</td><td>Totals</td><td>{{totalPlays}}</td><td>{{totalAvgSecondsViewed}}</td><td>{{totalSecondsViewed}}</td></tr>{{#items}}<tr><td></td><td></td><td>{{date}}</td><td>{{video_view}}</td><td>{{avgSecondsViewed}}</td><td>{{totalSecondsViewed}}</td></tr>{{/items}}",
        dataCSVTemplate = '"{{video_name}}","Totals","{{totalPlays}}","{{totalAvgSecondsViewed}}","{{totalSecondsViewed}}" \n {{#items}}"{{date}}","{{video_view}}","{{avgSecondsViewed}}","{{totalSecondsViewed}}" \n {{/items}}',
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
            };
            return;
        }
        // more robust test for strings "not defined"
        function isDefined (v) {
            if (v === "" || v === null || v === undefined || v === NaN) {
              return false;
            }
            return true;
        }
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
            var displayStr, csvDisplayString = '', playerObject, videoObject, template;
            currentPlayer = playerSelector.options[playerSelector.selectedIndex].value;
            currentVideoIndex = videoSelector.selectedIndex;
            playerObject = analyticsData[currentPlayer];
            bclslog('currentVideoIndex', currentVideoIndex);
            bclslog('playerObject.items[currentVideoIndex]', playerObject.items[currentVideoIndex]);
            videoObject = playerObject.items[currentVideoIndex];
            bclslog('videoObject', videoObject);
            displayStr = "<tr style=\"background-color:#64AAB2;color:#FFF;\"><th>" + playerObject.player_name + "</th>";
            cvsDisplayString = '"Video Name","","Total Plays","Total Average Seconds Viewed","Total Seconds Viewed" \n';
            template = Handlebars.compile(dataDisplayBodyTemplate);
            csvTemplate = Handlebars.compile(dataCSVTemplate);
            displayStr += template(videoObject);
            csvDisplayString += csvTemplate(videoObject);
            csvDisplay.value = csvDisplayString;
            reportTableBody.innerHTML = displayStr;
        }
        function getTotals() {
            var player, video, i, iMax, j, jMax, item, date, thisVideo;
            for (player in analyticsData) {
                jMax = analyticsData[player].items.length;
                bclslog('jMax', jMax);
                for (j = 0; j < jMax; j++) {
                    thisVideo = analyticsData[player].items[j];
                    iMax = thisVideo.items.length;
                    thisVideo.totalPlays = 0;
                    thisVideo.totalSecondsViewed = 0;
                    thisVideo.totalCompletedViews = 0;
                    for (i = 0; i < iMax; i++) {
                        item = thisVideo.items[i];
                        bclslog('item.date', item.date);
                        if (isDefined(item.date)) {
                            date = new Date(item.date);
                            bclslog('month', date.getMonth());
                            item.date = dateToISO(date);
                            thisVideo.totalPlays += item.video_view;
                            thisVideo.totalSecondsViewed += item.totalSecondsViewed;
                        } else {
                            bclslog('item with no date', item);
                        }


                    }
                    thisVideo.totalAvgSecondsViewed = thisVideo.totalSecondsViewed / thisVideo.totalPlays;
                    if (thisVideo.totalPlays > 0) {
                        thisVideo.totalCompletedViews = thisVideo.totalCompletedViews / thisVideo.totalPlays;
                    }
                    gettingDataDisplay.textContent = 'Data processing complete';
                }
            }
        }
        function makeAnalyticsCall(callURL) {
            var options = {}, newItem = {};
            options.client_id = (isDefined(client_id.value)) ? client_id.value : "0cabdedf-1588-4b1b-b34b-483bc5abef6f";
            options.client_secret = (isDefined(client_secret.value)) ? client_secret.value : "OceNhwbegXYiSIRnDw57j55GCD6pL5g86SGu5UoNWbQmj63Jns72CNaJFpYtAxlw7p5as-g9G8nJnDnFgigPgg";
            options.url = callURL;
            options.requestMethod = "GET";
            options.requestData = null;

            $.ajax({
            url: proxyURL,
            type: "POST",
            data: options,
            success : function (data) {
                var template, results, i, j, k, player, video, itemsmax, analytics, item, newItem = {}, thisVideo;
                try {
                    var data = JSON.parse(data);
                } catch (e) {
                    alert('invalid json');
                }
                switch (callType) {
                    case "players":
                        callNumber++;
                        // save the data for getting the analytics
                        playerData = data;
                        // bclslog("player data", data);
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
                        }
                        // populate the player selector
                        template = Handlebars.compile(playerSelectTemplate);
                        playerSelector.innerHTML = template(data);
                        playerSelector.options[0].setAttribute("selected", "selected");
                        getVideoData();
                        break;
                    case "videos":
                        callNumber++;
                        // save the data for getting the analytics
                        videoData = data;
                        videoMax = videoData.items.length;
                        // add videos to the analytics data object
                        for (player in analyticsData) {
                            for (j = 0; j < videoMax; j++) {
                                video = videoData.items[j];
                                analyticsData[player].items[j] = {};
                                analyticsData[player].items[j].id = video.video;
                                analyticsData[player].items[j].video_name = (isDefined(video.video_name)) ? video.video_name : "name undefined";
                                analyticsData[player].items[j].items = [];
                            }
                        }
                        // populate the video selector
                        template = Handlebars.compile(videoSelectTemplate);
                        videoSelector.innerHTML = template(data);
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
                            gettingDataDisplay.innerHTML = "Data retrieved - " + callNumber + " API calls made - processing data...";
                            bclslog("analyticsData", analyticsData);
                            getTotals();
                        }
                }
            },
            error : function (XMLHttpRequest, textStatus, errorThrown)
                {
                    gettingDataDisplay.innerHTML = "Sorry, your request was not successful. Here's what the server sent back: " + errorThrown;
                }
            });
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
            makeAnalyticsCall(callURL);

        }
        // get the video analytics data
        function getVideoData() {
            var callURL = "";
            account_id = (isDefined(accountID.value)) ? accountID.value : "1752604059001",
            gettingDataDisplay.innerHTML = "Getting video data...";
            callType = "videos";
            callURL = "https://analytics.api.brightcove.com/v1/data?accounts=" + account_id + "&dimensions=video&limit=10&fields=video,video_name&sort=-video_view&from=" + dateFromMS + "&to=" + dateToMS;
            makeAnalyticsCall(callURL);
        }
        // get all players for the selected time period
        function getPlayersData() {
            var callURL = "";
            account_id = (isDefined(accountID.value)) ? accountID.value : "1752604059001",
            gettingDataDisplay.innerHTML = "Getting player data...";
            callType = "players";
            callURL = "https://analytics.api.brightcove.com/v1/data?accounts=" + account_id + "&dimensions=player&limit=5&fields=player,player_name&sort=-video_view&from=" + dateFromMS + "&to=" + dateToMS;
            makeAnalyticsCall(callURL);
        }
    // add date pickers to the date input fields
    datepickr(fromDate, {
        'dateFormat': 'Y-m-d'
    });
    datepickr(toDate, {
        'dateFormat': 'Y-m-d'
    });
    // return ISO 8601 date string (YYYY-MM-DD) for JS date
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
    playerSelector.addEventListener("change", displayData);
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
