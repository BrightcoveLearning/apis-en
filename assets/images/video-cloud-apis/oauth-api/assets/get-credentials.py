#!/usr/bin/python

import httplib, urllib,base64, json, sys, requests, ssl

name = "DaveTestKey"
description = "Test Key with asset Permissions"

bcToken = "AEnTxTgi_WYFe0696F_R5-T48GzX27wJWig2TCGA6jn4LYtXcbqbF4Gypmf9QigtEp06uUCrfpIL_ExVJQLHC1VrIRL3_3GLiv8gOXXAiA4UR3dEssuSNgI"

permissionList = [ 'video-cloud/asset/delete',
                   'video-cloud/ingest-profiles/profile/read',
                   'video-cloud/ingest-profiles/profile/write',
                   'video-cloud/ingest-profiles/account/read',
                   'video-cloud/ingest-profiles/account/write'
                 ]

accountList = [4113679519001, 4165107200001]

data = {}
data['type'] = 'credential'
data['name'] = name
data['description'] = description
data['maximum_scope'] = []

for acctId in accountList:

    identity = {}
    identity['type'] = "video-cloud-account"
    identity['account-id'] = acctId
    item = {}
    item['identity'] = identity
    item['operations'] = permissionList

    data['maximum_scope'].insert(0,item)


headersMap = {
    "Content-Type": "application/json",
    "Authorization": " BC_TOKEN " + bcToken
}

print(json.dumps(data,indent=4, sort_keys=True))

url = 'https://oauth.brightcove.com/v3/client_credentials'
r = requests.post(url,data=json.dumps(data), headers=headersMap)

print "status code: {0}".format(r.status_code)
print r.json()
