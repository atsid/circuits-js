define([], function () {
	
	return {
		"id": "Schema/services/PagingServiceMethod",
		"SMDVersion": "2.0",
		"$schema": "http://json-schema.org/draft-03/schema",
		"description": "Base method for all service calls that provide paging of results.",
		"parameters": [
			{
				"name": "offset",
				"type": "integer",
				"envelope": "URL",
				"description": "Starting offset into the server-side list. 0-based.",
				"required": false
			},
			{
				"name": "count",
				"type": "integer",
				"envelope": "URL",
				"description": "Number of results to return. The number of results can be less than this number if there are not enough remaining on the server.",
				"required": false
			}
		]
	};
});
