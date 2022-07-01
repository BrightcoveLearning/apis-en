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
elif [ "$VERB" = "g" ] || [ "$VERB" = "GET" ] || [ "$VERB" = "get" ]
	then
	export VERB="GET"
elif [ "$VERB" = "po" ] || [ "$VERB" = "p" ] || [ "$VERB" = "POST" ] || [ "$VERB" = "post" ]
	then
	export VERB="POST"
elif [ "$VERB" = "pa" ] || [ "$VERB" = "PATCH" ] || [ "$VERB" = "patch" ]
	then
	export VERB="PATCH"
elif [ "$VERB" = "pu" ] || [ "$VERB" = "PUT" ] || [ "$VERB" = "put" ]
	then
	export VERB="PUT"
elif [ "$VERB" = "d" ] || [ "$VERB" = "DELETE" ] || [ "$VERB" = "delete" ]
	then
	export VERB="DELETE"
fi
echo "Your request type: $VERB"
echo --------------------------
echo 'Enter data to be submitted in the request body:'
read DATA
echo Your call verb: $DATA
echo --------------------------
TOKEN=$(curl -s --data "grant_type=client_credentials" https://oauth.brightcove.com/v4/access_token --header "Content-Type: application/x-www-form-urlencoded" --user "$CLIENT_ID:$CLIENT_SECRET" | sed -E 's/.*access_token\"\:\"([^\"]+)\".*/\1/');
echo Your token: $TOKEN
echo --------------------------
RESPONSE=$(curl -s -v -X $VERB "$API_CALL" -d "$DATA" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
echo Raw response:
echo $RESPONSE
echo --------------------------
echo Pretty-printed response:
echo json_pp $RESPONSE
echo
