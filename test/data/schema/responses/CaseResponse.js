define([], function () {
	
		return {
			
		    "id": "Schema/responses/CaseResponse",
		    "$schema": "http://json-schema.org/draft-03/schema",
		    "extends": {
		    	"$ref": "Schema/responses/BaseResponse"
		    },
		    "description": "Return payload for a single Case.",
		    "properties": {
		        "case": {
		        	"$ref": "Schema/models/Case"
		        }
		    }
		};
	});