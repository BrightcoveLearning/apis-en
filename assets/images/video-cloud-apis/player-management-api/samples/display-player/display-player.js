var account_id = "",
  account_password = "",
  account_username = "";

var ajaxSuccess = function (data) {
  document.getElementById("jsonResponse").innerHTML = JSON.stringify(data,null,2);
  displayData(data);
},
ajaxError = function (data) {
  console.log("error data: ");
  console.log(data);
},
makeAjaxCall = function (callURL, callType, callData) {
  if (callData) {
    $.ajax({
      type: callType,
      headers: {
        "Authorization": "Basic " + btoa(account_username + ":" + account_password),
        "Content-Type": "application/json"
      },
      url: callURL,
      data: JSON.stringify(callData),
      success: ajaxSuccess,
      error: ajaxError
    });
  } else {
    $.ajax({
      type: callType,
      headers: {
        "Authorization": "Basic " + btoa(account_username + ":" + account_password),
        "Content-Type": "application/json"
      },
      url: callURL,
      success: ajaxSuccess,
      error: ajaxError
    });
  }
},
getPlayerInfo = function () {
  account_id = document.getElementById("account_id").value;
  account_password = document.getElementById("account_password").value;
  account_username = document.getElementById("account_username").value;
  console.log(account_id + account_password + account_username);
  call_url = "https://players.api.brightcove.com/v1/accounts/" + account_id + "/players";
  makeAjaxCall(call_url, "GET", null);
},
displayData = function (playerData) {
  var numPlayers = playerData.length,
    dynamicHTML = "<ol>";
  for (var i = 0; i < numPlayers; i++) {
    dynamicHTML += "<li>Player Name: " + playerData[i].name + "</li><ul><li>ID: " + playerData[i].id + "</li><li>Creation Date: " + playerData[i].created_at + "</li></ul>";
  }
  dynamicHTML += "</ol>";
  document.getElementById("htmlOutput").innerHTML = dynamicHTML;
};
