/**
 * Created with JetBrains WebStorm.
 * User: kevin.convy
 * Date: 2/6/13
 * Time: 3:17 PM
 * To change this template use File | Settings | File Templates.
 */
define([
    "Schema/BinaryObjectService",
    "Schema/GlobalParamsSchema",
    "Schema/JsTestDriverServiceSchema",
    "Schema/MinimalTestServiceSchema",
    "Schema/SimpleTestBaseBaseServiceSchema",
    "Schema/SimpleTestBaseServiceSchema",
    "Schema/SimpleTestModelResponseSchema",
    "Schema/SimpleTestModelListResponseSchema",
    "Schema/SimpleTestModelSchema",
    "Schema/SimpleTestServiceSchema",
    "Schema/JsonpTestServiceSchema",
    "Schema/models/Case",
    "Schema/models/SimpleTestModel",
    "Schema/models/SimpleTestModel2",
    "Schema/models/JsonpTestModel",
    "Schema/responses/BaseResponse",
    "Schema/responses/CaseListResponse",
    "Schema/responses/CaseResponse",
    "Schema/services/CaseService",
    "Schema/services/PagingServiceMethod",
    "Schema/responses/ListResponse",
    "Schema/responses/SimpleTestModelListResponse",
    "Schema/responses/SimpleTestModelResponse",
    "Schema/SimpleTestModelJson"
], function (
    BinaryObjectService,
    GlobalParamsSchema,
    JsTestDriverServiceSchema,
    MinimalTestServiceSchema,
    SimpleTestBaseBaseServiceSchema,
    SimpleTestBaseServiceSchema,
    SimpleTestModelResponseSchema,
    SimpleTestModelListResponseSchema,
    SimpleTestModelSchema,
    SimpleTestServiceSchema,
    JsonpTestServiceSchema,
    Case,
    SimpleTestModel,
    SimpleTestModel2,
    JsonpTestModel,
    BaseResponse,
    CaseListResponse,
    CaseResponse,
    ListResponse,
    CaseService,
    PagingServiceMethod,
    SimpleTestModelListResponse,
    SimpleTestModelResponse,
    SimpleTestModelJson
) {

    var schemas = {
            "Schema/BinaryObjectService": BinaryObjectService,
            "Schema/GlobalParamsSchema": GlobalParamsSchema,
            "Schema/JsTestDriverServiceSchema": JsTestDriverServiceSchema,
            "Schema/MinimalTestServiceSchema": MinimalTestServiceSchema,
            "Schema/SimpleTestBaseBaseServiceSchema": SimpleTestBaseBaseServiceSchema,
            "Schema/SimpleTestBaseServiceSchema": SimpleTestBaseServiceSchema,
            "Schema/SimpleTestModelResponseSchema": SimpleTestModelResponseSchema,
            "Schema/SimpleTestModelListResponseSchema": SimpleTestModelListResponseSchema,
            "Schema/SimpleTestModelSchema": SimpleTestModelSchema,
            "Schema/SimpleTestServiceSchema": SimpleTestServiceSchema,
            "Schema/JsonpTestServiceSchema": JsonpTestServiceSchema,
            "Schema/models/Case": Case,
            "Schema/models/SimpleTestModel": SimpleTestModel,
            "Schema/models/SimpleTestModel2": SimpleTestModel2,
            "Schema/models/JsonpTestModel": JsonpTestModel,
            "Schema/responses/BaseResponse":  BaseResponse,
            "Schema/responses/CaseListResponse":  CaseListResponse,
            "Schema/responses/CaseResponse":  CaseResponse,
            "Schema/responses/ListResponse":  ListResponse,
            "Schema/services/CaseService":  CaseService,
            "Schema/services/PagingServiceMethod":  PagingServiceMethod,
            "Schema/responses/SimpleTestModelListResponse":  SimpleTestModelListResponse,
            "Schema/responses/SimpleTestModelResponse":  SimpleTestModelResponse,
            "Schema/SimpleTestModelJson": SimpleTestModelJson
            
        },
        resolve = function (name) {
            return schemas[name];
        };

    return resolve;

});
