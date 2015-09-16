define([], function () {
	
	return {
	    "id": "Schema/SimpleTestBaseServiceSchema",
	    "SMDVersion": "2.0",
	    "$schema": "http://json-schema.org/draft-03/schema",
	    "transport": "REST",
	    "envelope": "PATH",
	    "description": "Test Service Methods.",
	    "contentType": "application/json",
	    "extends": {
	    	"$ref": "Schema/SimpleTestBaseBaseServiceSchema"
	    },
	    "parameters": [
	       {
	           "name": "baseParameter",
	           "type": "string",
	           "envelope": "PATH",
	           "description": "universal parameter.",
	       }
	    ]
	};
});
