var BCLS = (function () { 
    "use strict";
	  var proxyURL = "https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy.php",
        serviceURL = "https://players.api.brightcove.com/v1",
        $accountID = $("#accountID"),
            account_id = "",
        $client_id = $("#client_id"),
            // for testing purposes
            client_id = "",
        $client_secret = $("#client_secret"),
            // for testing purposes
            client_secret = "",
        $playerID = $("#playerID"),
            player_id = "",
        $generateButton = $("#generateButton"),
        $requestInputs = $(".papi-request"),
        $responseFrame = $("#responseFrame"),
        $generatedResults = $("#generatedResults"),
        // functions
        getPlayerData,
        isDefined,
        bclslog;         

    /**
     * Logging function - safe for IE
     * @param  {string} context description of the data
     * @param  {*} message the data to be logged by the console
     * @return {}
     */
    bclslog = function (context, message) {
        if (window["console"] && console["log"]) {
            console.log(context, message);
        };
        return;
    };

    // more robust test for strings "not defined"
    isDefined =  function (v) {
        if (v !== "" && v !== null && v !== "undefined" && v !== undefined) {
            return true;
        } else { return false; }
    };
    
    // submit request to get player configuration data for account
    getPlayerData = function () {
        if ($accountID.val().length == 0 ||
            $client_id.val().length == 0 ||
            $client_secret.val().length == 0 ||
            $playerID.val().length == 0) {
                alert("Please enter your data before submitting the request");
                return;
        }
        var options = {};
        options.client_id = (isDefined($client_id.val())) ? $client_id.val() : client_id;
        options.client_secret = (isDefined($client_secret.val())) ? $client_secret.val() : client_secret;
        
        var values = {};
        values.account_id = (isDefined($accountID.val())) ? $accountID.val() : account_id;
        values.player_id = (isDefined($playerID.val())) ? $playerID.val() : player_id;
        
        options.url = serviceURL + "/accounts/" + values.account_id + "/players/" + values.player_id + "/configuration";
        options.requestType = "GET";
        
        bclslog("options", options);
        $.ajax({
            url: proxyURL,
            type: "POST",
            data: options,
            success : function (data) {
                console.log("successful call: " );
                console.log(data);
                $generatedResults.html(data);
            },
            error : function (XMLHttpRequest, textStatus, errorThrown) {
                $generatedResults.html("Sorry, the GET request to read player data for your account was not successful. Here's what the server sent back: " + errorThrown);
            }
        });
    };
    
    // set listeners for buttons
    console.log("Player Management API script");
    console.log("set button listeners");
    $generateButton.on("click", getPlayerData);
	
})();