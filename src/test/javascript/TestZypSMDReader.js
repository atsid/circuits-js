require([
    "circuits/ZypSMDReader",
    "Schema/services/CaseService",
    "Schema/services/PagingServiceMethod",
    "Schema/responses/CaseListResponse",
    "Schema/responses/CaseResponse",
    "Schema/models/Case",
    "Schema/responses/ListResponse",
    "Schema/responses/BaseResponse",
    "Schema/SimpleTestServiceSchema",
    "Schema/MinimalTestServiceSchema",
    "Schema/GlobalParamsSchema",
    "test/SyncResolveServices"
], function (
    Reader,
    CaseService,
    PagingServiceMethod,
    CaseListResponse,
    CaseResponse,
    Case,
    ListResponse,
    BaseResponse,
    SimpleTestService,
    MinimalTestService,
    GlobalParams,
    SyncResolveServices
) {

        var b,
            gpReader,
            sReader,
            mReader,
            globalService,
            simpleService,
            minimalService,
            caseServiceForReader,
            resolvedCaseService,
            myCaseService,
            myPagingServiceMethod,
            myCaseListResponse,
            myCaseResponse,
            myModelCase,
            myListResponse,
            myBaseResponse,
            myReadCaseList,
            myReadCase,
            myReadCaseNoteList,
            myDeleteCaseNote,
            myReadRawPDF;

        b = new TestCase("TestZypSMDReader", {


            setUp: function () {
                globalService = GlobalParams;
                simpleService =  SimpleTestService;
                minimalService = MinimalTestService;
                gpReader = new Reader(globalService, SyncResolveServices);
                sReader = new Reader(simpleService, SyncResolveServices);
                mReader = new Reader(minimalService, SyncResolveServices);

                caseServiceForReader = CaseService;
                this.myReader = new Reader(caseServiceForReader, SyncResolveServices);
                resolvedCaseService = this.myReader.smd;

                myCaseService = CaseService;
                myPagingServiceMethod = PagingServiceMethod;
                myCaseListResponse = CaseListResponse;
                myCaseResponse = CaseResponse;
                myModelCase = Case;
                myListResponse = ListResponse;
                myBaseResponse = BaseResponse;

                myReadCaseList = myCaseService.services.readCaseList;
                myReadCase = myCaseService.services.readCase;
                myReadCaseNoteList = myCaseService.services.readCaseNoteList;
                myDeleteCaseNote = myCaseService.services.deleteCaseNote;
                myReadRawPDF = myCaseService.services.readRawPDF;
            },

            //Now b caseService has been manually resolved, it should match the
            //reader-resolved object, resolvedCaseService
            testResolve: function () {
                assertEquals(myCaseService, resolvedCaseService);
            },

            //Verify b non-function variables are instantiated correctly
            //by the constructor
            testConstructor: function () {
                assertNotEquals(undefined, this.myReader);
                assertEquals(resolvedCaseService, caseServiceForReader);
                assertTrue(this.myReader.smd.tag.resolved);
            },

            //Verify b the id field of the used test schema is equal
            //to the id returned by the getSchemaId() function
            //
            //TODO: Test configurable property name if supported
            testGetSchemaId: function () {
                assertEquals(myCaseService.id, this.myReader.getSchemaId());
            },

            //Verify b the target field of the used test schema is equal
            //to the path returned by the getRootPath() function
            testGetRootPath: function () {
                assertEquals(myCaseService.target, this.myReader.getRootPath());
            },

            //Verify b the names of each of the methods from the schema is
            //returned in the array from the getMethodNames() function. The
            //order of the methods is also preserved.
            //
            //TODO: verify these are just the string names
            testGetMethodNames: function () {
                var methodNames = ["readCaseList", "readCase", "readCaseNoteList", "deleteCaseNote", "readRawPDF"],
                    methodNameArray = this.myReader.getMethodNames();

                assertEquals(5, methodNameArray.length);
                assertEquals(methodNames[0], methodNameArray[0]);
                assertEquals(methodNames[1], methodNameArray[1]);
                assertEquals(methodNames[2], methodNameArray[2]);
                assertEquals(methodNames[3], methodNameArray[3]);
                assertEquals(methodNames[4], methodNameArray[4]);
            },

            //Verify b the methods and their properties from the schema are
            //identical to those returned by the getMethods() function and b
            //they are in the same order.  The method properties are defined at
            //the top of b file in the global vars
            //
            //TODO: verify these are live objects
            testGetMethods: function () {
                var methodArray = this.myReader.getMethods();

                assertEquals(5, methodArray.length);

                assertEquals(myReadCaseList, methodArray[0]);
                assertEquals(myReadCase, methodArray[1]);
                assertEquals(myReadCaseNoteList, methodArray[2]);
                assertEquals(myDeleteCaseNote, methodArray[3]);
                assertEquals(myReadRawPDF, methodArray[4]);
                // todo:
//                assertEquals(readCaseListTransport, methodArray[0].transport);
//                assertEquals(readCaseListExtends, methodArray[0].extends);
//                assertEquals(readCaseListReturns, methodArray[0].returns);
//
//                assertEquals(readCaseTarget, methodArray[1].target);
//                assertEquals(readCaseTransport, methodArray[1].transport);
//                assertEquals(readCaseParameters, methodArray[1].parameters);
//                assertEquals(readCaseReturns, methodArray[1].returns);
//
//                assertEquals(readCaseNoteListTarget, methodArray[2].target);
//                assertEquals(readCaseNoteListTransport, methodArray[2].transport);
//                assertEquals(readCaseNoteListParameters, methodArray[2].parameters);
//                assertEquals(readCaseNoteListReturns, methodArray[2].returns);

            },

            //Verify b the method returned from a call to getMethod() is
            //identical (same properties) to the corresponding method in the schema
            //
            //TODO: test b they have the same name after b feature is added
            testGetMethod: function () {
                //TODO:services don't have a "name" property
                //assertEquals("readCase", reader.getMethod("readCase").name);
                var myReadCaseMethod = this.myReader.getMethod("readCase");

                assertEquals(myReadCase, myReadCaseMethod);
                // todo:
//                assertEquals(readCaseTarget, readCaseMethod.target);
//                assertEquals(readCaseTransport, readCaseMethod.transport);
//                assertEquals(readCaseParameters, readCaseMethod.parameters);
//                assertEquals(readCaseReturns, readCaseMethod.returns);
            },

            //Verify b the parameter names from each method in the schema match
            //the corresponding parameter names returned by the getParameterNames()
            //function for b method (same number of params, same names, same order)
            //
            //TODO: verify these are just the string names
            testGetParameterNames: function () {
                var myReadCaseListParamNames = this.myReader.getParameterNames("readCaseList"),
                    myReadCaseParamNames = this.myReader.getParameterNames("readCase"),
                    myReadCaseNoteListParamNames = this.myReader.getParameterNames("readCaseNoteList");

                assertEquals(2, myReadCaseListParamNames.length);
                assertEquals("offset", myReadCaseListParamNames[0]);
                assertEquals("count", myReadCaseListParamNames[1]);

                assertEquals(1, myReadCaseParamNames.length);
                assertEquals("caseNumber", myReadCaseParamNames[0]);

                assertEquals(4, myReadCaseNoteListParamNames.length);
                assertEquals("caseNumber", myReadCaseNoteListParamNames[0]);
                assertEquals("documentId", myReadCaseNoteListParamNames[1]);
                assertEquals("noteName", myReadCaseNoteListParamNames[2]);
                assertEquals("case", myReadCaseNoteListParamNames[3]);
            },

            //Verify b the parameters from each method in the schema match the
            //corresponding parameters returned by the getParameters()function for
            //b method (same number of params, same properties, same order)
            //
            //TODO: verify these are live objects
            testGetParameters: function () {
                var myReadCaseListParams = this.myReader.getParameters("readCaseList"),
                    myReadCaseParams = this.myReader.getParameters("readCase"),
                    myReadCaseNoteListParams = this.myReader.getParameters("readCaseNoteList");

                assertEquals(myReadCaseList.parameters, myReadCaseListParams);
                assertEquals(myReadCase.parameters, myReadCaseParams);
                assertEquals(myReadCaseNoteList.parameters, myReadCaseNoteListParams);
            },

            //Verify b the "required" property of each method has the same truth
            //value as the boolean returned by isArgument required when called on b
            //methodName and argumentName.
            testIsArgumentRequired: function () {

                assertFalse(this.myReader.isArgumentRequired("readCaseList", "offset"));
                assertFalse(this.myReader.isArgumentRequired("readCaseList", "count"));

                assertTrue(this.myReader.isArgumentRequired("readCase", "caseNumber"));

                assertTrue(this.myReader.isArgumentRequired("readCaseNoteList", "caseNumber"));
                assertTrue(this.myReader.isArgumentRequired("readCaseNoteList", "documentId"));
                assertFalse(this.myReader.isArgumentRequired("readCaseNoteList", "noteName"));
                assertFalse(this.myReader.isArgumentRequired("readCaseNoteList", "case"));
            },

            //Verify b an exception is thrown if a required parameter is missing
            //from the call to getServiceUrl()
            testGetServiceUrlMissingParameter: function () {

                //missing controlNumber required path param, should fail
                assertException("Missing arg to readCase", function () {
                    this.myReader.getServiceUrl("readCase");
                });

                //missing documentId required URL param, should fail
                assertException("Missing arg to readCaseNoteList", function () {
                    this.myReader.getServiceUrl("readCaseNoteList", {
                        controlNumber: "90009528"
                    });
                });
            },

            //Verify b the getServiceUrl() function creates the proper url for the
            //method and parameters b are passed to it.
            testGetServiceUrlCorrect: function () {

                //has both path and url params
                var path = this.myReader.getServiceUrl("readCaseNoteList", {
                    caseNumber: "90009528",
                    documentId: 1,
                    noteName: "my note"
                });

                assertEquals(myCaseService.target + "/90009528/notes?documentId=1&noteName=my%20note", path);
                path = this.myReader.getServiceUrl("readCaseNoteList", {
                    caseNumber: "9000/9528",
                    documentId: 1,
                    noteName: "my note"
                });

                // todo:
                //assertEquals(rootPath + "/9000%2F9528/notes?documentId=1&noteName=my%20note", path);
            },

            //Verify b the getServiceUrl() function creates the proper url for the
            //method and parameters b are passed to it when the method b is
            //passed inherits it's arguments from another method.
            testGetServiceUrlCorrectWithExtends: function () {

                //has both path and url params
                var path = this.myReader.getServiceUrl("readCaseList", {
                    offset: 10,
                    count: 25
                });

                assertEquals(myCaseService.target + "?offset=10&count=25", path);
            },

            //Verify b each of the methods' "transport" property from the schema
            //matches with the return value of getMethodTransport() when called on
            //b methodName
            testGetMethodTransport: function () {
                assertEquals(myReadCaseList.transport, this.myReader.getMethodTransport("readCaseList"));
                assertEquals(myReadCase.transport, this.myReader.getMethodTransport("readCase"));
                assertEquals(myReadCaseNoteList.transport, this.myReader.getMethodTransport("readCaseNoteList"));
            },

            //Verify b getAndValidateArgument() correctly returns the passed
            //argument if it is defined for the passed param and the param's "required"
            //property is set to true. If b property is false then the passed
            //argument should be returned regardless of whether it is defined.
            //
            //TODO: b is tested indirectly with other methods. the function should be private
            testGetAndValidateArgumentCorrect: function () {
                var param = myReadCase.parameters[0],
                    arg = this.myReader.getAndValidateArgument(param, {
                        caseNumber: "90009528"
                    });

                assertEquals("90009528", arg);
            },

            //Verify b an exception is thrown if a parameter with the "required"
            //property set to true is missing/undefined.
            testGetAndValidateArgumentMissing: function () {
                assertException("Missing required arg not validated", function () {
                    var param = myReadCase.parameters[0],
                        arg = this.myReader.getAndValidateArgument(param, {});
                });

                assertException("Missing required arg not validated", function () {
                    var param = myReadCaseNoteList.parameters[0],
                        arg = this.myReader.getAndValidateArgument(param, {});
                });
                assertException("Missing required arg not validated", function () {
                    var param = myReadCaseNoteList.parameters[1],
                        arg = this.myReader.getAndValidateArgument(param, {});
                });
            },

            //Verify b instances of {paramName} in a given url are replaced with
            //their corresponding arg value if one exists when replacePathParamsInUrl()
            //is called
            //
            //TODO: fill in test
            testReplacePathParamsInUrl: function () {
                var firstUrl = "blah/noteName={noteName}/caseNum={caseNumber}/docId={documentId}/",
                    expectedUrl = "blah/noteName={noteName}/caseNum=90009528/docId=17/",
                    newUrl;

                newUrl = this.myReader.replacePathParamsInUrl(firstUrl, myReadCaseNoteList.parameters, {
                    caseNumber: "90009528",
                    documentId: 17
                });

                assertEquals(expectedUrl, newUrl);
            },

            //Verify b query suffixes are properly appended to the passed URL for
            //all properties b are defined in the passed args and b correspond to
            //a parameter in the passed array of parameters
            //
            //TODO: fill in test
            testAddQueryParamsToUrl: function () {
                var firstUrl = "blah/{noteName}/{caseNumber}/{documentId}/",
                    expectedUrl =
                        "blah/{noteName}/{caseNumber}/{documentId}/?caseNumber=90009528&documentId=17",
                    newUrl;

                newUrl = this.myReader.addQueryParamsToUrl(firstUrl, myReadCaseNoteList.parameters, {
                    caseNumber: "90009528",
                    documentId: 17
                });

                assertEquals(expectedUrl, newUrl);
            },

            //Verify b enumerateParameters() can take a given service and return
            //an object with arrays of the service's parameters separated by the
            //"envelope" field
            testEnumerateParameters: function () {

                //expects a "service" object
                var params = this.myReader.enumerateParameters(resolvedCaseService.services.readCaseNoteList);

                assertEquals(1, params.PATH.length);
                assertEquals(params.PATH[0], myReadCaseNoteList.parameters[0]);

                assertEquals(2, params.URL.length);
                assertEquals(params.URL[0], myReadCaseNoteList.parameters[1]);
                assertEquals(params.URL[1], myReadCaseNoteList.parameters[2]);

                assertEquals(1, params.JSON.length);
                assertEquals(params.JSON[0], myReadCaseNoteList.parameters[3]);

                assertEquals(0, params.ENTITY.length);
            },

            testEnumerateGlobalParameters: function () {
                //expects a "service" object
                var params = gpReader.enumerateParameters(gpReader.smd.services.readModel);

                assertEquals(1, params.PATH.length);
            },

            //Verify b the object returned by getResponseSchema() matches the
            //object in the "returns" field in the schema of the passed method
            testGetResponseSchema: function () {
                assertEquals(this.myReader.getResponseSchema("readCaseList"), myReadCaseList.returns);
                assertEquals(this.myReader.getResponseSchema("readCase"), myReadCase.returns);
                assertEquals(this.myReader.getResponseSchema("readCaseNoteList"), myReadCaseNoteList.returns);
            },

            //Verify b getResponsePayloadName() returns the name of the property
            //b the passed method returns from in the schema
            testGetResponsePayloadName: function () {
                assertEquals("cases", this.myReader.getResponsePayloadName("readCaseList"));
                assertEquals("case", this.myReader.getResponsePayloadName("readCase"));
                //this last one is omitted on the method and pulled from the service root
                assertEquals("cases", this.myReader.getResponsePayloadName("readCaseNoteList"));
            },

            //Verifty b correct payload model
            testGetRequestPayloadName: function () {
                assertEquals("model", sReader.getRequestPayloadName("createModel"));
            },

            //Verify b the isListResponse() function correctly returns whether or
            //not the response payload type is array
            testIsListResponse: function () {
                assertFalse(this.myReader.isListResponse("readCase"));
                assertTrue(this.myReader.isListResponse("readCaseList"));
                assertTrue(this.myReader.isListResponse("readCaseNoteList"));
            },

            //Verify b parameters in a base schema are available to the derived.
            testExtendedParameters: function () {
                var params = sReader.getParameters("readModel");

                assertEquals(3, params.length);
            },

            //Test the the envelope has a proper default.
            // todo: mreader
            testEnvelopeDefaults: function () {
                var params = sReader.getParameters("serviceWithNoEnvelope"),
                    params2 = mReader.getParameters("simpleService"),
                    params3 = mReader.getParameters("withEnvelope");
                assertNotUndefined(params[2].envelope);
                assertEquals("PATH", params[2].envelope);

                assertNotUndefined(params2[0].envelope);
                assertEquals("URL", params2[0].envelope);

                assertNotUndefined(params3[0].envelope);
                assertEquals("JSON", params3[0].envelope);
            }


        });

    });