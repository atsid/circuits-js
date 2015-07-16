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
            myReader = new Reader(SchemaCaseService, SyncResolveServices),
            matcher = new PluginMatcher(), b,
            singleResponse = {
                "case": {
                    caseNumber: "90009528"
                },
                "msg": "OK",
                "success": true,
                "links": [{
                    rel: "edit",
                    href: "/cases/90009528"
                }, {
                    rel: "create",
                    href: "/cases"
                }]
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
                    var request = new Request({}, function () {
                        if (params.url.indexOf("offset") !== -1) {
                            params.handler.call(b, 200, myListResponse, params);
                        } else {
                            params.handler.call(b, 200, singleResponse, params);
                        }
                    });
                    return request;
                }
            }),
            mockProvider = new MockProvider();
        
        
        
        //SetUp
        myReader = new Reader(SchemaCaseService);
        var m_defaultPlugins = {};
        for(prop in matcher.defaults) {
            m_defaultPlugins[prop] = [];
        }
        
        describe("Test the TestServiceMethod", function () {
            it("Verify that the constructor correctly instantiates it's properties", function () {
                var method = new ServiceMethod("readCase", myReader, mockProvider);
                
                assert.equal("readCase", method.name);
                assert.equal(myReader, method.reader);
                assert.equal(mockProvider, method.provider);
                assert.equal("case", method.responsePayloadName);
                assert.equal("GET", method.transport);
            });
            
            it("Test invokeSingleGet", function () {
                var method = new ServiceMethod("readCase", myReader, mockProvider),
                plugins = util.mixin(m_defaultPlugins, {
                    handler: [{
                        fn: function (data, params) {
                            assert.equal("90009528", data.caseNumber);
                            assert.isUndefined(params.request.total); //single item response, should have undefined total
                            assert.equal(2, params.links.length);
                            assert.equal(singleResponse, params.response);
                        }
                    }]
                });
    
                method.invoke({
                    caseNumber: "90009528"
                }, plugins);
            });
            
            it("Test invokeAny", function () {
                var method = new ServiceMethod("readRawPDF", myReader, mockProvider),
                plugins = util.mixin(m_defaultPlugins, {
                    handler: [{
                        fn: function (data, params) {
                            assert.equal("90009528", data.case.caseNumber);
                            assert.isUndefined(params.request.total); //single item response, should have undefined total
                        }
                    }]
                });
                method.invoke({caseNumber: "90009528"}, plugins);
            });
            
            it("test invokeSingleGetWithReadProcessors", function () {
                var plugins = util.mixin(m_defaultPlugins, {
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
                    handler: [
                        {
                            name: 'load1',
                            fn : function (data, params) {
                                assert.equal("1", data.caseNumber); //we've transformed the case number in the read processor
                                assert.isTrue(data.justRead);
                                assert.isUndefined(params.request.total); //single item response, should have undefined total
                                assert.equal(singleResponse, params.response);
                            }
                        }
                    ]
                }),
                    method = new ServiceMethod("readCase", myReader, mockProvider);
        
                method.invoke({
                    caseNumber: "90009528"
                }, plugins);
            });
            /*
            it("Test invokeListGet", function () {
                var method = new ServiceMethod("readCaseList", myReader, mockProvider),
                plugins = util.mixin(m_defaultPlugins, {
                    handler: [
                        {
                            name: 'load',
                            fn: function (data, params) {
                                assert.equal(2, data.length);
                                assert.equal(10, params.request.total);
                                assert.equal("90009528", data[0].caseNumber);
                                assert.equal("90009529", data[1].caseNumber);
                                assert.equal(myListResponse, params.response);
                            }
                        }
                    ]
                });

                method.invoke({
                    offset: 0,
                    count: 2
                }, plugins);
            });
            //*/
            it("test invokeErrorGet", function () {
                var method = new ServiceMethod("readCaseNoteList", myReader, mockProvider),
                plugins = util.mixin(m_defaultPlugins, {
                    handler: [{
                        name: 'load',
                        statusPattern: "(2|3)\\d\\d",
                        fn: function (data, params, total) {
                            assert.isTrue(false);
                        }
                    }, {
                        name: 'error',
                        statusPattern: "(4|5)\\d\\d",
                        fn: function (data, params) {
                            assert.isFalse(data.success);
                        }
                    }]
                });
                mockProvider.read = function (params) {
                    return new Request({}, function () {
                        params.handler.call(this, 400, errorResponse, params);
                    });
                };
        
                method.invoke({
                    caseNumber: "90009528",
                    documentId: 12
                }, plugins);
            });
            
            it("specifically tests that SMD methods with returns: { type: \"null\" } are not unwrapped", function () {
                var method = new ServiceMethod("deleteCaseNote", myReader, mockProvider),
                plugins = util.mixin(m_defaultPlugins, {
                    response: [{
                        fn: function (data, params) {
                            assert.isTrue(false); //shouldn't execute response callback on null responses, so verify no execution
                        }
                    }],
                    read: [{
                        fn: function (item) {
                            assert.isTrue(false); //read plugins shouldn't execute against null responses either
                        }
                    }],
                    handler: [{
                        fn: function (data, params) {
                            assert.isUndefined(data); //load callback should have undefined data for null response, since it wasn't processed
                        }
                    }]
                });

                mockProvider.read = function (params) {
                    return new Request({}, function () {
                        params.handler.call(this, 204, undefinedResponse, params);
                    });
                };
    
                method.invoke({
                    caseNumber: "12345678",
                    noteId: 1
                }, plugins);
            });
            
            
        });
    
    });
