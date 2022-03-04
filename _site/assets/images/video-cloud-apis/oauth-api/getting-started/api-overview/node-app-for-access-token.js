/*
 * Simple node app to get an access_token for a Brightcove API
 * You will need to substitute valid client_id and client_secret values
 * for {your_client_id} and {your_client_secret}
 */
var request = require('request');
var client_id = "{your_client_id}";
var client_secret = "{your_client_secret}";
var auth_string = new Buffer(client_id + ":" + client_secret).toString('base64');
console.log(auth_string);
request({
	method: 'POST',
	url: 'https://oauth.brightcove.com/v3/access_token',
	headers: {
		'Authorization': 'Basic ' + auth_string,
		'Content-Type': 'application/x-www-form-urlencoded'
	},
	body: 'grant_type=client_credentials'
}, function (error, response, body) {
	console.log('Status: ', response.statusCode);
	console.log('Headers: ', JSON.stringify(response.headers));
	console.log('Response: ', body);
	console.log('Error: ', error);
});
