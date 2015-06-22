define(["circuits/ZypSMDReader",
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
        ], function(
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
                SyncResolveServices){
    
    "use strict";
    
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
    
    
   //Set up
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
    
    describe("Test the Zyp SMD reader's functions", function () {
        
        ///////////////////////////////////////////////////////////////////////////////////
        it("Verify if the case service matches yhe reader-resolved object", function () {
            assertEquals(myCaseService, resolvedCaseService);
        });   
        ///////////////////////////////////////////////////////////////////////////////////        
        it("Verify non-function variables are instantiated correctly by the constructor", function () {
            assertNotEquals(undefined, this.myReader);
            assertEquals(resolvedCaseService, caseServiceForReader);
            assertTrue(this.myReader.smd.resolved);
            assertTrue(this.myReader.smd.resolvedProperties);
        });
        ///////////////////////////////////////////////////////////////////////////////////
        it("Verify if the id field of the used test schema is equal to the id returned by the getSchemaId() function", function () {
            assertEquals(myCaseService.id, this.myReader.getSchemaId()); 
        });
        ///////////////////////////////////////////////////////////////////////////////////
        it("Verify if the target field of the used test schema is equal to the path returned by the getRootPath() function", function () {
            assertEquals(myCaseService.target, this.myReader.getRootPath());
        });
        //////////////////////////////////////////////////////////////////////////////////
        it("Verify if the names of each of the methods from the schema is returned in the array from the getMethodNames() function. The order of the methods is also preserved.", function () {
            var methodNames = ["readCaseList", "readCase", "readCaseNoteList", "deleteCaseNote", "readRawPDF"],
            methodNameArray = this.myReader.getMethodNames();
            
            assertEquals(5, methodNameArray.length);
            assertEquals(methodNames[0], methodNameArray[0]);
            assertEquals(methodNames[1], methodNameArray[1]);
            assertEquals(methodNames[2], methodNameArray[2]);
            assertEquals(methodNames[3], methodNameArray[3]);
            assertEquals(methodNames[4], methodNameArray[4]);
        
    
            
        });
        ////////////////////////////////////////////////////////////////////////////////
        
        it("Verify if the methods and their properties from the schema are identical to those returned by the getMethods() function and if they are in the same order.", function () {
            var methodArray = this.myReader.getMethods();
            //The method properties are defined at the top of b file in the global vars
               
            assertEquals(5, methodArray.length);
            assertEquals(myReadCaseList, methodArray[0]);
            assertEquals(myReadCase, methodArray[1]);
            assertEquals(myReadCaseNoteList, methodArray[2]);
            assertEquals(myDeleteCaseNote, methodArray[3]);
            assertEquals(myReadRawPDF, methodArray[4]);
     
            
            
        });
        //////////////////////////////////////////////////////////////////////////////
        it("Verify if the method returned from a call to getMethod() is identical (same properties) to the corresponding method in the schema", function () {
            var myReadCaseMethod = this.myReader.getMethod("readCase");
    
            assertEquals(myReadCase, myReadCaseMethod);
        });
        //////////////////////////////////////////////////////////////////////////////
        it("Verify if the parameter names from each method in the schema match the corresponding parameter names returned by the getParameterNames() function, in the same order, with the same promerties", function () {
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
          
            
        });
        ///////////////////////////////////////////////////////////////////////////////////
        dit("Verify if the parameters from each method in the schema match the corresponding parameters returned by the getParameters() function, in the same order, with the same properties", function (){
            var myReadCaseListParams = this.myReader.getParameters("readCaseList"),
            myReadCaseParams = this.myReader.getParameters("readCase"),
            myReadCaseNoteListParams = this.myReader.getParameters("readCaseNoteList");
    
            
            assertEquals(myReadCaseList.parameters, myReadCaseListParams);
            assertEquals(myReadCase.parameters, myReadCaseParams);
            assertEquals(myReadCaseNoteList.parameters, myReadCaseNoteListParams);
       
            
        });
        ////////////////////////////////////////////////////////////////////////////////////
        
        it("Verify if the \"required\" property of each method has the same truth value as the boolean returned by isArgument required when called", function () {
            assertFalse(this.myReader.isArgumentRequired("readCaseList", "offset"));
            assertFalse(this.myReader.isArgumentRequired("readCaseList", "count"));
    
            assertTrue(this.myReader.isArgumentRequired("readCase", "caseNumber"));
    
            assertTrue(this.myReader.isArgumentRequired("readCaseNoteList", "caseNumber"));
            assertTrue(this.myReader.isArgumentRequired("readCaseNoteList", "documentId"));
            assertFalse(this.myReader.isArgumentRequired("readCaseNoteList", "noteName"));
            assertFalse(this.myReader.isArgumentRequired("readCaseNoteList", "case"));
            
        });
        ////////////////////////////////////////////////////////////////////////////////////////
        
        describe("\"getServiceUrlMissingParameter\" function", function () {
            it("missing controlNumber required path param, should fail", function () {
                assertException("Missing arg to readCase", function () {
                    this.myReader.getServiceUrl("readCase");
                });
            });
            
            it("missing documentId required URL param, should fail", function () {
                assertException("Missing arg to readCaseNoteList", function () {
                    this.myReader.getServiceUrl("readCaseNoteList", {
                        controlNumber: "90009528"
                    });
                });
            });
            
        });
        ///////////////////////////////////////////////////////////////////////////////////////
        it("Verify if the getServiceUrl() function creates the proper url for the method and parameters passed to it.", function () {
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
            
            
        });
        ////////////////////////////////////////////////////////////////////////////////////////
        it("Verify if the getServiceUrl() function creates the proper url for the method and parameters passed to it when the method passed inherits it's arguments from another method.", function () {
          //has both path and url params
            var path = this.myReader.getServiceUrl("readCaseList", {
                offset: 10,
                count: 25
            });
            
            
            assertEquals(myCaseService.target + "?offset=10&count=25", path);
            
    
            
        });
        ///////////////////////////////////////////////////////////////////////////////////////////
        it("Verify if each of the methods' \"transport\" property from the schema matches with the return value of getMethodTransport() when called", function () {
            assertEquals(myReadCaseList.transport, this.myReader.getMethodTransport("readCaseList"));
            assertEquals(myReadCase.transport, this.myReader.getMethodTransport("readCase"));
            assertEquals(myReadCaseNoteList.transport, this.myReader.getMethodTransport("readCaseNoteList"));
        });
        ////////////////////////////////////////////////////////////////////////////////////////////////
        
        it("Verify b getAndValidateArgument() correctly returns the passed argument", function () {
            var param = myReadCase.parameters[0],
            arg = this.myReader.getAndValidateArgument(param, {
                caseNumber: "90009528"
            });
    

            assertEquals("90009528", arg); 
           
        });
        /////////////////////////////////////////////////////////////////////////////////////////////
        it("Verify if an exception is thrown if a parameter with the \"required\" property set to true is missing/undefined.", function () {
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
        });
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        it("Verify if instances of {paramName} in a given url are replaced with their corresponding arg value if one exists when replacePathParamsInUrl() is called", function () {
            var firstUrl = "blah/noteName={noteName}/caseNum={caseNumber}/docId={documentId}/",
            expectedUrl = "blah/noteName={noteName}/caseNum=90009528/docId=17/",
            newUrl;
    
            newUrl = this.myReader.replacePathParamsInUrl(firstUrl, myReadCaseNoteList.parameters, {
                caseNumber: "90009528",
                documentId: 17
            });
    
            
            assertEquals(expectedUrl, newUrl);    
            
            
        });
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        it("Verify if query suffixes are properly appended to the passed URL for all properties defined in the passed args and if it corresponds to a parameter in the passed array of parameters", function () {
            var firstUrl = "blah/{noteName}/{caseNumber}/{documentId}/",
            expectedUrl =
                "blah/{noteName}/{caseNumber}/{documentId}/?caseNumber=90009528&documentId=17",
            newUrl;
    
            newUrl = this.myReader.addQueryParamsToUrl(firstUrl, myReadCaseNoteList.parameters, {
                caseNumber: "90009528",
                documentId: 17
            });
        
            
            assertEquals(expectedUrl, newUrl);
           
            
        });
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        it("Verify if enumerateParameters() can take a given service and return an object with arrays of the service's parameters separated by the \"envelope\" field", function () {
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
            
            
        });
        
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        it("expects a \"service\" object", function () {
            var params = gpReader.enumerateParameters(gpReader.smd.services.readModel);
    
            
            assertEquals(1, params.PATH.length);    
            
            
        });
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        it("Verify if the object returned by getResponseSchema() matches the object in the \"returns\" field in the schema of the passed method", function () {
            assertEquals(this.myReader.getResponseSchema("readCaseList"), myReadCaseList.returns);
            assertEquals(this.myReader.getResponseSchema("readCase"), myReadCase.returns);
            assertEquals(this.myReader.getResponseSchema("readCaseNoteList"), myReadCaseNoteList.returns);
        });
        
        it("Test the Zyp SMD reader's \"getResponsePayloadName\" function", function () {
            assertEquals("cases", this.myReader.getResponsePayloadName("readCaseList"));
            assertEquals("case", this.myReader.getResponsePayloadName("readCase"));
            //this last one is omitted on the method and pulled from the service root
            assertEquals("cases", this.myReader.getResponsePayloadName("readCaseNoteList"));
        });
        
        it("Verifty the correct payload model", function () {
            assertEquals("model", sReader.getRequestPayloadName("createModel"));
        });
        
        it("Verify if the isListResponse() function correctly returns whether or not the response payload type is array", function () {
            assertFalse(this.myReader.isListResponse("readCase"));
            assertTrue(this.myReader.isListResponse("readCaseList"));
            assertTrue(this.myReader.isListResponse("readCaseNoteList"));
        });
        
        it("Verify if parameters in a base schema are available to the derived.", function () {
            var params = sReader.getParameters("readModel");
    
            assertEquals(3, params.length);
        });
        
        it("Test the the envelope has a proper default.", function () {
            var params = sReader.getParameters("serviceWithNoEnvelope"),
            params2 = mReader.getParameters("simpleService"),
            params3 = mReader.getParameters("withEnvelope");
            assertNotUndefined(params[2].envelope);
            assertEquals("PATH", params[2].envelope);
        
            assertNotUndefined(params2[0].envelope);
            assertEquals("URL", params2[0].envelope);
        
            assertNotUndefined(params3[0].envelope);
            assertEquals("JSON", params3[0].envelope);
        });
    });
   
    
        
});