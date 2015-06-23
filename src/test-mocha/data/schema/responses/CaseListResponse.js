define([], function () {
	
	return {
	    "id": "Schema/responses/CaseListResponse",
	    "$schema": "http://json-schema.org/draft-03/schema",
	    "extends": {
	    	"$ref": "Schema/responses/ListResponse"
	    },
	    "description": "Return payload for a list of Cases.",
	    "properties": {
	        "cases": {
	        	"type": "array",
	        	"required": true,
	        	"items": {
	    	    	"$ref": "Schema/models/Case"
	    	    }
	        }
	    }
    };
});