# Dynamic Ingest, aka Pull-Based Ingest API

Exposes the following endpoint,

    POST /v1/accounts/:accountId/videos/:videoId/ingest-requests

Which takes a request body of the following form,

    {
      "master": { "url": "http://host/master.mp4" },
      "profile": "balanced-high-definition",
      "callbacks": [ "http://host/path" ]
    }

* `master`: the source object for the digital master (required)
* `profile`: the profile to use to create the renditions (optional)
* `callbacks`: a list of notification endpoints to use for callbacks, overriding the profile (optional)

## Ingest method

The normal method of using this is to first make a call to the
CMS API to create the video, and then make an ingest request for the
newly minted `video_id`. For example,

    POST /cms/v1/accounts/8523/videos
    {
      "id": "8523",
      "name": "my video"
    }

On successful video create, this will return,

    { "id": "12345", ... }

Which you can then use to make the PBI call,

    POST /v1/accounts/8523/videos/12345/ingest-requests
    {
      "master": { "url": "http://host/master.mp4" },
      "profile": "balanced-high-definition"
    }

### Success

If the job is submitted successfully, the following response will be delivered,

    {"id":"68198f25-a11f-4a65-b2da-e8ef5ccf20c6"}

Currently, this identifier is not useful to the end-user, but also acts as the mannheim job id, which is useful for internal investigation.

See the "Future Work" section below for how this identifier might be used later.

### Failure

If submission fails, an http error status code and an error object will be returned,

    [
      {
        "error_code":"INTERNAL_ERROR",
        "message": "Internal error, please try again later."
      }
    ]

## Callbacks

To request that you recieve a callback when each rendition and the video are done, supply a list of callback urls in the
request,

    POST /v1/accounts/8523/videos/12345/ingest-requests
    {
      "master": { "url": "http://host/master.mp4" },
      "profile": "balanced-high-definition",
      "callbacks": [ "http://callback-host/path" ]
    }

## Image Capture

Image capture isn't a feature of wedge. To use it, you just need to add two image renditions to the profile used with the labels `thumbnail` and `poster`. These will be detected as the images you'd like to be captured and associated with the specified title.

# Future Work

**Work in Progress**

## Single-call Ingest Method

**Speculative**

If you do not specify the `video_id` in the call to the PBI API, a
video will be created for you which contains no metadata other than
the required `name` field. The value of the `name` will be equal to
the source filename. The newly minted `video_id` will be returned.

    POST /v1/accounts/8523/ingest-requests
    {
      "master": { "url": "http://host/file.mp4" },
      "profile": "balanced-high-definition"
    }

If `profile` is not specified, the account default or standard default
profile will be used.

### Supplying an ancillary file to use

You can add an image with an ingestion job with,

    POST /v1/accounts/8523/videos/12345/ingest-requests
    {
      "master": { "url": "http://host/file.mp4" },
      "thumbnail": { "url": "http://host/file.jpg" }
    }

or,

    POST /v1/accounts/8523/videos/12345/ingest-requests
    {
      "master": { "url": "http://host/file.mp4" },
      "thumbnail": { "url": "http://host/thumb.jpg" },
      "poster": { "url": "http://host/poster.jpg" },
      "captions": [ { "url": 'http://host/file.ext", ... } ]
    }

This would result in PBI submitting a mannheim job to ingest and appropriately package/modify/transcode the files, and
associate them with the video in the catalog.

### Adding an ancillary file

e.g. you want to add a caption file to an existing video.

    POST //v1/accounts/8523/videos/12345/ingest-requests
    {
      "thumbnail": { "url": "http://host/thumb.jpg" },
      "poster": { "url": "http://host/poster.jpg" },
      "captions": [ { "url": 'http://host/file.ext", ... } ]
    }

This creates a new request which sets the videos thumbnail, poster image and captions list to those produced by
the inputs specified in the ingest request. Note that these are not remote assets, but rather assets for ingestion.
Remote assets can be added without ingestion, by directly using the CMS API.

### Replacing an image or ancillary file

If we want to replace the thumbnail, we'll create a new request (hence `POST` method).

    POST /ingest/v1/accounts/8523/requests
    {
      "master": { "url": "http://host/file.mp4" },
      "thumbnail": { "url": "http://host/file.jpg" }
    }

So this looks just like setting the thumbnail.

For ancillary files of which there can be multiple values, the following flows could work,

1. Get the existing value from the CMS API
1. Modify the value client-side to add or remove a single value from the container type
1. Submit a PBI request to set the new value, ingesting new content and setting the value

This has the problem that it requires that the source be provided for all the values, including the ones that are 
already set. It's important that we avoid the mistakes of batch update here.

### Request status

Requests could return a `request id`, to check the status of the
request once it is submitted. To avoid having to store information,
this could be a two-way hash of the mannheim job id.

For example, this would allow the following flow,

1. Create a video in the catalog

Make a call to the CMS API,

    POST //v1/accounts/8523/videos
    { "name": "my video" }

Returns,

    { "id": "12345", "name": "my video", ... }

2. Create the ingest request

Make a call to the PBI API,

    POST /v1/accounts/8523/videos/12345/ingest-requests
    { "master": { "url": "http://host/file.mp4" },
      "profile": "balanced-high-definition" }

Returns,

    { "id": "123abc", "status": "submitted", ... }

In this step, the mannheim job is created, and the hashed (symmetrically encrypted) mannheim job
id `123abc` is returned to the user.

3. Check the status of the request

    GET /v1/accounts/8523/videos/13245/ingest-requests/123abc

Returns,

    { "id": "123abc", "status": "running", ... }

Here, the pbi api decodes the request id to obtain the mannheim job
id, and queries mannheim for the job status.

### Ingest Deletion

Allow users to delete jobs that were recently submitted. Once a request has been created, you could delete it 
by submitting a `DELETE` request,

    DELETE /v1/accounts/8523/videos/12345/ingest-requests/123abc

Which could return `OK` if the job was still in flight, and cancel the job, or return `NOT FOUND` if the job has finished processing. Care should be taken here to avoid leaving jobs/assets in abandoned or bad states.

# Testing Notes

## profiles

For reference, as of 2014-08, here are the currently available standard, VOD profiles in production:

* `Express Standard`
* `audio-only`
* `balanced-high-definition`
* `balanced-standard-definition`
* `high-bandwidth-devices`
* `low-bandwidth-devices`
* `mp4-only`
* `screencast`
* `single-rendition`

### Testing notes

Use [`cthurlhu`](https://bithub.brightcove.com/videocloud/cathy/tree/master/cthurlhu) for making calls.

You need an S3 bucket that zencoder can read from. For QA, this means making the bucket public or attaching the following policy to your bucket, substituting `BUCKET_NAME` for the name of your bucket.

See https://qa.zencoder.com/docs/guides/getting-started/working-with-s3 for more details, but note the policy in the ZC docs is for production, not QA.

    {
    	"Version": "2008-10-17",
    	"Id": "ZencoderBucketPolicy",
    	"Statement": [
    		{
    			"Sid": "Stmt1295042087538",
    			"Effect": "Allow",
    			"Principal": {
    				"AWS": "arn:aws:iam::395540211253:root"
    			},
    			"Action": [
    				"s3:GetObjectAcl",
    				"s3:GetObject",
    				"s3:PutObjectAcl",
    				"s3:ListMultipartUploadParts",
    				"s3:PutObject"
    			],
    			"Resource": "arn:aws:s3:::BUCKET_NAME/*"
    		},
    		{
    			"Sid": "Stmt1295042087538",
    			"Effect": "Allow",
    			"Principal": {
    				"AWS": "arn:aws:iam::395540211253:root"
    			},
    			"Action": [
    				"s3:ListBucketMultipartUploads",
    				"s3:GetBucketLocation"
    			],
    			"Resource": "arn:aws:s3:::BUCKET_NAME"
    		}
    	]
    }

#### Degression on keys

To make calls against PBI, you'll need client credentials that authorize the following operations,

* `video-cloud/ingest-profiles/profile/read`
* `video-cloud/ingest-profiles/account/read`
* `video-cloud/video/read`
* `video-cloud/video/update`

To create such a key, first get a valid `BC_TOKEN` for your user in QA,

    curl -k --header "Content-Type: application/json" --data-ascii '{"email_address": "$USER@brightcove.com", "password": "joejoe", "token_type" : "CORPLOGIN"}' https://signin.qa.brightcove.com/maitred/private/user/authenticate/

Also get your account's publisher id. This can be obtained from wacky pages or logging into the media module.

Then, using these, make a call to the [Cathy client credentials API](https://bithub.brightcove.com/videocloud/cathy/blob/master/doc/client-credentials-registration-api.md),

    curl -k -i -H 'Authorization: BC_TOKEN $BC_TOKEN' \
         -d 'name=pbiClient&maximum_scope=[{"identity": {"type": "video-cloud-account", "account-id": $PUB_ID}, "operations": ["video-cloud/video/read", "video-cloud/video/update", "video-cloud/ingest-profiles/profile/read", "video-cloud/ingest-profiles/account/read"]}]' \
         https://bravoapp30.qanet.local:22843/cathy/private/v3/client_credentials
         
This will return a json document containing your client id and secret. *Save this document!* You can then place these credentials in `$HOME/.cthurlhu/$USER-kong.yml` and prepare for your first request with

    cthurlhu authorize $USER-kong

#### Submitting your first request

For cathy, you'll need to use the 'local' cthurlhu environment, and set up the following tunnel,

    $ ssh -fNL 22849:bravoapp30:22849 login.qanet.local

For other environments, consult [Where is Cathy?](http://confluence.vidmark.local/display/DEV/Cathy#Cathy-WhereisCathy%3F)

For roebuck (the host names of the actual servers change),

    $ ssh -fNL 3680:$(ssh login.gri.brightcove.com "nodeattr -n roebuck-rest-server|head -n1"):3680 login.gri.brightcove.com

For job submission, use mannheim directly

    $ ssh -fNL 8080:internal-mannheim-internal-qa-lb-494839318.us-east-1.elb.amazonaws.com:80 login.gri.brightcove.com

OR, if you want to use optimus-prime instead of mannheim directly,

    $ ssh -fNL 8080:internal-qa-op-lb-InternalE-1LLL2VMQWC290-153544499.us-east-1.elb.amazonaws.com:80 login.gri.brightcove.com

Startup `wedge-server`. See server README for more details,

    $ lein do clean, run

Then you can issue a request against it,

    $ read -r -d '' REQ <<-'EOF'                                                                                    
    { "master": { "url": "s3://bucket/file.mp4" },
      "profile": "mp4-only" }
    EOF
        
    $ cthurl -vi -X POST -H "Content-Type: application/json" -d "$REQ" \
        localhost:34380/v1/accounts/8523/videos/12345/ingest-requests

#### Testing dramatic template changes

If you need to make dramatic changes, or have a long-lived branch of a template, it might be a good idea to create a new template in OP, and work on that until you are ready to merge it with the extant copy. To do this, first create your new template, add it to the OP resources, do an OP deploy and update the OP configuration in chef to reference it (see this [change](https://bithub.brightcove.com/infrastructure/chef/pull/1688) for reference). Then, you can submit a PBI request with a request body including a `template` property,

    {
      "master": { "url": "http://host/master.mp4" },
      "profile": "balanced-high-definition",
      "template": "my-test-template"
    }

Note that for this to work, the `pbi.specifyTemplate` flag must be explicitly set to `true` in the wedge config. This feature is meant for *non-prod use only*

#### Logging

If you want to get more detail about the PBI requests in wedge, you can turn up the level of the `wedge.api.pbi` logger, using `log_level.jimi -p 34304 -l wedge.api.pbi -v debug $(nodeattr -s wedge-cms-api-server)`.

# Implementation notes

Currently, observables up to the ingest request constructor use null for error, and the ingest
request and http response observables use product types (`Wrapped`*) to compose with error state.
