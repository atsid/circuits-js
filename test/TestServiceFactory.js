require([
    "circuits/ServiceFactory",
    "Schema/SimpleTestServiceSchema",
    "Schema/SimpleTestModelSchema",
    "Schema/services/CaseService",
    "circuits/ZypSMDReader",
    "test/SyncResolveServices"
], function (
    Factory,
    SimpleTestServiceSchema,
    SimpleTestModelSchema,
    CaseService,
    Reader,
    SyncResolveServices
) {
        var b,
            plugins = [
                {
                    name: "plugin1",
                    type: "read",
                    pointcut: "*.*"
                },
                {
                    name: "plugin2",
                    type: "read",
                    pointcut: "*.*"
                },
                {
                    name: "plugin3",
                    type: "write",
                    pointcut: "*.*"
                },
                {
                    name: "plugin4",
                    type: "response",
                    pointcut: "*.*"
                }
            ];

        b = new TestCase("TestServiceFactory", {

            setUp: function () {
            },

            // test simplest get service with default configuration and
            // passed SMD object.  No plugins passed
            testGetServiceWithoutPlugins: function () {
                var factory = new Factory(),
                    smd = CaseService,
                    resolvedSmd = (new Reader(smd)).smd,
                    service;

                service = factory.getService(resolvedSmd, {});
                assertEquals("CaseService", service.name);
                assertEquals(resolvedSmd, service.reader.smd);
                assertEquals(0, service.factoryPlugins.length);
            },

            // Test that a non-existent service just produces an empty
            // service object.
            testGetNonExistentService: function () {
                var factory = new Factory(),
                    service;

                try {
                    service = factory.getService("Non.Existent.Service", {});
                    assertFalse(true);
                } catch (e) {
                    // should have thrown an error
                }
            },

            //test getService with the plugins array instantiated above
            testGetServiceWithPlugins: function () {
                var factory = new Factory(),
                    smd = CaseService,
                    resolvedSmd = (new Reader(smd)).smd,
                    service;

                service = factory.getService(resolvedSmd, plugins);
                assertEquals("CaseService", service.name);
                assertEquals(0, service.factoryPlugins.length);
                assertEquals(4, service.plugins.length);
                assertEquals("plugin1", service.plugins[0].name);
                assertEquals("plugin2", service.plugins[1].name);
                assertEquals("plugin3", service.plugins[2].name);
                assertEquals("plugin4", service.plugins[3].name);
                assertEquals(resolvedSmd, service.reader.smd);
            },

            // Test getting the service by name with default SMD resolution and no plugins passed
            testGetByNameWithoutPlugins: function () {
                var factory = new Factory({resolver: SyncResolveServices}),
                    smd = SimpleTestServiceSchema,
                    resolvedSmd = (new Reader(smd)).smd,
                    service;

                service = factory.getServiceByName("Schema/SimpleTestServiceSchema");
                assertEquals("SimpleTestServiceSchema", service.name);
                assertEquals(resolvedSmd, service.reader.smd);
                assertEquals(0, service.factoryPlugins.length);
            },

            // Test getting the service by name with default SMD resolution and no plugins passed
            testGetByNameWithPlugins: function () {
                var factory = new Factory({resolver: SyncResolveServices}),
                    smd = SimpleTestServiceSchema,
                    resolvedSmd = (new Reader(smd)).smd,
                    service;

                service = factory.getServiceByName("Schema/SimpleTestServiceSchema", plugins);
                assertEquals("SimpleTestServiceSchema", service.name);
                assertEquals(0, service.factoryPlugins.length);
                assertEquals(4, service.plugins.length);
                assertEquals("plugin1", service.plugins[0].name);
                assertEquals("plugin2", service.plugins[1].name);
                assertEquals("plugin3", service.plugins[2].name);
                assertEquals("plugin4", service.plugins[3].name);
                assertEquals(resolvedSmd, service.reader.smd);
            },

            // Test getting the service by name with custom SMD resolution.
            testGetByNameWithPassedResolver: function () {
                var factory = new Factory({resolver: SyncResolveServices}),
                    smd = SimpleTestServiceSchema,
                    resolvedSmd = (new Reader(smd)).smd,
                    service;

                service = factory.getServiceByName("Schema/SimpleTestServiceSchema");
                assertEquals("SimpleTestServiceSchema", service.name);
//                assertTrue(service.reader.smd.taggedByResolver);
                assertEquals(resolvedSmd, service.reader.smd);
                assertEquals(0, service.factoryPlugins.length);
            },

            // Test "mixin" plugin handling
            testMixinPlugins: function () {
                var plugins = [
                        {name: 'name', type: 'mixin', pointcut: '*.*', fn: function (svc, names) {
                            svc.addedThisProperty = names;
                        }}
                    ],
                    plugins2 = [
                        {name: 'mixin2', type: 'mixin', pointcut: '*.create*', fn: function (svc, names) {
                            svc.addedThisProperty = names;
                        }}
                    ],
                    factory = new Factory({'plugins': plugins, resolver: SyncResolveServices}),
                    smd = SimpleTestServiceSchema,
                    resolvedSmd = (new Reader(smd)).smd,
                    service;

                service = factory.getServiceByName("Schema/SimpleTestServiceSchema");
                assertEquals("SimpleTestServiceSchema", service.name);
                assertEquals(9, service.addedThisProperty.length);
                assertEquals(resolvedSmd, service.reader.smd);
                assertEquals(1, service.factoryPlugins.length);
                assertEquals('name', service.factoryPlugins[0].name);

                factory.removePluginByName("name", "mixin");
                factory.addPlugin(plugins2[0]);
                service = factory.getServiceByName("Schema/SimpleTestServiceSchema");
                assertEquals(1, service.addedThisProperty.length);
            },

            // Test adding and removing plugins on the factory.
            testAddingAndRemovingPlugins: function () {
                var plugin = {
                    name: "pluginAdded",
                    type: "read",
                    pointcut: "*.*"
                }, factory = new Factory({'plugins': plugins, resolver: SyncResolveServices});

                assertEquals(4, factory.config.plugins.length);
                factory.addPlugin(plugin);
                assertEquals(5, factory.config.plugins.length);
                factory.removePlugin(plugin);
                assertEquals(4, factory.config.plugins.length);
                factory.addPlugin(plugin);
                assertEquals(5, factory.config.plugins.length);
                factory.removePluginByName(plugin.name, plugin.type);
                assertEquals(4, factory.config.plugins.length);
            }

        });

    });
