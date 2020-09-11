#! /usr/bin/env bash
# Static header fields.
HEADER='{
	"type": "JWT",
	"alg": "RS256"
}'

payload='{
	"pkid": "f5ef3f82-6b58-42ee-8d2f-c3a62fccfb73",
	"accid": "1752604059001"
}'

# Use jq to set the dynamic `iat` and `exp`
# fields on the payload using the current time.
# `iat` is set to now, and `exp` is now + 1 second.
PAYLOAD=$(
	echo "${payload}" | jq --arg time_str "$(date +%s)" \
	'
	($time_str | tonumber) as $time_num
	| .iat=$time_num
	| .exp=($time_num + 60 * 60)
	'
)

function b64enc() { openssl enc -base64 -A | tr '+/' '-_' | tr -d '='; }

function rs_sign() { openssl dgst -binary -sha256 -sign /Users/rcrooks/GitHub/apis/brightcove-playback-auth-key-1599245299/private.pem ; }

JWT_HDR_B64="$(echo -n "$HEADER" | b64enc)"
JWT_PAY_B64="$(echo -n "$PAYLOAD" | b64enc)"
UNSIGNED_JWT="$JWT_HDR_B64.$JWT_PAY_B64"
SIGNATURE=$(echo -n "$UNSIGNED_JWT" | rs_sign | b64enc)
echo "\n"
echo "$UNSIGNED_JWT.$SIGNATURE"