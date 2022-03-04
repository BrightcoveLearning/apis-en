bold=`tput bold`
normal=`tput sgr0`
echo 'Enter your client id:'
read CLIENT_ID
echo Your client id: $CLIENT_ID
echo --------------------------
echo 'Enter your client secret:'
read CLIENT_SECRET
echo Your client secret: $CLIENT_SECRET
echo --------------------------
echo 'Enter the full API call:'
read API_CALL
echo Your API call: $API_CALL
echo --------------------------
echo "Enter the HTTP method: [ ${bold}g${normal} (GET - default) | ${bold}po${normal} (POST) | ${bold}pa${normal} (PATCH) | ${bold}pu${normal} (PUT) | ${bold}d${normal} (DELETE) ]:"
read VERB
if [ "$VERB" = "" ]
	then
	export VERB="GET"
elif [ "$VERB" = "g" ]
	then
	export VERB="GET"
elif [ "$VERB" = "po" ]
	then
	export VERB="POST"
elif [ "$VERB" = "pa" ]
	then
	export VERB="PATCH"
elif [ "$VERB" = "pu" ]
	then
	export VERB="PUT"
elif [ "$VERB" = "d" ]
	then
	export VERB="DELETE"
fi
echo Your call verb: $VERB
echo --------------------------
echo 'Enter data to be submitted in the request body:'
read DATA
echo Your call verb: $DATA
echo --------------------------
TOKEN=$(curl -s -k --data "grant_type=client_credentials" https://oauth.qa.brightcove.com/v3/access_token --header "Content-Type: application/x-www-form-urlencoded" --user "$CLIENT_ID:$CLIENT_SECRET" | sed -E 's/.*access_token\"\:\"([^\"]+)\".*/\1/');
echo Your token: $TOKEN
echo --------------------------
RESPONSE=$(curl -s -k -X $VERB "$API_CALL" -d "$DATA" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
echo $RESPONSE
echo --------------------------
echo $RESPONSE | python -m json.tool
echo
