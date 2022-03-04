function cmsSearchModel () {
	this.client_id: ko.observable(""),
	this.client_secret: ko.observable(""),
	this.account_id: ko.observable(""),
    this.proxyURL = ko.observable("//solutions.brightcove.com:8006"),
    this.baseURL = ko.observable("https://cms.api.brightcove.com/v1beta1/accounts/"),
}