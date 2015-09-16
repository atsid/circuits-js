// Simple service descriptor.
define([], function () {
     return {
        "id": "Schema/BinaryObjectService",
        "SMDVersion": "2.0",
        "$schema": "http://json-schema.org/draft-03/schema",
        "transport": "REST",
        "envelope": "PATH",
        "target": "binaryobjects",
        "description": "Methods for working with generic binary content of documents, etc., directly.",
        "contentType": "application/json",
        "services": {
            "uploadDocument": {
                "transport": "POST",
                "target": "documents",
                "description": "Generic service method to upload any document as binary content to PE2E. Returned object will contain the documentId and contentType, as well as a URL that can be used to link directly to the document.",
                "parameters": [
                    {
                        "name": "entry",
                        "type": "any",
                        "envelope": "ENTITY",
                        "enctype": "multipart/form-data",
                        "description": "Uploaded file in server-supported formats",
                        "required": true
                        }
                    ],
                "returns": {
                    "$ref": "Schema/SimpleTestModelResponseSchema"
                }
            },
            "downloadDocument": {
                "transport": "GET",
                "target": "documents",
                "description": "Binary document downloading.",
                "contentType": "application/pdf",
                "returns": {
                    "type": "any"
                }
            }
        }
    };
});