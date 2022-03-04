var BCLS = (function ($, window, document) {
    "use strict";
    var proxyURL = "https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy.php",
        baseURL = "https://ingestion.api.brightcove.com/v1",
        useMyAccount = document.getElementById("useMyAccount"),
        basicInfo = document.getElementById("basicInfo"),
        account_id = document.getElementById("account_id"),
        client_id = document.getElementById("client_id"),
        client_secret = document.getElementById("client_secret"),
        setOptions = document.getElementById("setOptions"),
        /**
         * defaults - Brightcove Learning account values here - change to account you want to use
         * permissions for:
         * Ingest Profiles API - all operations
         */
        defaults = {
            account_id: "57838016001",
            client_id: "c953f97a-1050-4597-a22e-46ea68f8143b",
            client_secret: "HhzY-WS7NVCPkbQJBfxCmGfB_FYuWfvUGn9-lUNRY3eY6p05Bo1JEErYs-vOWcQ-72Aecel83cN5U22e8S7b-g"
        },
        options = {},
        // for the exercises
        sampleProfile = {"renditions":[{"speed":3,"fixed_keyframe_interval":true,"media_type":"video","keyframe_rate":0.333,"video_codec":"h264","width":848,"reference_id":"mp1","h264_profile":"high","format":"mp4","audio_codec":"aac","audio_bitrate":48,"height":480,"video_bitrate":1280},{"speed":3,"media_type":"video","max_frame_rate":30,"keyframe_rate":0.5,"video_codec":"h264","decoder_bitrate_cap":1920,"reference_id":"hls3","type":"segmented","h264_profile":"high","width":848,"max_hls_protocol_version":2,"format":"ts","audio_codec":"aac","audio_bitrate":48,"hls_optimized_ts":"true","decoder_buffer_size":5120,"height":480,"video_bitrate":1280,"package_format":"zip"},{"height":360,"label":"poster","width":480,"media_type":"image","format":"png"},{"height":90,"label":"thumbnail","width":160,"media_type":"image","format":"png"}],"account_id":"your_account_id","name":"Test_Profile","description":"This will produce 1 MP4 rendition, 1 HLS rendition, and 2 image renditions.","packages":[]},
        profileData,
        profileDataStr = "",
        updateData,
        updateDataStr = "",
        defaultData = {"account_id":57838016001,"profile_id":"screencast-1280"},
        defaultDataStr = "",
        updateDefaultData = {"id":"","account_id":57838016001,"default_profile_id":"videocloud-default-v1"},
        updateDefaultDataStr = "",
        config_id = "",
        profile_id = "",
        ex1request = document.getElementById("ex1request"),
        ex1response = document.getElementById("ex1response"),
        ex1button = document.getElementById("ex1button"),
        ex2request = document.getElementById("ex2request"),
        ex2response = document.getElementById("ex2response"),
        ex2button = document.getElementById("ex2button"),
        ex2data = document.getElementById("ex2data"),
        ex3request = document.getElementById("ex3request"),
        ex3response = document.getElementById("ex3response"),
        ex3button = document.getElementById("ex3button"),
        ex4request = document.getElementById("ex4request"),
        ex4response = document.getElementById("ex4response"),
        ex4button = document.getElementById("ex4button"),
        ex4data = document.getElementById("ex4data"),
        ex5request = document.getElementById("ex5request"),
        ex5response = document.getElementById("ex5response"),
        ex5button = document.getElementById("ex5button"),
        ex6request = document.getElementById("ex6request"),
        ex6response = document.getElementById("ex6response"),
        ex6button = document.getElementById("ex6button"),
        ex7request = document.getElementById("ex7request"),
        ex7response = document.getElementById("ex7response"),
        ex7button = document.getElementById("ex7button"),
        ex7data = document.getElementById("ex7data"),
        ex8request = document.getElementById("ex8request"),
        ex8response = document.getElementById("ex8response"),
        ex8button = document.getElementById("ex8button"),
        ex8data = document.getElementById("ex8data"),
        // functions
        isDefined,
        bclslog,
        copyObj,
        setAccountOptions,
        setupExercises,
        submitRequest;
        /**
         * tests for all the ways a variable might be undefined or not have a value
         * @param {*} x the variable to test
         * @return {Boolean} true if variable is defined and has a value
         */
        isDefined = function(x){
            if ( x !== "" && x !== null && x !== undefined) {
                return true;
            } else {
                return false;
            }
        };
        /**
         * Logging function - safe for IE
         * @param  {string} context description of the data
         * @param  {*} message the data to be logged by the console
         * @return {}
         */
        bclslog = function (context, message) {
            if (window.console && console.log) {
              console.log(context, message);
            }
            return;
        };
        /**
         * get a copy of (rather than reference to) an object
         * @param  {object} obj the object you want a copy
         * @return {object}     the copy
         */
        copyObj = function (obj) {
            return JSON.parse(JSON.stringify(obj));
        };
        /**
         * set up account options when you are ready to assemble the URL and make the API call
         */
        setAccountOptions = function () {
            defaults.account_id = isDefined(account_id.value) ? account_id.value : defaults.account_id;
            defaults.client_id = isDefined(client_id.value) ? client_id.value : defaults.client_id;
            defaults.client_secret = isDefined(client_secret.value) ? client_secret.value : defaults.client_secret;
            bclslog("defaults", defaults);
        };
        /**
         * set up values for exercises
         */
        setupExercises = function () {
            var d = new Date();
            profileData = copyObj(sampleProfile);
            profileData.account_id = defaults.account_id;
            profileData.name += d.toISOString();
            profileDataStr = JSON.stringify(profileData, null, "  ");
            updateData = copyObj(profileData);
            updateData.description = "Test Profile Updated";
            updateData.id = profile_id;
            updateDataStr = JSON.stringify(updateData, null, "  ");
            defaultDataStr = JSON.stringify(defaultData, null, "  ");
            updateDefaultData.id = config_id;
            updateDefaultDataStr = JSON.stringify(updateDefaultData, null, "  ");
            bclslog("updateDefaultDataStr", updateDefaultDataStr);
            ex1request.value = baseURL + "/accounts/" + defaults.account_id + "/profiles";
            ex2request.value = baseURL + "/accounts/" + defaults.account_id + "/profiles";
            ex2data.value = profileDataStr;
            ex3request.value = baseURL + "/accounts/" + defaults.account_id + "/profiles/" + profile_id;
            ex4request.value = baseURL + "/accounts/" + defaults.account_id + "/profiles/" + profile_id;
            ex4data.value = updateDataStr;
            ex5request.value = baseURL + "/accounts/" + defaults.account_id + "/profiles/" + profile_id;
            ex6request.value = baseURL + "/accounts/" + defaults.account_id + "/configuration";
            ex7request.value = baseURL + "/accounts/" + defaults.account_id + "/configuration";
            ex7data.value = defaultDataStr;
            ex8request.value = baseURL + "/accounts/" + defaults.account_id + "/configuration";
            ex8data.value = updateDefaultDataStr;
        };
        // listeners
        // toggle sample/customer account
        useMyAccount.addEventListener("click", function () {
            if (basicInfo.getAttribute('style') === "display:none;") {
                basicInfo.setAttribute('style', "display:block;");
                useMyAccount.textContent = "Cancel";
            } else {
                basicInfo.setAttribute('style', "display:none;");
                useMyAccount.textContent = "Use My Account";
            }
        });
        useSampleAccount.addEventListener("click", function () {
            setAccountOptions();
            useSampleAccount.textContent = "Setup Complete!";
            setupExercises();
        });
        /**
         * submits the api request to the proxy and writes the response
         * @param  {string} the request type get, post, patch, put, delete
         * @param  {object:htmlElement} reqEl  element that holds the api request
         * @param  {object:htmlElement} respEl element to write the response to
         * @param  {object:htmlElement} dataEl element that holds request data (optional)
         */
        submitRequest = function (exNum, reqType, reqEl, respEl, dataEl) {
            var options = {},
                respData;
            options.client_id = defaults.client_id;
            options.client_secret = defaults.client_secret;
            options.url = reqEl.value;
            options.requestType = reqType.toUpperCase();
            options.requestBody = (isDefined(dataEl)) ? dataEl.value : null;
            bclslog("options", options);
            $.ajax({
                url: proxyURL,
                method: "POST",
                data: options,
                success : function (data) {
                    if (exNum === 5) {
                        respEl.value = "(There is no response, meaning the profile was deleted successfully)";
                    } else {

                        try {
                            bclslog("data", data);
                            respData = data;
                            respEl.value = JSON.stringify(respData, null, "  ");
                            if (exNum === 2) {
                                profile_id = respData.id;
                                bclslog("profile_id", profile_id);
                                setupExercises();
                            }
                            if (exNum === 6 || exNum === 7) {
                                config_id = respData.id;
                                bclslog("config_id", config_id);
                                setupExercises();
                            }
                        } catch (e) {
                            bclslog("invalid JSON - something went wrong", e);
                            data = {"Error": e};
                            switch (exNum) {
                                case 5:
                                respEl.value = "[DELETE requests do not return any data - you will just see an empty HTTP 204 response]";
                                break;
                                case 6:
                                respEl.value = "There is no default profile - we'll set one in the next exercise";
                                break;
                                case 7:
                                respEl.value = "There is already a default profile - we'll update it in the next exercise";
                                break;
                                default:
                                respEl.value = "There was a problem with the request";
                            }
                        }
                    }

                }
            });
        };
        // set account options
        setOptions.addEventListener("click", function () {
            setAccountOptions();
            setOptions.textContent = "Setup Complete!";
            setupExercises();
        });
        // exercise button handlers
        ex1button.addEventListener("click", function () {
            submitRequest(1, "get", ex1request, ex1response);
        });
        ex2button.addEventListener("click", function () {
            submitRequest(2, "post", ex2request, ex2response, ex2data);
        });
        ex3button.addEventListener("click", function () {
            submitRequest(3, "get", ex3request, ex3response);
        });
        ex4button.addEventListener("click", function () {
            submitRequest(4, "put", ex4request, ex4response, ex4data);
        });
        ex5button.addEventListener("click", function () {
            submitRequest(5, "delete", ex5request, ex5response);
        });
        ex6button.addEventListener("click", function () {
            submitRequest(6, "get", ex6request, ex6response);
        });
        ex7button.addEventListener("click", function () {
            submitRequest(7, "post", ex7request, ex7response, ex7data);
        });
        ex8button.addEventListener("click", function () {
            submitRequest(8, "put", ex8request, ex8response, ex8data);
        });
    return {};
})($, window, document);
