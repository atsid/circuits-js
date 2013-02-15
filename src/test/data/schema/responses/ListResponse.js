define([], function () {
	
	return {
	    "id": "Schema/responses/ListResponse",
	    "$schema": "http://json-schema.org/draft-03/schema",
	    "extends": {
	    	"$ref": "Schema/responses/BaseResponse"
	    },
	    "description": "Response that all list responses inherit from, in order to provide consistent basic properties for lists.",
	    "properties": {
	        "total": {
	            "type": "integer",
	            "description": "Indicates the total number of objects available on the server, regardless of how many are present in this particular payload.",
	            "required": true
	        }
	    }
	};
});