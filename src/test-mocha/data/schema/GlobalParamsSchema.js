define([], function () {
	
	return {
	    "id": "Schema/GlobalParamsSchema",
	    "SMDVersion": "2.0",
	    "$schema": "http://json-schema.org/draft-03/schema",
	    "transport": "REST",
	    "envelope": "PATH",
	    "target": "model/{modelNumber}",
	    "description": "Test Service Methods.",
	    "contentType": "application/json",
	    "parameters": [
	       {
	           "name": "modelNumber",
	           "type": "string",
	           "envelope": "PATH",
	           "description": "ID of model.",
	           "required": true
	       }
	    ],
	    "services": {
	        "readModel": {
	            "transport": "GET",
	            "description": "Get the details for a specific model.",
	            "returns": {
	            	"$ref": "Schema/SimpleTestModelResponseSchema"
	            }
	        },
	    }
	};
});
