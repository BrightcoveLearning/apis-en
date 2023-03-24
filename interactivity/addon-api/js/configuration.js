hy.define(function() {
return {
  "analytics": {},
  "colors": {
    "colors": {
      "chapterExBackgroundTransparency": "1",
      "chapterExColorBackground": "255, 255, 255",
      "chapterExListElColorFont": "68, 68, 68",
      "chapterExListElHoverColorFont": "2, 40, 75",
      "chapterExTitleBackgroundTransparency": "1",
      "chapterExTitleColorBackground": "2, 40, 75",
      "chapterExTitleColorFont": "255, 255, 255",
      "hotLinkBackgroundColor": "68, 68, 68",
      "hotLinkBackgroundTransparency": "0",
      "popBackgroundColor": "2, 40, 75",
      "popBackgroundTransparency": "1",
      "popBorderColorBottom": "0, 0, 0",
      "popBorderColorLeft": "241, 195, 50",
      "popBorderColorRight": "0, 0, 0",
      "popBorderColorTop": "0, 0, 0",
      "popBorderThicknessBottom": "0",
      "popBorderThicknessLeft": "4",
      "popBorderThicknessRight": "0",
      "popBorderThicknessTop": "0",
      "popFontColor": "255, 255, 255",
      "quizBackgroundTitleColor": "2, 40, 75",
      "quizBackgroundTransparency": "1",
      "quizBorderColor": "2, 40, 75",
      "quizBorderRadius": "3",
      "quizBorderThickness": "3",
      "quizBtnBorderColor": "241, 195, 50",
      "quizCancelBtnBackgroundColor": "255, 255, 255",
      "quizCancelBtnFontColor": "122, 122, 122",
      "quizMainBackgroundColor": "255, 255, 255",
      "quizMainColorFont": "68, 68, 68",
      "quizSubmitBtnBackgroundColor": "241, 195, 50",
      "quizSubmitBtnFontColor": "255, 255, 255",
      "quizTitleColorFont": "255, 255, 255"
    }
  },
  "constants": {
    "CONFIGURATION": {
      "ANALYTICS__PROGRESS_INTERVAL": "ANALYTICS__PROGRESS_INTERVAL",
      "HAPYAK_HOSTING__PLACEHOLDER__TRANSCODING_URL": "HAPYAK_HOSTING__PLACEHOLDER__TRANSCODING_URL",
      "PORTAL__BANNER": "PORTAL__BANNER",
      "PORTAL__BRIGHTCOVE__SYNC_POLL_INTERVAL": "PORTAL__BRIGHTCOVE__SYNC_POLL_INTERVAL"
    },
    "PROVISIONING": {
      "ANNOTATIONS__IFRAME__HTML_TAB": "ANNOTATIONS__IFRAME__HTML_TAB",
      "ANNOTATIONS__IFRAME__URL_TAB": "ANNOTATIONS__IFRAME__URL_TAB",
      "API__ANNOTATION": "API__ANNOTATION",
      "CUSTOM_CSS": "CUSTOM_CSS",
      "EMBED_WHITELIST": "EMBED_WHITELIST",
      "EXPERIENCES__NATIVE_CONTROLS": "EXPERIENCES__NATIVE_CONTROLS",
      "EXPERIENCES__SOCIAL_SHARE": "EXPERIENCES__SOCIAL_SHARE",
      "GEO_SERVICE": "GEO_SERVICE",
      "HAPYAK_API_KEYS__READ": "HAPYAK_API_KEYS__READ",
      "HAPYAK_API_KEYS__REPORTING": "HAPYAK_API_KEYS__REPORTING",
      "HAPYAK_API_KEYS__WRITE": "HAPYAK_API_KEYS__WRITE",
      "HOSTING__ASSET_UPLOAD": "HOSTING__ASSET_UPLOAD",
      "HOSTING__VIDEO": "HOSTING__VIDEO",
      "SAFESTREAM__APPROVAL": "SAFESTREAM__APPROVAL",
      "SAFESTREAM__EMBOSS": "SAFESTREAM__EMBOSS",
      "SETTINGS__ADMIN__INVITE_GROUP_MEMBERS": "SETTINGS__ADMIN__INVITE_GROUP_MEMBERS",
      "SETTINGS__STYLE__NLS": "SETTINGS__STYLE__NLS",
      "SHARE_TYPES__HAPYAK_PLAYER__NATIVE_CONTROLS": "SHARE_TYPES__HAPYAK_PLAYER__NATIVE_CONTROLS",
      "VISUAL_TIMELINE_EDITOR": "VISUAL_TIMELINE_EDITOR"
    },
    "README": [
      "This object holds constants for accessing provisioning and configuration data. All calls to provisioning and configuration should reference the values in this object.",
      "",
      "CONVENTIONS:",
      "A) All properties should be MIRRORED (key == value)",
      "B) USE ALL CAPS",
      "C) Use single underscore '_' to separate words within a level",
      "D) Use double underscore '__' to separate levels",
      "E) Put in ALPHABETICAL ORDER"
    ]
  },
  "copy": {
    "intro": "Try making an interactive video today or view 1000's of examples.",
    "learn": "<div style=\"padding:8px;background-color:#fff;border:solid 1px #eee\">We make interactive video easy and effective for your <b>Business or Organization</b>. <br/><a href=\"http://corp.hapyak.com/#contact\">Find out how</a>.</div>"
  },
  "customReports": {
    "Project Activity OS": {
      "limitDateRangeMonths": 6,
      "title": "Project Activity Stream by OS"
    }
  },
  "direct": {
    "CONFIGURATION": {},
    "PROVISIONING": {
      "CUSTOM_CSS": true,
      "SETTINGS__ADMIN__INVITE_GROUP_MEMBERS": false
    }
  },
  "facebook": {
    "appId": "192763717523135"
  },
  "googleAnalytics": {
    "id": "UA-117930276-1"
  },
  "maintenance": {
    "message": "We are experiencing issues connecting to the service. Please wait a moment and try again."
  },
  "mixpanel": {
    "hapyak": {
      "token": "29f33e43e248a06b4a72a8ee6ff83c68"
    }
  },
  "modified": 1569439782704,
  "player": {
    "plugins": {}
  },
  "portal": {
    "application": {
      "customPortalCss": "<link rel='stylesheet' href='//localhost:8000/dramatic-health-portal.css'>"
    }
  },
  "provisioning": {
    "annotationTypes": {},
    "customCss": true,
    "settings": {
      "admin": {
        "inviteGroupMembers": false
      }
    }
  },
  "resolved": {
    "CONFIGURATION": {},
    "PROVISIONING": {
      "CUSTOM_CSS": true,
      "SETTINGS__ADMIN__INVITE_GROUP_MEMBERS": false
    }
  },
  "sentry": {
    "hapyak": "https://4c0b5aeca83b4b2a826467ba89595130:d896cd4859364c30b167fa30ee71c2c1@app.getsentry.com/2286"
  },
  "site": {
    "index": {
      "tab": "featured"
    },
    "walkme": {
      "guideId": 20126
    }
  },
  "uploads": {
    "host": "hapyak_uploads.s3.amazonaws.com"
  },
  "watch": {}
};
}); 