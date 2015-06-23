define([], function () {
	
	return {
        "id": "Schema/SimpleTestModelResponseSchema",
        "$schema": "http://json-schema.org/draft-03/schema",
        "type": "object",
        "description": "Response that all responses inherit from, in order to provide consistent basic properties for all services.",
        "properties": {
            "success": {
                "type": "boolean",
                "description": "Indicates successful server operation and valid payload.",
                "required": true
            },
            "msg": {
                "type": "string",
                "description": "Friendly message suitable for display to user if required.",
                "required": true
            },
            "model": {
                "type": {
                	"$ref": "Schema/SimpleTestModelSchema"
                },
                "description": "The number of the model.",
                "required": true
            }
        }
	};
});