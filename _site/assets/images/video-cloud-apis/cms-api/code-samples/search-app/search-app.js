// knockout view model
function cmsSearchModel() {
        var self = this,
            i, iMax, item, itemsArray, termsArray,
            APIresponse = document.getElementById("response");
        // non-editable data
        // date pickers
        rome(fromDate);
        rome(toDate);
        self.apiURL = document.getElementById("apiURL");
        self.searchField = ["name", "text", "tags", "reference_id", "custom_fields", "state", "playable"];
        self.searchState = ["ACTIVE", "INACTIVE", "PENDING"];
        self.searchPlayable = ["true", "false"];
        self.limit = [10, 25, 50, 100];
        self.dateRangeType = ["updated_at", "created_at", "published_at", "schedule.starts_at", "schedule.ends_at"];
        self.sortOptions = ["name", "reference_id", "created_at", "published_at", "updated_at", "schedule_starts_at", "schedule_ends_at", "state", "plays_total", "plays_trailing_week"];
        self.proxyURL = ko.observable("https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy.php");

        // editable data
        self.client_id = ko.observable("");
        self.client_secret = ko.observable("");
        self.account_id = ko.observable("");
        self.exactMatch = ko.observable(false);
        self.requiredTerms = ko.observable(false);
        self.excludeTerms = ko.observable(false);
        self.selectedSearchState = ko.observable();
        self.selectedSearchField = ko.observable();
        self.selectedDateRangeType = ko.observable();
        self.searchComplete = ko.observable(true);
        self.customField = ko.observable("");
        self.searchTerms = ko.observable("");
        self.selectedLimit = ko.observable(10);
        self.itemCount = ko.observable("");
        self.offsets = ko.observableArray([0]);
        self.selectedOffset = ko.observable();
        self.selectedSortOption = ko.observable();
        // computed data
        self.haveAccountInputs = ko.computed(function() {
            if (self.account_id() === "" || self.client_id() === "" || self.client_secret() === "") {
                return false;
            } else {
                return true;
            }
        });
        self.haveSearchState = ko.computed(function() {
            if (self.selectedSearchField() === "state") {
                return true;
            } else {
                return false;
            }
        });
        self.havePlayable = ko.computed(function() {
            if (self.selectedSearchField() === "playable") {
                return true;
            } else {
                return false;
            }
        });
        self.haveItemCount = ko.computed(function() {
            if (self.itemCount() === "") {
                return false;
            } else {
                return true;
            }
        });
        self.haveSearchField = ko.computed(function() {
            if (self.selectedSearchField() === undefined) {
                return false;
            } else {
                return true;
            }
        });
        self.haveCustomField = ko.computed(function() {
            if (self.customField() === "") {
                return false;
            } else {
                return true;
            }
        });
        self.haveDateType = ko.computed(function() {
            if (self.selectedDateRangeType() === undefined) {
                return false;
            } else {
                return true;
            }
        });
        self.haveSearchTerms = ko.computed(function() {
            if (self.searchTerms() === "") {
                return false;
            } else {
                return true;
            }
        });
        self.haveSearchTermsOrDateRange = ko.computed(function() {
            if (self.haveSearchTerms() || self.haveDateType() || self.haveSearchState() || self.havePlayable()) {
                return true;
            } else {
                return false;
            }
        });

        // operations
        // function to write the request to the page
        self.logResponse = function(data) {
            response.innerHTML += data + ",<br />";
        };
        // function to set up the request
        self.setupURL = (function() {
            var str = "https://cms.api.brightcove.com/v1/accounts/" + self.account_id() + "/counts/videos?q=",
                fromDateValue = rome(fromDate).getDate(),
                toDateValue = rome(toDate).getDate();
            if (self.haveSearchField()) {
                if (self.haveSearchState()) {
                    str += self.selectedSearchField() + ":" + self.selectedSearchState();
                } else if (self.haveSearchTerms()) {
                    termsArray = self.searchTerms().split(" ");
                    imax = termsArray.length;
                    if (self.exactMatch()) {
                        for (i = 0; i < iMax; i++) {
                            termsArray[i] = '\"' + termsArray[i] + '\"';
                        }
                    }
                    for (i = 0; i < iMax; i++) {
                        item = termsArray[i];
                        item = self.selectedSeachField() + ":" + item;
                        if (self.excludeTerms()) {
                            item = "%2D" + item;
                        } else if (self.requiredTerms()) {
                            item = "%2B" + item;
                        }
                    }
                    str += termsArray.join("+");
                }
            } else if (self.haveCustomField()) {
                if (self.haveSearchTerms()) {
                    termsArray = self.searchTerms().split(" ");
                    iMax = termsArray.length;
                    if (self.exactMatch()) {
                        for (i = 0; i < iMax; i++) {
                            termsArray[i] = '\"' + termsArray[i] + '\"';
                        }
                    }
                    for (i = 0; i < iMax; i++) {
                        termsArray[i] = self.customField() + ":" + termsArray[i];
                        if (self.excludeTerms()) {
                            item = "%2D" + item;
                        } else if (self.requiredTerms()) {
                            item = "%2B" + item;
                        }
                    }
                    str += termsArray.join("+");
                }
            } else if (self.haveSearchTerms()) {
                // don't have field type
                if (self.exactMatch()) {
                    if (self.excludeTerms()) {
                        str += '%2D"' + self.searchTerms() + '"';
                    } else if (self.requiredTerms()) {
                        str += '%2B"' + self.searchTerms() + '"';
                    } else {
                        str += '"' + self.searchTerms() + '"';
                    }
                } else if (self.excludeTerms()) {
                    for (i = 0; i < iMax; i++) {
                        termsArray[i] = '%2D' + termsArray[i];
                        str += termsArray.join(" ");
                    }
                } else if (self.requiredTerms()) {
                    for (i = 0; i < iMax; i++) {
                        termsArray[i] = '%2B' + termsArray[i];
                        str += termsArray.join(" ");
                    }
                } else {
                    str += self.searchTerms();
                }
            }
            if (self.haveDateType()) {
                // add a plus if there are also search terms
                if (self.haveSearchTerms) {
                    str += "+";
                }
                if (fromDateValue !== null) {
                    str += self.selectedDateRangeType() + ":";
                    str += fromDateValue.toISOString();
                }
                str += "..";
                if (toDateValue !== null) {
                    str += toDateValue.toISOString();
                }
            }
            str += "&limit=" + self.selectedLimit();
            str += "&offset=" + self.selectedOffset();
            str += "&sort=" + self.selectedSortOption();
            url = str;
            self.apiURL.value = url;
            self.submitRequest("counts", function(count) {
                var totalSets = Math.ceil(count / self.selectedLimit()),
                    i;
                self.itemCount(count);
                for (i = 1; i < totalSets; i++) {
                    self.offsets.push(i * self.selectedLimit());
                }
                url = url.replace("/counts/videos", "/videos");
                self.apiURL.value = url;
                self.submitRequest("items", function(response) {
                    self.logResponse(response);
                });
            });
        });
        self.submitRequest = function(type, callback) {
            var httpRequest = new XMLHttpRequest(),
                requestData,
                // handler for response from the proxy
                getResponse = function() {
                    try {
                        if (httpRequest.readyState === 4) {
                            if (httpRequest.status >= 200 && httpRequest.status < 300) {
                                switch (type) {
                                    case "counts":
                                        var count = JSON.parse(httpRequest.responseText).count;
                                        callback(count);
                                        break;
                                    case "items":
                                        callback(httpRequest.responseText);
                                        break;
                                    default:
                                        self.logResponse("Unexpected response: " + httpRequest.responseText);
                                        break;
                                }
                            } else {
                                alert("There was a problem with the request. Request returned " + httpRequest.status);
                            }
                        }
                    } catch (e) {
                        alert('Caught Exception: ' + e);
                    }
                };
            // check for required account info
            if (!self.haveAccountInputs) {
                alert("You must provide an account id, client id, and client secret");
                return;
            }
            // set up request data
            requestData = "client_id=" + self.client_id() + "&client_secret=" + self.client_secret() + "&url=" + encodeURIComponent(self.apiURL.value) + "&requestType=GET";
            // set response handler
            httpRequest.onreadystatechange = getResponse;
            // open the request
            httpRequest.open("POST", self.proxyURL());
            // set headers
            httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            // open and send request
            httpRequest.send(requestData);
        };
    }
    // apply knockout bindings
ko.applyBindings(new cmsSearchModel());
