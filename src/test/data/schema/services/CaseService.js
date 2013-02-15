define([],
		function () {
	
	return {
		"id": "Schema/services/CaseService",
		"SMDVersion": "2.0",
		"$schema": "http://json-schema.org/draft-03/schema",
		"transport": "REST",
		"envelope": "PATH",
		"target": "cases",
		"description": "Methods for retrieving a case.",
		"contentType": "application/json",
        "payload": "cases",
		"services": {
			"readCaseList": {
				"transport": "GET",
				"extends": {
					"$ref": "Schema/services/PagingServiceMethod"
				},
                "payload": "cases",
                "returns": {
					"$ref": "Schema/responses/CaseListResponse"
				}
			},
			"readCase": {
				"target": "{caseNumber}",
				"transport": "GET",
				"parameters": [
				    {
				    	"name": "caseNumber",
				    	"type": "string",
				    	"envelope": "PATH",
				    	"description": "ID of case to reference.",
				    	"required": true
					}
				],
                "payload": "case",
				"returns": {
					"$ref": "Schema/responses/CaseResponse"
				}
			},
			"readCaseNoteList": {
				"target": "{caseNumber}/notes",
				"transport": "GET",
				"parameters": [
				    {
				    	"name": "caseNumber",
				    	"type": "string",
				    	"envelope": "PATH",
				    	"required": true
					},
					{
				    	"name": "documentId",
				    	"type": "string",
				    	"envelope": "URL",
				    	"required": true
					},
					{
				    	"name": "noteName",
				    	"type": "string",
				    	"envelope": "URL",
				    	"required": false
					},
					{
						"name": "case",
						"type": {
							"$ref": "Schema/models/Case"
						},
						"envelope": "JSON",
						"required": false
					}
				],
                "returns": {
					"$ref": "Schema/responses/CaseListResponse"
				}
	        },
            "deleteCaseNote": {
                "target": "{caseNumber}/notes/{noteId}",
                "transport": "GET",
                "parameters": [
                    {
                        "name": "caseNumber",
                        "type": "string",
                        "envelope": "PATH",
                        "required": true
                    },
                    {
                        "name": "noteId",
                        "type": "integer",
                        "envelope": "PATH",
                        "required": true
                    }
                ],
                "returns": {
                    "type": "null"
                }
            },
	        "readRawPDF": {
	            "target": "{caseNumber}/pdf",
	            "transport": "GET",
	            "description": "Get a specific PDF document as actual PDF.",
	            "parameters": [
	                {
	                    "name": "caseNumber",
	                    "type": "integer",
	                    "envelope": "PATH",
	                    "description": "ID of document to retrieve.",
	                    "required": true
	                }
	            ],
                "returns": {
	                "type": "any",
	                "mediaType": "application/pdf"
	            }
	        }
		}
	};
});