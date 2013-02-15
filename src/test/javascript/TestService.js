require([
    "circuits/Service",
    "circuits/ZypSMDReader",
    "Schema/services/CaseService"
], function (
    Service,
    Reader,
    CaseService
) {

        var b,
            service,
            invokeCount;

        /**
         * Test the primitive service methods.
         */
        b = new TestCase("TestService", {

            setUp: function () {
                var reader = new Reader(CaseService);
                service = new Service(reader);
                invokeCount = 0;
            },

            // Did the name get set correctly
            testName: function () {

                assertEquals("CaseService", service.name);
            },

            // Can we retrieve a method as a ServiceMethod?
            testGetMethod: function () {
                assertEquals("readCase", service.getMethod("readCase").name);
            },

            // Can we retrieve an array of ServiceMethods
            //note: this method is duplicative of TestZypSMDReader.testGetMethods
            testGetMethods: function () {

                var methods = service.getMethods();

                assertEquals(5, methods.length);

                methods.sort(function (x, y) {
                    return x.name.localeCompare(y.name);
                });
                assertEquals("deleteCaseNote", service.getMethods()[0].name);
                assertEquals("readCase", service.getMethods()[1].name);
                assertEquals("readCaseList", service.getMethods()[2].name);
                assertEquals("readCaseNoteList", service.getMethods()[3].name);
                assertEquals("readRawPDF", service.getMethods()[4].name);


            },

            //this is going to test that the correct service methods were generated on the store in the constructor
            testConstructorMethodGeneration: function () {

                assertEquals("function", typeof service.readCase);
                assertEquals("function", typeof service.readCaseList);
                assertEquals("function", typeof service.readCaseNoteList);

            },

            // can we add a plugin to the service?
            testAddPlugin: function () {

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
                assertEquals(1, service.plugins.length);

                service.addPlugin(plugins[1]);
                assertEquals(2, service.plugins.length);

            },

            // can we remove a plugin from the service?
            testRemovePlugin: function () {
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
                assertEquals(1, service.plugins.length);

            },

            // Do plugins resolve correctly?
            testResolvePlugins: function () {

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
                assertEquals(1, plugins.url.length);
                assertEquals(1, plugins.read.length);
                assertEquals(0, plugins.write.length);

            },

            // Do the parameters convert correctly.
            testConvertCallbackParam: function () {
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
                assertEquals(5, plugs.length);
                assertEquals(loadfn, plugs[0].fn);
                assertEquals(errorfn, plugs[1].fn);
                assertEquals(loadfn, plugs[2].fn);
                assertEquals(loadfn, plugs[3].fn);
                assertEquals(errorfn, plugs[4].fn);
            }

        });
    });