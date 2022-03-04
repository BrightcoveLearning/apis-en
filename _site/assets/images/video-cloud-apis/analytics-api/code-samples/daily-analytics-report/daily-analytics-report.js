var BCLS = (function(window, document) {
  var accountId,
    clientId,
    clientSecret,
    //dates
    today = new Date().valueOf(),
    oneDay = 1000 * 60 * 60 * 24,
    startDateISO,
    startDate,
    startDateMS,
    currentDate,
    currentDateMS,
    currentDateISO,
    // api stuff
    proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/doc-samples-proxy-v2.php',
    baseURL = 'https://analytics.api.brightcove.com/v1/data',
    totalVideos = 0,
    totalCalls = 0,
    totalDays = 0,
    videoNumber = 0,
    dayNumber = 0,
    videosCompleted = 0,
    daysTotal,
    daysCompleted,
    videosArray = [],
    dailyAnalyticsItems,
    csvStr,
    summaryCsvStr,
    fields = 'video,video.name,video.reference_id,video_duration,video_impression,video_view,play_rate,video_percent_viewed,video_seconds_viewed,engagement_score,video_engagement_1,video_engagement_25,video_engagement_50,video_engagement_75,video_engagement_100',
    // elements
    account_id = document.getElementById('account_id'),
    client_id = document.getElementById('client_id'),
    client_secret = document.getElementById('client_secret'),
    makeReport = document.getElementById('makeReport'),
    warning = document.getElementById('warning'),
    content,
    logger = document.getElementById('logger'),
    logText = document.getElementById('logText'),
    csvData = document.getElementById('csvData'),
    apiRequest = document.getElementById('apiRequest'),
    allButtons = document.getElementsByTagName('button'),
    pLogGettingVideoAnalytics = document.createElement('p'),
    pLogGettingDailyAnalytics = document.createElement('p'),
    pLogFinish = document.createElement('p'),
    spanIntro1 = document.createElement('span'),
    spanOf1 = document.createElement('span'),
    spanIntro2 = document.createElement('span'),
    spanOf2 = document.createElement('span'),
    spanVideosTotal = document.createElement('span'),
    spanVideosCount = document.createElement('span'),
    spanDaysTotal = document.createElement('span'),
    spanDaysCount = document.createElement('span'),
    spanTotalVideos = document.createElement('span'),
    spanCompletedVideos = document.createElement('span'),
    spanLogMessage = document.createElement('span'),
    spanStyle = 'color:#ffffff;background-color:#337d87;border-radius:5px;padding:5px 10px;';

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
   * disables all buttons so user can't submit new request until current one finishes
   */
  function disableButtons() {
    var i,
      iMax = allButtons.length;
    for (i = 0; i < iMax; i++) {
      allButtons[i].setAttribute('disabled', 'disabled');
      allButtons[i].setAttribute('style', 'opacity:.4');
      allButtons[i].textContent = 'Please wait, processing...';
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
      allButtons[i].setAttribute('style', 'opacity:1');
    }
  }

  /**
   * converts an ISO date string into a date object
   * @param {String} isoString date string to convert
   * @return {Date} the equivalent date object
   */
  function getDateFromIsoString(isoString) {
    var arr,
      i,
      iMax,
      d;
    if (isDefined(isoString)) {
      arr = isoString.split('-');
      iMax = arr.length;
      for (i = 0; i < iMax; i++) {
        arr[i] = parseInt(arr[i]);
        if (i === 1) {
          if (arr[i] === 0) {
            arr[i] = 12;
          } else {
            arr[i]--;
          }
        }

      }
    }
    d = new Date(arr[0], arr[1], arr[2]);
    return d;
  }

  /**
   * calculates number of days since the given date
   * @param {Date} startDate the given date
   * @return {Number} number of days since the given day
   */
  function getTotalDays(startDate) {
    if (isDefined(startDate)) {
      return Math.floor((today - startDate.valueOf()) / oneDay);
    } else {
      return null;
    }
  }

  /**
   * add one day to a date and return the iso date string for it
   * @param {Date} the date object
   * @return {String} an ISO date string for one day after the date
   */
  function addOneDay(date) {
    var dateMS,
      newDate;
    if (isDefined(date)) {
      dateMS = date.valueOf();
      newDate = new Date(dateMS + oneDay);
      return newDate.toISOString().substring(0, 10);
    } else {
      return null;
    }
  }

  /**
   * starts a new CSV string with the header row
   */
  function startCSVStrings() {
    csvStr = '"Date","Video id","Name","Reference id","Duration","Video Impressions","Video Views","Play Rate","Average Percent Viewed","Average Seconds Viewed","Engagement Score","Views at 1%","Views at 25%","Views at 50%","Views at 75%","Views at 100%"\n';
  }

  /**
   * generates the CSV data for video items
   */
  function writeReport() {
    var i,
      iMax,
      item;
    if (videosArray.length > 0) {
      // console.log('videoNumber', videoNumber);
      // console.log('video', videosArray[videoNumber]);
      iMax = videosArray[videoNumber].items.length;
      for (i = 0; i < iMax; i += 1) {
        item = videosArray[videoNumber].items[i];
        // console.log('item', item);
        // generate the video detail row
        csvStr += '"' + item.date + '","' + item.video + '","' + item['video.name'] + '","' + item['video.reference_id'] + '","' + item.video_duration + '","' + item.video_impression + '","' + item.video_view + '","' + item.play_rate + '","' + Math.fround(parseInt(item.video_percent_viewed) / parseInt(item.video_view)) + '","' + Math.fround(parseInt(item.video_seconds_viewed) / parseInt(item.video_view)) + '","' + item.engagement_score + '","' + item.video_engagement_1 + '","' + item.video_engagement_25 + '","' + item.video_engagement_50 + '","' + item.video_engagement_75 + '","' + item.video_engagement_100 + '"\n';
      }
      csvData.textContent += csvStr;
      pLogFinish.textContent = 'Finished! Get the CSV data below.';
      spanCompletedVideos.textContent = videosCompleted;
      videosCompleted++;
      spanCompletedVideos.textContent = videosCompleted;
      if (videosCompleted < totalVideos) {
        makeReport.textContent = 'Process the next video';
        warning.textContent = 'Before processing the next video, be sure to copy and save the CSV data!';
        videoNumber++;
        enableButtons();
      } else {
        makeReport.textContent = 'No more videos to process';
      }

    }
  }

  /**
   * sets up the data for the API request
   * @param {String} id the id of the button that was clicked
   */
  function setRequestData(id) {
    var endPoint = '',
      options = {};
    // disable buttons to prevent a new request before current one finishes
    disableButtons();
    options.account_id = accountId;
    options.proxyURL = proxyURL;
    options.requestType = 'GET';
    if (isDefined(clientId) && isDefined(clientSecret)) {
      options.client_id = clientId;
      options.client_secret = clientSecret;
    }
    switch (id) {
      case 'getStartDate':
        endPoint = '/status?accounts=' + accountId + '&dimensions=video&fields=' + fields;
        options.url = baseURL + endPoint;
        options.requestType = 'GET';
        apiRequest.textContent = options.url;
        makeRequest(options, function(response) {
          parsedData = JSON.parse(response);
          // console.log('dateData', parsedData);
          // set total videos
          startDateISO = parsedData.reconciled_from;
          startDate = getDateFromIsoString(startDateISO);
          totalDays = getTotalDays(startDate);
          currentDate = startDate;
          currentDateISO = currentDate.toISOString().substring(0, 10);
          totalDays = getTotalDays(startDate);
          spanDaysTotal.textContent = totalDays;
          spanTotalVideos.textContent = totalVideos;
          spanCompletedVideos.textContent = videosCompleted;
          setRequestData('getVideoIds');
        });
        break;
      case 'getVideoIds':
        endPoint = '?accounts=' + accountId + '&dimensions=video&limit=all&fields=video&sort=-video_view&from=alltime';
        options.url = baseURL + endPoint;
        options.requestType = 'GET';
        apiRequest.textContent = options.url;
        // console.log('options', options);
        makeRequest(options, function(response) {
          parsedData = JSON.parse(response);
          videosArray = parsedData.items;
          // console.log('videosData', videosArray);
          totalVideos = videosArray.length;
          for (i = 0; i < totalVideos; i++) {
            videosArray[i].items = [];
          }
          if (videoNumber === 0) {

          }
          spanCompletedVideos.textContent = videosCompleted;
          spanVideosCount.textContent = videoNumber + 1;
          spanVideosTotal.textContent = totalVideos;
          spanTotalVideos.textContent = totalVideos;
          logText.appendChild(spanTotalVideos);
          logText.appendChild(spanLogMessage);
          logText.appendChild(spanCompletedVideos);
          logger.appendChild(pLogGettingVideoAnalytics);
          logger.appendChild(pLogGettingDailyAnalytics);
          setRequestData('getVideoDays');
        });
        break;
      case 'getVideoDays':
        var i,
          iMax = videosArray.length;
        // check for null video id
        if (videosArray[videoNumber].video === null) {
          // no way to get data, just skip this item
          videoNumber++;
          setRequestData('getVideoDays');
        }
        endPoint = '?accounts=' + accountId + '&dimensions=video&where=video==' + videosArray[videoNumber].video + '&from=' + currentDateISO + '&to=' + currentDateISO + '&fields=' + fields;
        options.url = baseURL + endPoint;
        options.requestType = 'GET';
        apiRequest.textContent = options.url;
        spanDaysCount.textContent = dayNumber + 1;
        makeRequest(options, function(response) {
          parsedData = JSON.parse(response);
          if (parsedData.item_count > 0) {
            parsedData.items[0].date = currentDateISO;
            // console.log('data item', parsedData.items[0]);
            videosArray[videoNumber].items.push(parsedData.items[0]);
          }
          dayNumber++;
          if (dayNumber < totalDays) {
            currentDateISO = addOneDay(currentDate);
            currentDate = getDateFromIsoString(currentDateISO);
            setRequestData('getVideoDays');
          } else {
            writeReport();
          }
        });
        break;
    }
  }

  /**
   * send API request to the proxy
   * @param  {Object} options for the request
   * @param  {String} options.url the full API request URL
   * @param  {String="GET","POST","PATCH","PUT","DELETE"} requestData [options.requestType="GET"] HTTP type for the request
   * @param  {String} options.proxyURL proxyURL to send the request to
   * @param  {String} options.client_id client id for the account (default is in the proxy)
   * @param  {String} options.client_secret client secret for the account (default is in the proxy)
   * @param  {JSON} [options.requestBody] Data to be sent in the request body in the form of a JSON string
   * @param  {Function} [callback] callback function that will process the response
   */
  function makeRequest(options, callback) {
    var httpRequest = new XMLHttpRequest(),
      response,
      proxyURL = options.proxyURL,
      // response handler
      getResponse = function() {
        try {
          if (httpRequest.readyState === 4) {
            if (httpRequest.status >= 200 && httpRequest.status < 300) {
              response = httpRequest.responseText;
              // some API requests return '{null}' for empty responses - breaks JSON.parse
              if (response === '{null}') {
                response = null;
              }
              // return the response
              callback(response);
            } else {
              alert('There was a problem with the request. Request returned ' + httpRequest.status);
            }
          }
        } catch (e) {
          alert('Caught Exception: ' + e);
        }
      };
    /**
     * set up request data
     * the proxy used here takes the following request body:
     * JSON.stringify(options)
     */
    // set response handler
    httpRequest.onreadystatechange = getResponse;
    // open the request
    httpRequest.open('POST', proxyURL);
    // set headers if there is a set header line, remove it
    // open and send request
    httpRequest.send(JSON.stringify(options));
  }

  function init() {
    // event listeners
    csvData.addEventListener('click', function() {
      this.select();
    });
    // set up the log elements
    content = document.createTextNode('Getting daily analytics for video ');
    spanIntro1.appendChild(content);
    content = document.createTextNode(' of ');
    spanOf1.appendChild(content);
    content = document.createTextNode('Getting analytics for day ');
    spanIntro2.appendChild(content);
    content = document.createTextNode(' of ');
    spanOf2.appendChild(content);
    spanLogMessage.textContent = ' videos have video views; videos processed: ';
    spanVideosCount.setAttribute('id', 'spanVideosCount');
    spanVideosCount.setAttribute('style', spanStyle);
    spanVideosTotal.setAttribute('id', 'spanVideosTotal');
    spanVideosTotal.setAttribute('style', spanStyle);
    spanDaysCount.setAttribute('id', 'spanDaysCount');
    spanDaysCount.setAttribute('style', spanStyle);
    spanDaysTotal.setAttribute('id', 'spanDaysTotal');
    spanDaysTotal.setAttribute('style', spanStyle);
    spanCompletedVideos.setAttribute('style', spanStyle);
    spanTotalVideos.setAttribute('style', spanStyle);
    pLogGettingVideoAnalytics.appendChild(spanIntro1);
    pLogGettingVideoAnalytics.appendChild(spanVideosCount);
    pLogGettingVideoAnalytics.appendChild(spanOf1);
    pLogGettingVideoAnalytics.appendChild(spanVideosTotal);
    pLogGettingDailyAnalytics.appendChild(spanIntro2);
    pLogGettingDailyAnalytics.appendChild(spanDaysCount);
    pLogGettingDailyAnalytics.appendChild(spanOf2);
    pLogGettingDailyAnalytics.appendChild(spanDaysTotal);
    // create csv headings
    startCSVStrings();

    // button event handlers
    makeReport.addEventListener('click', function() {
      // get the inputs
      clientId = client_id.value;
      clientSecret = client_secret.value;
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
      disableButtons();
      // if first set, we need to get the count
      if (videosArray.length === 0) {
        setRequestData('getStartDate');
      } else {
        if (window.confirm('Before proceeding, make sure you have copied and saved the current CSV data - it will be lost when the next video is processed!')) {
          // resets
          dayNumber = 0;
          csvData.textContent = '';
          spanDaysTotal.textContent = totalDays;
          spanDaysCount.textContent = dayNumber + 1;
          spanVideosTotal.textContent = totalVideos;
          spanVideosCount.textContent = videoNumber + 1;
          startCSVStrings();
          setRequestData('getVideoDays');
        }

      }

    });

  }

  init();
})(window, document);
