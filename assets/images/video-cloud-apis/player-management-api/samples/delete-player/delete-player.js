var account_id = "",
  account_password = "",
  account_username = "",
  callPurpose = "",
  toDelete = [];

var ajaxSuccess = function (data,textStatus,jqXHR) {
  switch (callPurpose) {
    case "getPlayers":
      createCheckboxes(data);
      watchCheckboxes();
      break;
    case "deletePlayer":
      document.getElementById("choosePlayers").innerHTML = "Your players will be displayed here. <br />";
      document.getElementById("htmlOutput").innerHTML += jqXHR.status +"<br />";
      break;
  }
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
  call_url = "https://players.api.brightcove.com/v1/accounts/" + account_id + "/players";
  callPurpose = "getPlayers";
  makeAjaxCall(call_url, "GET", null);
},
createCheckboxes = function (playerData) {
  var numPlayers = playerData.length,
    dynamicHTML = "";
  for (var i = 0; i < numPlayers; i++) {
    dynamicHTML += "<label class='formylabel'><input class='formycheckbox' id='" + playerData[i].id + "' type='checkbox' /> " + playerData[i].name + "</label>";
  }
  document.getElementById("choosePlayers").innerHTML = dynamicHTML;
  document.getElementById("htmlOutput").innerHTML = "";
},
deletePlayers = function(){
  callPurpose = "deletePlayer";
  var numToDelete = toDelete.length;

  for (var i = 0; i < numToDelete; i++) {
    call_url = "https://players.api.brightcove.com/v1/accounts/" + account_id + "/player-management/" + toDelete[i];
    makeAjaxCall(call_url, "DELETE", null);
  }
},
watchCheckboxes = function(){
  $("input:checkbox").change(function() {
    toDelete = [];

      $("input:checkbox").each(function() {
          if ($(this).is(":checked")) {
              toDelete.push($(this).attr("id"));
          }
      });
  });
};
