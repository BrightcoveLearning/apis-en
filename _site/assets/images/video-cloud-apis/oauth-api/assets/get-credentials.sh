bold=`tput bold`
normal=`tput sgr0`
echo 'Enter your BC_TOKEN:'
read BC_TOKEN
echo Your BC_TOKEN id: $BC_TOKEN
echo --------------------------
echo 'Enter your Video Cloud account id:'
read ACCOUNT_ID
echo Your account id: $ACCOUNT_ID
echo --------------------------
export API_CALL="https://oauth.brightcove.com/v3/client_credentials"
echo Here is the API POST request: $API_CALL
echo --------------------------
echo 'Enter the API operations you want to authorize as an array (["video-cloud/player/all","video-cloud/video/all"])'
read OPERATIONS
echo Here are the operations you requested: $OPERATIONS
export VERB="POST"
export DATA="name=ingest-profiles-api-credential&maximum_scope=[{\"identity\":{\"type\":\"video-cloud-account\",\"account-id\":$ACCOUNT_ID},\
\"operations\":$OPERATIONS}]"
echo Your request data: $DATA
echo --------------------------
RESPONSE=$(curl -s -v --data $DATA https://oauth.brightcove.com/v3/client_credentials --header "Content-Type: application/x-www-form-urlencoded" --header "Authorization:BC_TOKEN $BC_TOKEN");
echo Raw response:
echo $RESPONSE
echo --------------------------
echo Pretty-printed response:
echo $RESPONSE | python -m json.tool
echo
