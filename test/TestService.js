require([
    "circuits/Service",
    "circuits/ZypSMDReader",
    "Schema/services/CaseService"
], function (
    Service,
    Reader,
    CaseService
) {

        var service,
            invokeCount;

        /**
         * Test the primitive service methods.
         */
        
        //setUp
        var reader = new Reader(CaseService);
        service = new Service(reader);
        invokeCount = 0;
        
        describe("Test the primitive service methods.", function () {
            it("Did the name get set correctly", function () {
                assert.equal("CaseService", service.name);
            });
            
            it("Can we retrieve a method as a ServiceMethod?", function () {
                assert.equal("readCase", service.getMethod("readCase").name);
            });
            
            it("Can we retrieve an array of ServiceMethods", function () {
              //note: this method is duplicative of TestZypSMDReader.testGetMethods
                
                var methods = service.getMethods();

                assert.equal(5, methods.length);

                methods.sort(function (x, y) {
                    return x.name.localeCompare(y.name);
                });
                assert.equal("deleteCaseNote", service.getMethods()[0].name);
                assert.equal("readCase", service.getMethods()[1].name);
                assert.equal("readCaseList", service.getMethods()[2].name);
                assert.equal("readCaseNoteList", service.getMethods()[3].name);
                assert.equal("readRawPDF", service.getMethods()[4].name);
            });
            
            it("this is going to test that the correct service methods were generated on the store in the constructor", function () {
                assert.equal("function", typeof service.readCase);
                assert.equal("function", typeof service.readCaseList);
                assert.equal("function", typeof service.readCaseNoteList);
            });
            
            it("can we add a plugin to the service?", function () {
                var plugins = [
                               {
                                   type: "url",
                                   name: " p1"
                               },
                               {
                                   type: "url",
                                   name: "p2"
                               }
                           ];

                           service.plugins = [];

                           service.addPlugin(plugins[0]);
                           assert.equal(1, service.plugins.length);

                           service.addPlugin(plugins[1]);
                           assert.equal(2, service.plugins.length);
            });
            
            it("can we remove a plugin from the service?", function () {
                var plugins = [
                               {
                                   type: "url",
                                   name: " p1"
                               },
                               {
                                   type: "url",
                                   name: "p2"
                               }
                           ];

                           service.plugins = plugins;

                           service.removePlugin(plugins[0]);
                           assert.equal(1, service.plugins.length);
            });
            
            it("Do plugins resolve correctly?", function () {
                var servicePlugins = [
                                      {
                                          pointcut: "*.*",
                                          type: "url",
                                          name: "serviceRoot",
                                          fn: function (url) {
                                              return "/" + url;
                                          }
                                      },
                                      {
                                          pointcut: "CaseService.readCase",
                                          type: "read",
                                          name: "response",
                                          fn: function (item) {

                                          }
                                      }
                                  ], plugins;


                                  plugins = service.resolvePlugins("readCase", servicePlugins);

                                  //should have one global (url) and one for readCase
                                  assert.equal(1, plugins.url.length);
                                  assert.equal(1, plugins.read.length);
                                  assert.equal(0, plugins.write.length);
            });
            
            it("Do the parameters convert correctly.", function () {
                var loadfn = function () {
                },
                errorfn = function () {
                },
                plugs;

                plugs = service.convertCallbackParam({
                    load: loadfn,
                    error: errorfn,
                    onLoad: loadfn,
                    onError: errorfn,
                    success: loadfn
                });
    
                // order is coupled to the implementation in service
                assert.equal(5, plugs.length);
                assert.equal(loadfn, plugs[0].fn);
                assert.equal(errorfn, plugs[1].fn);
                assert.equal(loadfn, plugs[2].fn);
                assert.equal(loadfn, plugs[3].fn);
                assert.equal(errorfn, plugs[4].fn);
            });
        });

    });