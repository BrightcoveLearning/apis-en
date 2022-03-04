echo Enter the full API call:
read API_CALL
echo Your API call: $API_CALL
echo --------------------------
TOKEN=$(curl -s --data "grant_type=client_credentials" https://oauth.brightcove.com/v3/access_token --header "Content-Type: application/x-www-form-urlencoded" --user "$CLIENT_ID:$CLIENT_SECRET" | jq .access_token | sed 's/\"//g');
echo Youe token: $TOKEN
echo --------------------------
RESPONSE=$(curl -s "$API_CALL" -H "Authorization: Bearer $TOKEN")
echo $RESPONSE
echo
