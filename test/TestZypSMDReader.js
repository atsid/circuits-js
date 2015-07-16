define(["circuits/ZypSMDReader",
        "Schema/services/CaseService",/*
        "Schema/services/PagingServiceMethod",
        "Schema/responses/CaseListResponse",
        "Schema/responses/CaseResponse",
        "Schema/models/Case",
        "Schema/responses/ListResponse",
        "Schema/responses/BaseResponse",*/
        //"Schema/SimpleTestServiceSchema",
        //"Schema/MinimalTestServiceSchema",
        "Schema/GlobalParamsSchema",
        "test/SyncResolveServices"
        ], function(
                Reader,
                CaseService,/*
                PagingServiceMethod,
                CaseListResponse,
                CaseResponse,
                Case,
                ListResponse,
                BaseResponse,*/
                //SimpleTestService,
                //MinimalTestService,
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
    //myPagingServiceMethod,
    //myCaseListResponse,
    //myCaseResponse,
    //myModelCase,
    //myListResponse,
    //myBaseResponse,
    myReadCaseList,
    myReadCase,
    myReadCaseNoteList,
    myDeleteCaseNote,
    m_myReader,
    myReadRawPDF;
    
    
   //Set up
    globalService = GlobalParams;
    //simpleService =  SimpleTestService;
    //minimalService = MinimalTestService;
    gpReader = new Reader(globalService, SyncResolveServices);
    //sReader = new Reader(simpleService, SyncResolveServices);
    //mReader = new Reader(minimalService, SyncResolveServices);

    caseServiceForReader = CaseService;
    m_myReader = new Reader(caseServiceForReader, SyncResolveServices);
    
    resolvedCaseService = m_myReader.smd;

    myCaseService = CaseService;
    //myPagingServiceMethod = PagingServiceMethod;
    //myCaseListResponse = CaseListResponse;
    //myCaseResponse = CaseResponse;
    //myModelCase = Case;
    //myListResponse = ListResponse;
    //myBaseResponse = BaseResponse;

    myReadCaseList = myCaseService.services.readCaseList;
    myReadCase = myCaseService.services.readCase;
    myReadCaseNoteList = myCaseService.services.readCaseNoteList;
    myDeleteCaseNote = myCaseService.services.deleteCaseNote;
    myReadRawPDF = myCaseService.services.readRawPDF;
    
    Array.prototype.equals = function (array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        // compare lengths - can save a lot of time 
        if (this.length != array.length)
            return false;

        for (var i = 0, l=this.length; i < l; i++) {
            // Check if we have nested arrays
            if (this[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this[i].equals(array[i]))
                    return false;       
            }           
            else if (this[i] != array[i]) { 
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;   
            }           
        }       
        return true;
    }   
    
    describe("Test the Zyp SMD reader's functions", function () {
                
        it("Verify if the case service matches the reader-resolved object", function () {
            assert.equal(myCaseService, resolvedCaseService);
        });   


        //*
        
        
        it("Verify non-function variables are instantiated correctly by the constructor", function () {
            assert.notEqual(undefined, m_myReader);
            assert.equal(resolvedCaseService, caseServiceForReader);
            assert.isTrue(m_myReader.smd.resolved);
            assert.isTrue(m_myReader.smd.resolvedProperties);
        });


        //*
        
        it("Verify if the id field of the used test schema is equal to the id returned by the getSchemaId() function", function () {
            assert.equal(myCaseService.id, m_myReader.getSchemaId()); 
        });


        //*
        
        it("Verify if the target field of the used test schema is equal to the path returned by the getRootPath() function", function () {
            assert.equal(myCaseService.target, m_myReader.getRootPath());
        });


        //*
        
        
        it("Verify if the names of each of the methods from the schema is returned in the array from the getMethodNames() function. The order of the methods is also preserved.", function () {
            var methodNames = ["readCaseList", "readCase", "readCaseNoteList", "deleteCaseNote", "readRawPDF", "resolved"],
            methodNameArray = m_myReader.getMethodNames();          
            assert.equal(6, methodNameArray.length);
            assert.equal(methodNames[0], methodNameArray[0]);
            assert.equal(methodNames[1], methodNameArray[1]);
            assert.equal(methodNames[2], methodNameArray[2]);
            assert.equal(methodNames[3], methodNameArray[3]);
            assert.equal(methodNames[4], methodNameArray[4]);
            assert.equal(methodNames[5], methodNameArray[5]);
        });


        //*
        
        
        it("Verify if the methods and their properties from the schema are identical to those returned by the getMethods() function and if they are in the same order.", function () {
            var methodArray = m_myReader.getMethods();
            //The method properties are defined at the top of b file in the global vars
               
            assert.equal(6, methodArray.length);
            assert.equal(myReadCaseList, methodArray[0]);
            assert.equal(myReadCase, methodArray[1]);
            assert.equal(myReadCaseNoteList, methodArray[2]);
            assert.equal(myDeleteCaseNote, methodArray[3]);
            assert.equal(myReadRawPDF, methodArray[4]);
            //TODO Discuss the case of the 6th method
            
        });

        
        //*
        
        it("Verify if the method returned from a call to getMethod() is identical (same properties) to the corresponding method in the schema", function () {
            var myReadCaseMethod = m_myReader.getMethod("readCase");    
            assert.equal(myReadCase, myReadCaseMethod);
        });

        //*
        
        
        it("Verify if the parameter names from each method in the schema match the corresponding parameter names returned by the getParameterNames() function, in the same order, with the same promerties", function () {
            var myReadCaseListParamNames = m_myReader.getParameterNames("readCaseList"),
            myReadCaseParamNames = m_myReader.getParameterNames("readCase"),
            myReadCaseNoteListParamNames = m_myReader.getParameterNames("readCaseNoteList");
            
            assert.equal(0, myReadCaseListParamNames.length);
            //assert.equal("offset", myReadCaseListParamNames[0]);
            //assert.equal("count", myReadCaseListParamNames[1]);        
            assert.equal(1, myReadCaseParamNames.length);
            assert.equal("caseNumber", myReadCaseParamNames[0]);        
            assert.equal(4, myReadCaseNoteListParamNames.length);
            assert.equal("caseNumber", myReadCaseNoteListParamNames[0]);
            assert.equal("documentId", myReadCaseNoteListParamNames[1]);
            assert.equal("noteName", myReadCaseNoteListParamNames[2]);
            assert.equal("case", myReadCaseNoteListParamNames[3]);
        });


        //*
        
        it("Verify if the parameters from each method in the schema match the corresponding parameters returned by the getParameters() function, in the same order, with the same properties", function (){
            var myReadCaseListParams = m_myReader.getParameters("readCaseList"),
            myReadCaseParams = m_myReader.getParameters("readCase"),
            myReadCaseNoteListParams = m_myReader.getParameters("readCaseNoteList");
    
            assert.isTrue((myReadCaseList.parameters || []).equals(myReadCaseListParams));
            assert.isTrue((myReadCase.parameters || []).equals(myReadCaseParams));
            assert.isTrue((myReadCaseNoteList.parameters || []).equals(myReadCaseNoteListParams));
            
        });


        //*
        
        
        it("Verify if the \"required\" property of each method has the same truth value as the boolean returned by isArgument required when called", function () {
            assert.isFalse(m_myReader.isArgumentRequired("readCaseList", "offset"));
            assert.isFalse(m_myReader.isArgumentRequired("readCaseList", "count"));
            assert.isTrue(m_myReader.isArgumentRequired("readCase", "caseNumber"));
            assert.isTrue(m_myReader.isArgumentRequired("readCaseNoteList", "caseNumber"));
            assert.isTrue(m_myReader.isArgumentRequired("readCaseNoteList", "documentId"));
            assert.isFalse(m_myReader.isArgumentRequired("readCaseNoteList", "noteName"));
            assert.isFalse(m_myReader.isArgumentRequired("readCaseNoteList", "case"));
        });

        
        //*
        
        describe("\"getServiceUrlMissingParameter\" function", function () {
            it("missing controlNumber required path param, should fail", function () {
                assert.throw(function () {
                    m_myReader.getServiceUrl("readCase");
                }, "Missing required param for service call: caseNumber");
            });
            
            
            it("missing documentId required URL param, should fail", function () {
                assert.throw(function () {
                    m_myReader.getServiceUrl("readCaseNoteList", {
                        controlNumber: "90009528"
                    });
                }, "Missing required param for service call: caseNumber");
            });
            
        });


        //*
        
        
        it("Verify if the getServiceUrl() function creates the proper url for the method and parameters passed to it.", function () {
          //has both path and url params
            var path = m_myReader.getServiceUrl("readCaseNoteList", {
                caseNumber: "90009528",
                documentId: 1,
                noteName: "my note"
            });
            
            assert.equal(myCaseService.target + "/90009528/notes?documentId=1&noteName=my%20note", path);
            
            path = m_myReader.getServiceUrl("readCaseNoteList", {
                caseNumber: "9000/9528",
                documentId: 1,
                noteName: "my note"
            });
    
            // todo:
            //assert.equal(rootPath + "/9000%2F9528/notes?documentId=1&noteName=my%20note", path);
            
            
        });


        //*
        
        
        it("Verify if the getServiceUrl() function creates the proper url for the method and parameters passed to it when the method passed inherits it's arguments from another method.", function () {
          //has both path and url params
            var path = m_myReader.getServiceUrl("readCaseList"/*, {   This function should not take parameters
                offset: 10,
                count: 25   
            }
            
            */);
            
            assert.equal(myCaseService.target, path);
        });


        //*
        
        
        it("Verify if each of the methods' \"transport\" property from the schema matches with the return value of getMethodTransport() when called", function () {
            assert.equal(myReadCaseList.transport, m_myReader.getMethodTransport("readCaseList"));
            assert.equal(myReadCase.transport, m_myReader.getMethodTransport("readCase"));
            assert.equal(myReadCaseNoteList.transport, m_myReader.getMethodTransport("readCaseNoteList"));
        });


        //*
        
        
        it("Verify b getAndValidateArgument() correctly returns the passed argument", function () {
            var param = myReadCase.parameters[0],
            arg = m_myReader.getAndValidateArgument(param, {
                caseNumber: "90009528"
            });

            assert.equal("90009528", arg); 
           
        });

        
        //*
        
        it("Verify if an exception is thrown if a parameter with the \"required\" property set to true is missing/undefined.", function () {
            assert.throw(function () {
                var param = myReadCase.parameters[0],
                    arg = m_myReader.getAndValidateArgument(param, {});
            }, "Missing required param for service call: caseNumber");
    
            assert.throw(function () {
                var param = myReadCaseNoteList.parameters[0],
                    arg = m_myReader.getAndValidateArgument(param, {});
            }, "Missing required param for service call: caseNumber");
            
            assert.throw( function () {
                var param = myReadCaseNoteList.parameters[1],
                    arg = m_myReader.getAndValidateArgument(param, {});
            }, "Missing required param for service call: documentId");
        });


        //*
        
        
        it("Verify if instances of {paramName} in a given url are replaced with their corresponding arg value if one exists when replacePathParamsInUrl() is called", function () {
            var firstUrl = "blah/noteName={noteName}/caseNum={caseNumber}/docId={documentId}/",
            expectedUrl = "blah/noteName={noteName}/caseNum=90009528/docId=17/",
            newUrl;
            newUrl = m_myReader.replacePathParamsInUrl(firstUrl, myReadCaseNoteList.parameters, {
                caseNumber: "90009528",
                documentId: 17
            });
            assert.equal(expectedUrl, newUrl);    
        });


        //*
        
        
        it("Verify if query suffixes are properly appended to the passed URL for all properties defined in the passed args and if it corresponds to a parameter in the passed array of parameters", function () {
            var firstUrl = "blah/{noteName}/{caseNumber}/{documentId}/",
            expectedUrl =
                "blah/{noteName}/{caseNumber}/{documentId}/?caseNumber=90009528&documentId=17",
            newUrl;
            newUrl = m_myReader.addQueryParamsToUrl(firstUrl, myReadCaseNoteList.parameters, {
                caseNumber: "90009528",
                documentId: 17
            });
                    
            assert.equal(expectedUrl, newUrl);
        });


        //*
        
        it("Verify if enumerateParameters() can take a given service and return an object with arrays of the service's parameters separated by the \"envelope\" field", function () {
            //expects a "service" object
            var params = m_myReader.enumerateParameters(resolvedCaseService.services.readCaseNoteList);
    
            assert.equal(1, params.PATH.length);
            assert.equal(params.PATH[0], myReadCaseNoteList.parameters[0]);
            assert.equal(2, params.URL.length);
            assert.equal(params.URL[0], myReadCaseNoteList.parameters[1]);
            assert.equal(params.URL[1], myReadCaseNoteList.parameters[2]);
            assert.equal(1, params.JSON.length);
            assert.equal(params.JSON[0], myReadCaseNoteList.parameters[3]);
            assert.equal(0, params.ENTITY.length);
        });


        //*
        
        
        it("expects a \"service\" object", function () {
            var params = gpReader.enumerateParameters(gpReader.smd.services.readModel);
            assert.equal(1, params.PATH.length);       
        });


        
        //*
        
        it("Verify if the object returned by getResponseSchema() matches the object in the \"returns\" field in the schema of the passed method", function () {
            assert.equal(m_myReader.getResponseSchema("readCaseList"), myReadCaseList.returns);
            assert.equal(m_myReader.getResponseSchema("readCase"), myReadCase.returns);
            assert.equal(m_myReader.getResponseSchema("readCaseNoteList"), myReadCaseNoteList.returns);
        });
        
        
        //*
        
        
        
        it("Test the Zyp SMD reader's \"getResponsePayloadName\" function", function () {
            assert.equal("cases", m_myReader.getResponsePayloadName("readCaseList"));
            assert.equal("case", m_myReader.getResponsePayloadName("readCase"));
            //this last one is omitted on the method and pulled from the service root
            assert.equal("cases", m_myReader.getResponsePayloadName("readCaseNoteList"));
        });


        /*
        
        
        it("Verifty the correct payload model", function () {
            assert.equal("model", sReader.getRequestPayloadName("createModel"));
        });


        //*/
        
        
        it("Verify if the isListResponse() function correctly returns whether or not the response payload type is array", function () {
            assert.isFalse(m_myReader.isListResponse("readCase"));
            assert.isTrue(m_myReader.isListResponse("readCaseList"));
            assert.isTrue(m_myReader.isListResponse("readCaseNoteList"));
        });


        /*
        
        
        it("Verify if parameters in a base schema are available to the derived.", function () {
            var params = sReader.getParameters("readModel");
    
            assert.equal(3, params.length);
        });


        
        
        
        it("Test the the envelope has a proper default.", function () {
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
        
        //*/
    });
   
    
        
});