define([], function () {
	
	return {
	    "id": "Schema/SimpleTestBaseBaseServiceSchema",
	    "SMDVersion": "2.0",
	    "$schema": "http://json-schema.org/draft-03/schema",
	    "transport": "REST",
	    "envelope": "PATH",
	    "description": "Test Service Methods.",
	    "contentType": "application/json",
	    "parameters": [
	       {
	           "name": "baseBaseParameter",
	           "type": "string",
	           "envelope": "PATH",
	           "description": "universal parameter.",
	       }
	    ]
	};
});
