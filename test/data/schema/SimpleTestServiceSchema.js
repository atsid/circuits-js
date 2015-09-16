define([], function () {

	return {
	    "id": "Schema/SimpleTestServiceSchema",
        "SMDVersion": "2.0",
	    "$schema": "http://json-schema.org/draft-03/schema",
	    "transport": "REST",
	    "envelope": "PATH",
	    "target": "model",
	    "description": "Test Service Methods.",
	    "contentType": "application/json",
	    "extends" : {
	    	"$ref": "Schema/SimpleTestBaseServiceSchema"
	    },
	    "services": {
	        "listModel": {
	            "transport": "GET",
	            "description": "list the Models.",
                "payload": "models",
	            "returns": {
	            	"$ref": "Schema/SimpleTestModelListResponseSchema"
	            }
	        },
	        "createModel": {
	            "transport": "POST",
	            "description": "Creates a new Model.",
	            "parameters": [
	               {
	                   "name": "model",
	                   "type": {
	                	   "$ref": "Schema/SimpleTestModelSchema"
	                   },
                       "payload": "model",
                       "envelope": "JSON",
                       "description": "model payload",
	                   "required": true
	               }
	             ],
                "payload": "model",
                "returns": {
	            	 "$ref": "Schema/SimpleTestModelResponseSchema"
	             }
	        },
	        "readModel": {
	            "target": "{modelNumber}",
	            "transport": "GET",
	            "description": "Get the details for a specific model.",
	            "parameters": [
	                {
	                    "name": "modelNumber",
	                    "type": "string",
	                    "envelope": "PATH",
	                    "description": "ID of model.",
	                    "required": true
	                }
	            ],
                "payload": "model",
                "returns": {
	            	"$ref": "Schema/SimpleTestModelResponseSchema"
	            }
	        },
	        "updateModel": {
	            "target": "{modelNumber}",
	            "transport": "PUT",
	            "description": "Updates details of a Model.",
	            "parameters": [
	               {
	                   "name": "modelNumber",
	                   "type": "string",
	                   "envelope": "PATH",
	                   "description": "ID of model.",
	                   "required": true
	               },
	               {
	                   "name": "model",
                       "payload": "model",
                       "type": {
	                	   "$ref": "Schema/SimpleTestModelSchema"
	                   },
	                   "envelope": "JSON",
	                   "description": "model payload",
	                   "required": true
	               }
	             ],
                "payload": "model",
                "returns": {
	            	 "$ref": "Schema/SimpleTestModelResponseSchema"
	             }
	        },
            "readArray": {
                "target": "{modelNumber}/array",
                "transport": "GET",
                "description": "Get bare array.",
                "parameters": [
                    {
                        "name": "modelNumber",
                        "type": "string",
                        "envelope": "PATH",
                        "description": "ID of model.",
                        "required": true
                    }
                ],
                "returns": {
                    "type": "array",
                    "items": {
                        "$ref": "Schema/SimpleTestModelResponseSchema"
                    }
                }
            },
            "updateArray": {
                "target": "{modelNumber}/updatearray",
                "transport": "PUT",
                "description": "update a bare array.",
                "parameters": [
                    {
                        "name": "modelNumber",
                        "type": "string",
                        "envelope": "PATH",
                        "description": "ID of model.",
                        "required": true
                    },
                    {
                        "name": "payload",
                        "envelope": "JSON",
                        "description": "An Array payload",
                        "required": true,
                        "type": "array",
                        "items": {
                            "$ref": "Schema/SimpleTestModelSchema"
                        }
                    }
                ],
                "returns": {
                    "type": "array",
                    "items": {
                        "$ref": "Schema/SimpleTestModelResponseSchema"
                    }
                }
            },
            "uploadBinary": {
                "transport": "POST",
                "description": "Upload binary file.",
                "parameters": [
                    {
                        "name": "model",
                        "type": "any",
                        "envelope": "ENTITY",
                        "enctype": "multipart/form-data",
                        "description": "model payload",
                        "required": true
                    }
                ],
                "returns": {
                    "$ref": "Schema/SimpleTestModelResponseSchema"
                }
            },
            "deleteModel": {
	            "target": "{modelNumber}",
	            "transport": "DELETE",
	            "description": "Updates details of a Model.",
	            "parameters": [
	               {
	                   "name": "modelNumber",
                       "type": "string",
	                   "envelope": "PATH",
	                   "description": "ID of model.",
	                   "required": true
	               }
	             ],
	             "returns": "void"
	        },
            "serviceWithNoEnvelope": {
                "target": "{modelNumber}",
                "transport": "DELETE",
                "description": "Updates details of a Model.",
                "parameters": [
                    {
                        "name": "modelNumber",
                        "type": "string",
                        "description": "ID of model.",
                        "required": true
                    }
                ],
                "returns": "void"
            }
        }
	};
});
