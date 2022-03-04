var account_id = "",
  account_password = "",
  account_username = "",
  player_name = "",
  media_url = "",
  media_type = "",
  callPurpose = "";

var ajaxSuccess = function(data){
  switch (callPurpose) {
    case "makeNewPlayer":
      var tempString = JSON.stringify(data,null,2);
      tempString = tempString.replace("<ifra","&lt;ifra");
      document.getElementById("jsonCreation").innerHTML = tempString;
      publishPlayer(data.id);
      break;
    case "publishPlayer":
      var tempString = JSON.stringify(data,null,2);
      tempString = tempString.replace("<ifra","&lt;ifra");
      document.getElementById("jsonPublish").innerHTML = tempString;
      displayPlayerInfo(tempString);
      break;
  }
},

ajaxError = function(data){
  console.log("error data: ");
  console.log(data);
},

makeAjaxCall = function(callURL, callType, callData){
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
checkInputs = function(){
  var proceed = true;
  $( ".checkForValue" ).each(function(){
    if(!$.trim(this.value).length) {
      alert("Be sure all form fields have values");
      proceed = false;
      return false;
    }
  });
  if (proceed) {
    createPlayer();
  }
},

createPlayer = function(){
  account_id = document.getElementById("account_id").value;
  account_password = document.getElementById("account_password").value;
  account_username = document.getElementById("account_username").value;
  player_name = document.getElementById("player_name").value;
  media_url = document.getElementById("media_url").value;
  media_type = document.getElementById("media_type").value;
  callPurpose = "makeNewPlayer";
  playerData =
  {
    "name": player_name,
    "configuration": {
      "media":{
        "sources": [{
            "src": media_url,
            "type": media_type
        }]
      }
    }
  };
  call_url = "https://players.api.brightcove.com/v1/accounts/" + account_id + "/players";
  makeAjaxCall(call_url, "POST", playerData);
},

displayPlayerInfo = function(playerData){
  var jsonObj = JSON.parse(playerData);
  var dynamicHTML = "<strong>Player ID:</strong> " + jsonObj.id + "<br />";
  dynamicHTML += "<strong>Player URL:</strong> " + jsonObj.url;
  document.getElementById("htmlOutput").innerHTML = dynamicHTML;
},

publishPlayer = function(paramPlayerID){
  callPurpose = "publishPlayer";
  call_url = "https://players.api.brightcove.com/v1/accounts/" + account_id + "/player-management/" + paramPlayerID + "/publish";
  makeAjaxCall(call_url,"POST", null);
};
