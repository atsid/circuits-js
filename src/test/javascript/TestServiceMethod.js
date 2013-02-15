require([
    "circuits/ServiceMethod",
    "circuits/DataProvider",
    "circuits/ZypSMDReader",
    "circuits/Request",
    "circuits/PluginMatcher",
    "circuits/declare",
    "circuits/util",
    "Schema/services/CaseService",
    "test/SyncResolveServices"
], function (
    ServiceMethod,
    DataProvider,
    Reader,
    Request,
    PluginMatcher,
    declare,
    Util,
    SchemaCaseService,
    SyncResolveServices
) {
    
        var util = new Util(),
            b,
            myReader = new Reader(SchemaCaseService, SyncResolveServices),
            matcher = new PluginMatcher(),
            singleResponse = {
                "case": {
                    caseNumber: "90009528"
                },
                "msg": "OK",
                "success": true
            },
            myListResponse = {
                "cases": [{
                    caseNumber: "90009528"
                }, {
                    caseNumber: "90009529"
                }],
                "msg": "OK",
                "success": true,
                "total": 10
            },
            undefinedResponse,
            errorResponse = {
                "stackTrace": "exception",
                "msg": "Unknown server error",
                "success": false
            },
            MockProvider = declare(DataProvider, {
                read: function (params) {
                    if (params.url.indexOf("offset") !== -1) {
                        params.handler.call(b, myListResponse, params);
                    } else {
                        params.handler.call(b, singleResponse, params);
                    }
                    return new Request({}, function () {});
                }
            }),
            mockProvider = new MockProvider(),

        b = new TestCase("TestServiceMethod", {
        
            setUp: function () {
                myReader = new Reader(SchemaCaseService);
                this.defaultPlugins = {};
                for(prop in matcher.defaults) {
                    this.defaultPlugins[prop] = [];
                }
            },
        
            //Verify that the constructor correctly instantiates it's properties
            testConstructor: function () {
                var method = new ServiceMethod("readCase", myReader, mockProvider);
        
                assertEquals("readCase", method.name);
                assertEquals(myReader, method.reader);
                assertEquals(mockProvider, method.provider);
                assertEquals("case", method.responsePayloadName);
                assertEquals("GET", method.transport);
            },
        
            testInvokeSingleGet: function () {
        
                var method = new ServiceMethod("readCase", myReader, mockProvider),
                    plugins = util.mixin(this.defaultPlugins, {
                        load: [{
                            name: 'load',
                            fn: function (data, params, total) {
                                assertEquals("90009528", data.caseNumber);
                                assertUndefined(total); //single item response, should have undefined total
                            }
                        }]
                    });
        
                method.invoke({
                    caseNumber: "90009528"
                }, plugins);
        
            },
        
            testInvokeAny: function () {
                var method = new ServiceMethod("readRawPDF", myReader, mockProvider),
                    plugins = util.mixin(this.defaultPlugins, {
                        load: [{
                            name: 'load',
                            fn: function (data, params, total) {
                                assertEquals("90009528", data.case.caseNumber);
                                assertUndefined(total); //single item response, should have undefined total
                            }
                        }]
                    });
                method.invoke({caseNumber: "90009528"}, plugins);
            },
        
            testInvokeSingleGetWithReadProcessors: function () {
        
                var plugins = util.mixin(this.defaultPlugins, {
                    read: [
                        {
                            name: 'read1',
                            fn: function (item) {
                                item.caseNumber = "1";
                            }
                        },
                        {
                            name: 'read2',
                            fn: function (item) {
                                item.justRead = true;
                            }
                        }
                    ],
                    load: [
                        {
                            name: 'load1',
                            fn : function (data, params, total) {
                                assertEquals("1", data.caseNumber); //we've transformed the case number in the read processor
                                assertTrue(data.justRead);
                                assertUndefined(total); //single item response, should have undefined total
                            }
                        }
                    ]
                }),
                    method = new ServiceMethod("readCase", myReader, mockProvider);
        
                method.invoke({
                    caseNumber: "90009528"
                }, plugins);
        
            },
        
            testInvokeListGet: function () {
        
                var method = new ServiceMethod("readCaseList", myReader, mockProvider),
                    plugins = util.mixin(this.defaultPlugins, {
                        load: [
                            {
                                name: 'load',
                                fn: function (data, params, total) {
                                    assertEquals(2, data.length);
                                    assertEquals(10, total);
                                    assertEquals("90009528", data[0].caseNumber);
                                    assertEquals("90009529", data[1].caseNumber);
                                }
                            }
                        ]
                    });
        
                method.invoke({
                    offset: 0,
                    count: 2
                }, plugins);
        
            },
        
            testInvokeErrorGet: function () {
        
                var method = new ServiceMethod("readCaseNoteList", myReader, mockProvider),
                    plugins = util.mixin(this.defaultPlugins, {
                        load: [{
                            name: 'load',
                            fn: function (data, params, total) {
                                assertTrue(false);
                            }
                        }],
                        error: [{
                            name: 'error',
                            fn: function (data, params) {
                                assertFalse(data.success);
                            }
                        }]
                    });
                mockProvider.read = function (params) {
                    params.handler.call(this, 400, errorResponse, params);
                    return new Request({}, function () {});
                };
        
                method.invoke({
                    caseNumber: "90009528",
                    documentId: 12
                }, plugins);
        
            },

            //specifically tests that SMD methods with returns: { type: "null" } are not unwrapped
            testProcessNullResponse: function () {

                var method = new ServiceMethod("deleteCaseNote", myReader, mockProvider),
                    plugins = util.mixin(this.defaultPlugins, {
                        load: [{
                            name: 'load',
                            fn: function (data, params, total) {
                                assertUndefined(data);
                            }
                        }]
                    });
                mockProvider.read = function (params) {
                    params.handler.call(this, 204, undefinedResponse, params);
                    return new Request({}, function () {});
                };

                method.invoke({
                    caseNumber: "12345678",
                    noteId: 1
                }, plugins);
            }
        
        });
    
    });
