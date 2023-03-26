# Repo Upload Test
import requests

# test values
pub_id = "{{account_id}}"
client_id = "{{client_id}}"
client_secret = "{{client_secret}}"
access_token_url = "https://oauth.brightcove.com/v4/access_token"
file_name = "port_test.js"
repo_name = "js"

# create the access token
def get_access_token():
    access_token = None
    r = requests.post(access_token_url, params="grant_type=client_credentials", auth=(client_id, client_secret),
                      verify=True)
    if r.status_code == 200:
        access_token = r.json().get('access_token')
        # print(access_token)
        return access_token
    

# Upload to Repo function
# Returns response from API
def upload_to_repo():
    access_token = get_access_token()
    headers = {'Authorization': 'Bearer ' + access_token}
    url = "https://repos.api.brightcove.com/v1/accounts/{pubid}/repos/{repname}/files/{filename}".format(pubid=pub_id,
                                                                                                         repname=repo_name,
                                                                                                         filename=file_name)
    file = {"contents": ("port-test.js", open('port-test.js', "rb"))}
    r = requests.request("PUT", url, headers=headers, files=file)
    response = r.json()
    return response


# Upload to the repo
result = upload_to_repo()
print(result)