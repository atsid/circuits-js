define([], function () {

    return {
        "id": "Schema/JsTestDriverServiceSchema",
        "SMDVersion": "2.0",
        "$schema": "http://json-schema.org/draft-03/schema",
        "transport": "REST",
        "envelope": "PATH",
        "target": "/base/test/data/schema",
        "description": "Test connection to jstestdriver.",
        "contentType": "application/json",
        "services": {
            "readModel": {
                "target": "{modelname}",
                "transport": "GET",
                "description": "Get the details for a specific model.",
                "parameters": [
                    {
                        "name": "modelname",
                        "type": "string",
                        "envelope": "PATH",
                        "description": "name of the file",
                        "required": true
                    }
                ],
                "payload": "modelNumber",
                "returns": {
                    "$ref": "Schema/SimpleTestModelSchema"
                }
            }
        }
    };
});
