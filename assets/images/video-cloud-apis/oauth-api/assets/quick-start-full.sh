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
echo 'Enter the call verb (GET | POST | PATCH | PUT | DELETE):'
read VERB
echo Your call verb: $VERB
echo --------------------------
echo 'Enter data to be submitted in the request body:'
read DATA
echo Your call verb: $DATA
echo --------------------------
TOKEN=$(curl -s --data "grant_type=client_credentials" https://oauth.brightcove.com/v3/access_token --header "Content-Type: application/x-www-form-urlencoded" --user "$CLIENT_ID:$CLIENT_SECRET" | jq .access_token | sed 's/\"//g');
echo Your token: $TOKEN
echo --------------------------
RESPONSE=$(curl -s -X $VERB "$API_CALL" -d "$DATA" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
echo $RESPONSE | python -m json.tool
echo
