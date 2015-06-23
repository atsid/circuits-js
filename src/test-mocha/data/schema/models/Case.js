define([], function () {
	
	return {
		"id": "Schema/models/Case",
		"description": "Full list of metadata details for a case.",
		"$schema": "http://json-schema.org/draft-03/schema",
		"type": "object",
		"properties": {
			"caseNumber": {
				"type": "string",
				"description": "Identifier for the case, aka 'proceeding'.",
				"required": true
				/*TODO: insert format regex for validation */
			},
			"employeeNumber": {
				"type": "string",
				"description": "The id of the examiner.",
				"required": false
			},
			"title": {
				"type": "string",
				"description": "The title of the patent.",
				"required": false
			}
		}
    };
});