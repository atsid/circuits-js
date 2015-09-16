define([], function () {
	
	return {
	    "id": "Schema/SimpleJsonpServiceSchema",
        "SMDVersion": "2.0",
	    "$schema": "http://json-schema.org/draft-03/schema",
	    "transport": "JSONP",
	    "envelope": "URL",
	    "description": "Test JSONP Service Methods.",
	    "contentType": "application/json",
        "jsonpCallbackParameter": "callback",
        "target": "/test/src/test/data/jsonpResponse.json",
        "services": {
            "getModel": {
                "transport": "JSONP",
                "description": "get a model.",
                "payload": "",
                "returns": {
                    "$ref": "Schema/models/JsonpTestModel"
                }
            }
        }
	};
});
