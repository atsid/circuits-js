define([], function () {
	
	return {
        "id": "Schema/models/SimpleTestModel",
        "description": "A simple model for testing",
        "$schema": "http://json-schema.org/draft-03/schema",
        "type": "object",
        "properties": {
            "modelNumber": {
                "type": "string",
                "description": "The number of the model.",
                "required": true
            }
        }
	};
});