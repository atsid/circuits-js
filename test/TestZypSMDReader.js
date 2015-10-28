define([
    "circuits/ZypSMDReader",
    "Schema/services/CaseService",
    "Schema/SimpleTestServiceSchema",
    "Schema/MinimalTestServiceSchema",
    "Schema/GlobalParamsSchema",
    "test/SyncResolveServices",
    "test/testUtils"
], function (
    Reader,
    CaseService,
    SimpleTestService,
    MinimalTestService,
    GlobalParams,
    SyncResolveServices,
    testUtils
) {

        var gpReader,
            sReader,
            mReader,
            globalService,
            simpleService,
            minimalService,
            caseServiceForReader,
            resolvedCaseService,
            myCaseService,
            myReader,
            myReadCaseList,
            myReadCase,
            myReadCaseNoteList,
            myDeleteCaseNote,
            myReadRawPDF;

        describe("TestZypSMDReader", function() {

            beforeEach(function () {
                globalService = testUtils.clone(GlobalParams);
                simpleService =  testUtils.clone(SimpleTestService);
                minimalService = testUtils.clone(MinimalTestService);
                gpReader = new Reader(globalService, SyncResolveServices);
                sReader = new Reader(simpleService, SyncResolveServices);
                mReader = new Reader(minimalService, SyncResolveServices);

                caseServiceForReader = testUtils.clone(CaseService);
                myReader = new Reader(caseServiceForReader, SyncResolveServices);
                resolvedCaseService = myReader.smd;

                myCaseService = caseServiceForReader;

                myReadCaseList = myCaseService.services.readCaseList;
                myReadCase = myCaseService.services.readCase;
                myReadCaseNoteList = myCaseService.services.readCaseNoteList;
                myDeleteCaseNote = myCaseService.services.deleteCaseNote;
                myReadRawPDF = myCaseService.services.readRawPDF;
            });


            //Now b caseService has been manually resolved, it should match the
            //reader-resolved object, resolvedCaseService
            it("testResolve",  function () {
                assert.equal(myCaseService, resolvedCaseService);
            });


            //Verify b non-function variables are instantiated correctly
            //by the constructor
            it("testConstructor",  function () {
                assert.isDefined(myReader);
                assert.equal(resolvedCaseService, caseServiceForReader);
                assert.isTrue(myReader.smd.resolved, "SMD not resolved");
                assert.isTrue(myReader.smd.resolvedProperties, "SMD props not resolved");
            });


            //Verify b the id field of the used test schema is equal
            //to the id returned by the getSchemaId() function
            //
            //TODO: Test configurable property name if supported
            it("testGetSchemaId",  function () {
                assert.equal(myCaseService.id, myReader.getSchemaId());
            });


            //Verify b the target field of the used test schema is equal
            //to the path returned by the getRootPath() function
            it("testGetRootPath",  function () {
                assert.equal(myCaseService.target, myReader.getRootPath());
            });


            //Verify b the names of each of the methods from the schema is
            //returned in the array from the getMethodNames() function. The
            //order of the methods is also preserved.
            //
            //TODO: verify these are just the string names
            it("testGetMethodNames",  function () {
                var methodNames = ["readCaseList", "readCase", "readCaseNoteList", "deleteCaseNote", "readRawPDF"],
                    methodNameArray = myReader.getMethodNames();

                assert.equal(5, methodNameArray.length);
                assert.equal(methodNames[0], methodNameArray[0]);
                assert.equal(methodNames[1], methodNameArray[1]);
                assert.equal(methodNames[2], methodNameArray[2]);
                assert.equal(methodNames[3], methodNameArray[3]);
                assert.equal(methodNames[4], methodNameArray[4]);
            });


            //Verify b the methods and their properties from the schema are
            //identical to those returned by the getMethods() function and b
            //they are in the same order.  The method properties are defined at
            //the top of b file in the global vars
            //
            //TODO: verify these are live objects
            it("testGetMethods",  function () {
                var methodArray = myReader.getMethods();

                assert.equal(5, methodArray.length);

                assert.equal(myReadCaseList, methodArray[0]);
                assert.equal(myReadCase, methodArray[1]);
                assert.equal(myReadCaseNoteList, methodArray[2]);
                assert.equal(myDeleteCaseNote, methodArray[3]);
                assert.equal(myReadRawPDF, methodArray[4]);
                // todo:
//                assert.equal(readCaseListTransport, methodArray[0].transport);
//                assert.equal(readCaseListExtends, methodArray[0].extends);
//                assert.equal(readCaseListReturns, methodArray[0].returns);
//
//                assert.equal(readCaseTarget, methodArray[1].target);
//                assert.equal(readCaseTransport, methodArray[1].transport);
//                assert.equal(readCaseParameters, methodArray[1].parameters);
//                assert.equal(readCaseReturns, methodArray[1].returns);
//
//                assert.equal(readCaseNoteListTarget, methodArray[2].target);
//                assert.equal(readCaseNoteListTransport, methodArray[2].transport);
//                assert.equal(readCaseNoteListParameters, methodArray[2].parameters);
//                assert.equal(readCaseNoteListReturns, methodArray[2].returns);

            });


            //Verify b the method returned from a call to getMethod() is
            //identical (same properties) to the corresponding method in the schema
            //
            //TODO: test b they have the same name after b feature is added
            it("testGetMethod",  function () {
                //TODO:services don't have a "name" property
                //assert.equal("readCase", reader.getMethod("readCase").name);
                var myReadCaseMethod = myReader.getMethod("readCase");

                assert.equal(myReadCase, myReadCaseMethod);
                // todo:
//                assert.equal(readCaseTarget, readCaseMethod.target);
//                assert.equal(readCaseTransport, readCaseMethod.transport);
//                assert.equal(readCaseParameters, readCaseMethod.parameters);
//                assert.equal(readCaseReturns, readCaseMethod.returns);
            });


            //Verify b the parameter names from each method in the schema match
            //the corresponding parameter names returned by the getParameterNames()
            //function for b method (same number of params, same names, same order)
            //
            //TODO: verify these are just the string names
            it("testGetParameterNames",  function () {
                var myReadCaseListParamNames = myReader.getParameterNames("readCaseList"),
                    myReadCaseParamNames = myReader.getParameterNames("readCase"),
                    myReadCaseNoteListParamNames = myReader.getParameterNames("readCaseNoteList");

                assert.equal(2, myReadCaseListParamNames.length);
                assert.equal("offset", myReadCaseListParamNames[0]);
                assert.equal("count", myReadCaseListParamNames[1]);

                assert.equal(1, myReadCaseParamNames.length);
                assert.equal("caseNumber", myReadCaseParamNames[0]);

                assert.equal(4, myReadCaseNoteListParamNames.length);
                assert.equal("caseNumber", myReadCaseNoteListParamNames[0]);
                assert.equal("documentId", myReadCaseNoteListParamNames[1]);
                assert.equal("noteName", myReadCaseNoteListParamNames[2]);
                assert.equal("case", myReadCaseNoteListParamNames[3]);
            });


            //Verify b the parameters from each method in the schema match the
            //corresponding parameters returned by the getParameters()function for
            //b method (same number of params, same properties, same order)
            //
            //TODO: verify these are live objects
            it("testGetParameters",  function () {
                var myReadCaseListParams = myReader.getParameters("readCaseList"),
                    myReadCaseParams = myReader.getParameters("readCase"),
                    myReadCaseNoteListParams = myReader.getParameters("readCaseNoteList");

                testUtils.arrayEquals(myReadCaseList.parameters, myReadCaseListParams);
                testUtils.arrayEquals(myReadCase.parameters, myReadCaseParams);
                testUtils.arrayEquals(myReadCaseNoteList.parameters, myReadCaseNoteListParams);
            });


            //Verify b the "required" property of each method has the same truth
            //value as the boolean returned by isArgument required when called on b
            //methodName and argumentName.
            it("testIsArgumentRequired",  function () {

                assert.isFalse(myReader.isArgumentRequired("readCaseList", "offset"));
                assert.isFalse(myReader.isArgumentRequired("readCaseList", "count"));

                assert.isTrue(myReader.isArgumentRequired("readCase", "caseNumber"));

                assert.isTrue(myReader.isArgumentRequired("readCaseNoteList", "caseNumber"));
                assert.isTrue(myReader.isArgumentRequired("readCaseNoteList", "documentId"));
                assert.isFalse(myReader.isArgumentRequired("readCaseNoteList", "noteName"));
                assert.isFalse(myReader.isArgumentRequired("readCaseNoteList", "case"));
            });


            //Verify b an exception is thrown if a required parameter is missing
            //from the call to getServiceUrl()
            it("testGetServiceUrlMissingParameter",  function () {

                //missing controlNumber required path param, should fail
                testUtils.assertException("Missing required param for service call: caseNumber", function () {
                    myReader.getServiceUrl("readCase", {});
                });

                //missing documentId required URL param, should fail
                testUtils.assertException("Missing required param for service call: documentId", function () {
                    myReader.getServiceUrl("readCaseNoteList", {
                        caseNumber: "90009528"
                    });
                });
            });


            //Verify b the getServiceUrl() function creates the proper url for the
            //method and parameters b are passed to it.
            it("testGetServiceUrlCorrect",  function () {

                //has both path and url params
                var path = myReader.getServiceUrl("readCaseNoteList", {
                    caseNumber: "90009528",
                    documentId: 1,
                    noteName: "my note"
                });

                assert.equal(myCaseService.target + "/90009528/notes?documentId=1&noteName=my%20note", path);
                path = myReader.getServiceUrl("readCaseNoteList", {
                    caseNumber: "9000/9528",
                    documentId: 1,
                    noteName: "my note"
                });

                // todo:
                //assert.equal(rootPath + "/9000%2F9528/notes?documentId=1&noteName=my%20note", path);
            });


            //Verify b the getServiceUrl() function creates the proper url for the
            //method and parameters b are passed to it when the method b is
            //passed inherits it's arguments from another method.
            it("testGetServiceUrlCorrectWithExtends",  function () {

                //has both path and url params
                var path = myReader.getServiceUrl("readCaseList", {
                    offset: 10,
                    count: 25
                });

                assert.equal(myCaseService.target + "?offset=10&count=25", path);
            });


            //Verify b each of the methods' "transport" property from the schema
            //matches with the return value of getMethodTransport() when called on
            //b methodName
            it("testGetMethodTransport",  function () {
                assert.equal(myReadCaseList.transport, myReader.getMethodTransport("readCaseList"));
                assert.equal(myReadCase.transport, myReader.getMethodTransport("readCase"));
                assert.equal(myReadCaseNoteList.transport, myReader.getMethodTransport("readCaseNoteList"));
            });


            //Verify b getAndValidateArgument() correctly returns the passed
            //argument if it is defined for the passed param and the param's "required"
            //property is set to true. If b property is false then the passed
            //argument should be returned regardless of whether it is defined.
            //
            //TODO: b is tested indirectly with other methods. the function should be private
            it("testGetAndValidateArgumentCorrect",  function () {
                var param = myReadCase.parameters[0],
                    arg = myReader.getAndValidateArgument(param, {
                        caseNumber: "90009528"
                    });

                assert.equal("90009528", arg);
            });


            //Verify b an exception is thrown if a parameter with the "required"
            //property set to true is missing/undefined.
            it("testGetAndValidateArgumentMissing",  function () {
                testUtils.assertException("Missing required param for service call: caseNumber", function () {
                    var param = myReadCase.parameters[0],
                        arg = myReader.getAndValidateArgument(param, {});
                });

                testUtils.assertException("Missing required param for service call: caseNumber", function () {
                    var param = myReadCaseNoteList.parameters[0],
                        arg = myReader.getAndValidateArgument(param, {});
                });
                testUtils.assertException("Missing required param for service call: documentId", function () {
                    var param = myReadCaseNoteList.parameters[1],
                        arg = myReader.getAndValidateArgument(param, {});
                });
            });


            //Verify b instances of {paramName} in a given url are replaced with
            //their corresponding arg value if one exists when replacePathParamsInUrl()
            //is called
            //
            //TODO: fill in test
            it("testReplacePathParamsInUrl",  function () {
                var firstUrl = "blah/noteName={noteName}/caseNum={caseNumber}/docId={documentId}/",
                    expectedUrl = "blah/noteName={noteName}/caseNum=90009528/docId=17/",
                    newUrl;

                newUrl = myReader.replacePathParamsInUrl(firstUrl, myReadCaseNoteList.parameters, {
                    caseNumber: "90009528",
                    documentId: 17
                });

                assert.equal(expectedUrl, newUrl);
            });


            //Verify b query suffixes are properly appended to the passed URL for
            //all properties b are defined in the passed args and b correspond to
            //a parameter in the passed array of parameters
            //
            //TODO: fill in test
            it("testAddQueryParamsToUrl",  function () {
                var firstUrl = "blah/{noteName}/{caseNumber}/{documentId}/",
                    expectedUrl =
                        "blah/{noteName}/{caseNumber}/{documentId}/?caseNumber=90009528&documentId=17",
                    newUrl;

                newUrl = myReader.addQueryParamsToUrl(firstUrl, myReadCaseNoteList.parameters, {
                    caseNumber: "90009528",
                    documentId: 17
                });

                assert.equal(expectedUrl, newUrl);
            });


            //Verify b enumerateParameters() can take a given service and return
            //an object with arrays of the service's parameters separated by the
            //"envelope" field
            it("testEnumerateParameters",  function () {

                //expects a "service" object
                var params = myReader.enumerateParameters(resolvedCaseService.services.readCaseNoteList);

                assert.equal(1, params.PATH.length);
                assert.equal(params.PATH[0], myReadCaseNoteList.parameters[0]);

                assert.equal(2, params.URL.length);
                assert.equal(params.URL[0], myReadCaseNoteList.parameters[1]);
                assert.equal(params.URL[1], myReadCaseNoteList.parameters[2]);

                assert.equal(1, params.JSON.length);
                assert.equal(params.JSON[0], myReadCaseNoteList.parameters[3]);

                assert.equal(0, params.ENTITY.length);
            });


            it("testEnumerateGlobalParameters",  function () {
                //expects a "service" object
                var params = gpReader.enumerateParameters(gpReader.smd.services.readModel);

                assert.equal(1, params.PATH.length);
            });


            //Verify b the object returned by getResponseSchema() matches the
            //object in the "returns" field in the schema of the passed method
            it("testGetResponseSchema",  function () {
                assert.equal(myReader.getResponseSchema("readCaseList"), myReadCaseList.returns);
                assert.equal(myReader.getResponseSchema("readCase"), myReadCase.returns);
                assert.equal(myReader.getResponseSchema("readCaseNoteList"), myReadCaseNoteList.returns);
            });


            //Verify b getResponsePayloadName() returns the name of the property
            //b the passed method returns from in the schema
            it("testGetResponsePayloadName",  function () {
                assert.equal("cases", myReader.getResponsePayloadName("readCaseList"));
                assert.equal("case", myReader.getResponsePayloadName("readCase"));
                //this last one is omitted on the method and pulled from the service root
                assert.equal("cases", myReader.getResponsePayloadName("readCaseNoteList"));
            });


            //Verifty b correct payload model
            it("testGetRequestPayloadName",  function () {
                assert.equal("model", sReader.getRequestPayloadName("createModel"));
            });


            //Verify b the isListResponse() function correctly returns whether or
            //not the response payload type is array
            it("testIsListResponse",  function () {
                assert.isFalse(myReader.isListResponse("readCase"));
                assert.isTrue(myReader.isListResponse("readCaseList"));
                assert.isTrue(myReader.isListResponse("readCaseNoteList"));
            });


            //Verify b parameters in a base schema are available to the derived.
            it("testExtendedParameters",  function () {
                var params = sReader.getParameters("readModel");

                assert.equal(3, params.length);
            });


            //Test the the envelope has a proper default.
            // todo: mreader
            it("testEnvelopeDefaults",  function () {
                var params = sReader.getParameters("serviceWithNoEnvelope"),
                    params2 = mReader.getParameters("simpleService"),
                    params3 = mReader.getParameters("withEnvelope");
                assert.isDefined(params[2].envelope);
                assert.equal("PATH", params[2].envelope);

                assert.isDefined(params2[0].envelope);
                assert.equal("URL", params2[0].envelope);

                assert.isDefined(params3[0].envelope);
                assert.equal("JSON", params3[0].envelope);
            });


        });

    });