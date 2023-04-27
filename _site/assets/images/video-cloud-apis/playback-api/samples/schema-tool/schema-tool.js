var BCLS = (function() {
  "use strict";
  var accountID = document.getElementById('accountID'),
    account_id,
    policyKey = document.getElementById('policyKey'),
    policy_key,
    requestURL,
    playerID = document.getElementById('playerID'),
    playerWidth = document.getElementById('playerWidth'),
    playerHeight = document.getElementById('playerHeight'),
    videoID = document.getElementById('videoID'),
    video_id,
    generateButton = document.getElementById('generateButton'),
    publishingCode = document.getElementById('publishingCode'),
    videoData = null,
    defaults = {},
    template,
    result,
    selectCode = document.getElementById('selectCode'),
    schemaTemplates = {
      EntertainmentBusiness: '&lt;!-- Start Schema Code --&gt; \n &lt;div id="content"&gt; \n &lt;div itemscope itemtype="https://schema.org/VideoObject"&gt; \n &lt;meta itemprop="name" content="{{name}}"&gt; \n &lt;meta itemprop="description" content="{{description}}"&gt; \n &lt;meta itemprop="videoID" content="{{id}}"&gt; \n &lt;meta itemprop="duration" content="{{duration}}"&gt; \n &lt;link itemprop="thumbnail" href="{{thumbnailURL}}"&gt; \n &lt;link itemprop="embedURL" href="https://players.brightcove.net/{{accountID}}/{{playerID}}_default/index.html?videoID={{id}}"&gt;&lt;meta itemprop="width" content="{{width}}"&gt;&lt;meta itemprop="height" content="{{height}}"&gt; \n &lt;!-- End Schema Code --&gt; \n &lt;!-- Start Player Code --&gt; \n &lt;iframe src="//players.brightcove.net/{{accountID}}/default_default/index.html?videoID={{id}}" style="width:{{playerWidth}};height:{{playerHeight}}" allowfullscreen webkitallowfullscreen mozallowfullscreen&gt;&lt;\/iframe&gt;  height:{{playerHeight}} \n &lt;!-- End Player Code --&gt; \n &lt;\/div&gt; \n &lt;\/div&gt;'
    };
  function isDefined(x) {
    if (x === '' || x === null || x === undefined) {
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

  function getMediaData(mediaType, requestURL) {
    var httpRequest = new XMLHttpRequest(),
      responseData,
      parsedData,
      // response handler
      getResponse = function() {
        try {
          if (httpRequest.readyState === 4) {
            if (httpRequest.status >= 200 && httpRequest.status < 300) {
              responseData = httpRequest.responseText;
              videoData = JSON.parse(responseData);
              generateSchema();
            } else {
              alert('There was a problem with the request. Request returned ' + httpRequest.status);
            }
          }
        } catch (e) {
          alert('Caught Exception: ' + e);
        }
      };
    // set response handler
    httpRequest.onreadystatechange = getResponse;
    // open the request
    httpRequest.open('GET', requestURL);
    // set headers
    httpRequest.setRequestHeader('Accept', 'application/json;pk=' + policy_key.value);
    // open and send request
    httpRequest.send();
  }

  function generateSchema() {
    var duration;
    if (videoData === null) {
      // clicked on generate before getting videos
      alert('There was a problem getting the video data - recheck your input data, and then try refreshing the page and re-entering it');
      return;
    }
    // insert other data that the schema needs
    videoData.accountID = account_id;
    videoData.playerID = (isDefined(playerID.textContent)) ? playerID.textContent : defaults.playerID;
    videoData.playerWidth = (isDefined(playerWidth.textContent)) ? playerWidth.textContent : defaults.playerWidth;
    videoData.playerHeight = (isDefined(playerHeight.textContent)) ? playerHeight.textContent : defaults.playerHeight;
    // convert the duration to ISO format schema needs
    videoData.duration = secondsToTime(videoData.duration / 1000);
    template = Handlebars.compile(schemaTemplates.EntertainmentBusiness);
    result = template(videoData);
    publishingCode.textContent = result;
  }
  // set listeners for button
  generateButton.addEventListener("click", function() {
    // data setup
    policy_key = (isDefined(policyKey.textContent)) ? policyKey.textContent : defaults.policyKey;
    account_id = (isDefined(accountID.textContent)) ? accountID.textContent : defaults.accountID;
    video_id = (isDefined(videoID.textContent)) ? videoID.textContent : defaults.videoID;
    requestURL = 'https://edge.api.brightcove.com/playback/v1/accounts/';
  });
  publishingCode.addEventListener('click', function() {
    this.select();
  });

  function init() {
    defaults.playerID = '28e29e6d-bed3-4db9-8d70-8d55b8aa3091';
    defaults.videoID = '4454620113001';
    defaults.playerWidth = '640';
    defaults.playerHeight = '360';
    defaults.policyKey = 'BCpkADawqM1nEgO8M2_sjxjk52dp0aEs7KYJFe5Jw1R7UHKv01RnEcvg266Zinpwma8dKHg-0fJ2WRkIOOZLwbiJt0DnixNOSC0E0cWi4pjKXTpZ5Ubc2ZCK9zbcUEwGBBTX8isJEPmWI_4L';
  }
})();
