#!/usr/bin/env python

import sys
import requests
import json
import argparse

pub_id = "***ACCOUNT ID HERE****"
client_id = "***CLIENT ID HERE****"
client_secret = "***CLIENT SECRET HERE****"
access_token_url = "https://oauth.brightcove.com/v3/access_token"
profiles_base_url = "https://ingestion.api.brightcove.com/v1/accounts/{pubid}/profiles"

def get_access_token():
    access_token = None
    r = requests.post(access_token_url, params="grant_type=client_credentials", auth=(client_id, client_secret), verify=False)
    if r.status_code == 200:
        access_token = r.json().get('access_token')
        print(access_token)
    return access_token

def create_video():
    access_token = get_access_token()
    headers = { 'Authorization': 'Bearer ' + access_token, "Content-Type": "application/json" }

    url = ("https://cms.api.brightcove.com/v1/accounts/{pubid}/videos/").format(pubid=pub_id)
    data = '{"name": "***VIDEO TITLE HERE***"}'
    r = requests.post(url, headers=headers, data=data)
    return r.json()

def submit_pbi(video_id):
    access_token = get_access_token()
    print access_token
    headers = { 'Authorization': 'Bearer ' + access_token, "Content-Type": "application/json" }

    url = ("https://ingest.api.brightcove.com/v1/accounts/{pubid}/videos/{videoid}/ingest-requests").format(pubid=pub_id, videoid=video_id)
    print url

    data = '''{
            "master": { "url": "****SOURCE VIDEO URL HERE***" },
         }'''
    r = requests.post(url, headers=headers, data=data)
    print r.headers
    return r.json()

v = create_video()
print v
print submit_pbi(v['id'])
