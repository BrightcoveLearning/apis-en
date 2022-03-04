export CLIENT_ID=b17d7b59-3ec8-4518-b4e7-e25049152c1c
echo $CLIENT_ID
export CLIENT_SECRET=sKAykmujiwUEwnMcDUQrWX8mcWWc3bs0mXD1vTRDbq29RdITSWGcSkt0njKj_qYHuL14eaRUY18viPzZ4_79FQ
echo $CLIENT_SECRET
export API_CALL='https://data.brightcove.com/analytics-api/videocloud/account/2632443407001/report/?dimensions=video,referrer_domain&limit=10&offset=0&fields=all&sort=engagement_score&format=json'
echo $API_CALL
TOKEN=$(curl -s --data "grant_type=client_credentials" https://oauth.brightcove.com/v3/access_token --header "Content-Type: application/x-www-form-urlencoded" --user "$CLIENT_ID:$CLIENT_SECRET" | jq .access_token | sed 's/\"//g'); curl -s "$API_CALL" -H "Authorization: Bearer $TOKEN"

