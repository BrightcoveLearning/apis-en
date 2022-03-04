var errorMessages = {
    "access-token":    {
        "unsupported-grant-type": "The \"grant_type\" parameter is missing or invalid.",
        "unsupported-response-type": "The \"response_type\" parameter is missing or invalid.",
        "invalid-client": "The \"client_id\" parameter is missing, does not name a client registration that is applicable for the requested call, or is not properly authenticated.",
        "unauthorized-client": "The client registration named by the \"client_id\" parameter is not allowed to perform the requested operation.",
        "invalid-request": "The following parameters of the request are missing, syntactically incorrect, or inconsistent with one another [parameters]",
        "invalid-scope": "The \"scope\" parameter is invalid or not permitted by the named client registration.",
        "access-denied": "The request does not carry authentication credentials sufficient to authorize the requested access.",
        "invalid-grant": "The provided authorization grant value is expired, revoked, or otherwise invalid.",
        "server-error": "An internal server error occurred."
    },
    "client-registration":    {
        "invalid-request": "The following parameters of the request are missing, syntactically incorrect, or inconsistent with one another [parameters]",
        "invalid-request-no-update": "No attributes were supplied to update.",
        "endpoint-not-allowed": "The requested scope may not be accessed through this API endpoint.",
        "access-denied": "The request does not carry authentication credentials sufficient to authorize the requested access.",
        "server-error": "An internal server error occurred.",
        "not-found": "The requested client registration could not be retrieved.",
        "no-escalation": "The privilege level of an existing client registration may never be increased.",
        "already-revoked": "This client registration is revoked and may not be updated."
    }
};