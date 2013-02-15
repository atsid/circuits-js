define([],
    function () {

        return {
        "id": "Schema/MinimalTestServiceSchema",
        "SMDVersion": "2.0",
        "$schema": "http://json-schema.org/draft-03/schema",
        "transport": "REST",
        "services": {
            "simpleService": {
                "target": "{modelNumber}",
                "description": "Get the details for a specific model.",
                "parameters": [
                    {
                        "name": "modelNumber",
                        "type": "string",
                        "description": "ID of model.",
                        "required": true
                    }
                ],
                "payload": "model",
                "returns": "void"
            },
            "withEnvelope": {
                "target": "{modelNumber}",
                "description": "Get the details for a specific model.",
                "parameters": [
                    {
                        "name": "modelNumber",
                        "type": "string",
                        "envelope" : "JSON",
                        "description": "ID of model.",
                        "required": true
                    }
                ],
                "payload": "model",
                "returns": "void"
            }
        }
    };
});
