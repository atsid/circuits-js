define([
    "circuits/ServiceFactory",
    "Schema/SimpleTestServiceSchema",
    "Schema/SimpleTestModelSchema",
    "Schema/services/CaseService",
    "circuits/ZypSMDReader",
    "test/SyncResolveServices",
    "test/testUtils"
], function (
    Factory,
    SimpleTestServiceSchema,
    SimpleTestModelSchema,
    CaseService,
    Reader,
    SyncResolveServices,
    testUtils
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

        describe("TestServiceFactory", function() {

            beforeEach(function () {
            });


            // test simplest get service with default configuration and
            // passed SMD object.  No plugins passed
            it("testGetServiceWithoutPlugins",  function () {
                var factory = new Factory(),
                    smd = CaseService,
                    resolvedSmd = (new Reader(smd, SyncResolveServices)).smd,
                    service;

                service = factory.getService(resolvedSmd, {});
                assert.equal("CaseService", service.name);
                assert.equal(resolvedSmd.id, service.reader.smd.id);
                assert.equal(0, service.factoryPlugins.length);
            });


            // Test that a non-existent service just produces an empty
            // service object.
            it("testGetNonExistentService",  function () {
                var factory = new Factory(),
                    service;

                try {
                    service = factory.getService("Non.Existent.Service", {});
                    assert.isFalse(true);
                } catch (e) {
                    // should have thrown an error
                }
            });


            //test getService with the plugins array instantiated above
            it("testGetServiceWithPlugins",  function () {
                var factory = new Factory(),
                    smd = CaseService,
                    resolvedSmd = (new Reader(smd, SyncResolveServices)).smd,
                    service;

                service = factory.getService(resolvedSmd, plugins);
                assert.equal("CaseService", service.name);
                assert.equal(0, service.factoryPlugins.length);
                assert.equal(4, service.plugins.length);
                assert.equal("plugin1", service.plugins[0].name);
                assert.equal("plugin2", service.plugins[1].name);
                assert.equal("plugin3", service.plugins[2].name);
                assert.equal("plugin4", service.plugins[3].name);
                assert.equal(resolvedSmd.id, service.reader.smd.id);
            });


            // Test getting the service by name with default SMD resolution and no plugins passed
            it("testGetByNameWithoutPlugins",  function () {
                var factory = new Factory({resolver: SyncResolveServices}),
                    smd = SimpleTestServiceSchema,
                    resolvedSmd = (new Reader(smd, SyncResolveServices)).smd,
                    service;

                service = factory.getServiceByName("Schema/SimpleTestServiceSchema");
                assert.equal("SimpleTestServiceSchema", service.name);
                assert.equal(resolvedSmd.id, service.reader.smd.id);
                assert.equal(0, service.factoryPlugins.length);
            });


            // Test getting the service by name with default SMD resolution and no plugins passed
            it("testGetByNameWithPlugins",  function () {
                var factory = new Factory({resolver: SyncResolveServices}),
                    smd = SimpleTestServiceSchema,
                    resolvedSmd = (new Reader(smd, SyncResolveServices)).smd,
                    service;

                service = factory.getServiceByName("Schema/SimpleTestServiceSchema", plugins);
                assert.equal("SimpleTestServiceSchema", service.name);
                assert.equal(0, service.factoryPlugins.length);
                assert.equal(4, service.plugins.length);
                assert.equal("plugin1", service.plugins[0].name);
                assert.equal("plugin2", service.plugins[1].name);
                assert.equal("plugin3", service.plugins[2].name);
                assert.equal("plugin4", service.plugins[3].name);
                assert.equal(resolvedSmd.id, service.reader.smd.id);
            });


            // Test getting the service by name with custom SMD resolution.
            it("testGetByNameWithPassedResolver",  function () {
                var factory = new Factory({resolver: SyncResolveServices}),
                    smd = SimpleTestServiceSchema,
                    resolvedSmd = (new Reader(smd, SyncResolveServices)).smd,
                    service;

                service = factory.getServiceByName("Schema/SimpleTestServiceSchema");
                assert.equal("SimpleTestServiceSchema", service.name);
//                assert.isTrue(service.reader.smd.taggedByResolver);
                assert.equal(resolvedSmd.id, service.reader.smd.id);
                assert.equal(0, service.factoryPlugins.length);
            });


            // Test "mixin" plugin handling
            it("testMixinPlugins",  function () {
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
                    resolvedSmd = (new Reader(smd, SyncResolveServices)).smd,
                    service;

                service = factory.getServiceByName("Schema/SimpleTestServiceSchema");
                assert.equal("SimpleTestServiceSchema", service.name);
                assert.equal(9, service.addedThisProperty.length);
                assert.equal(resolvedSmd.id, service.reader.smd.id);
                assert.equal(1, service.factoryPlugins.length);
                assert.equal('name', service.factoryPlugins[0].name);

                factory.removePluginByName("name", "mixin");
                factory.addPlugin(plugins2[0]);
                service = factory.getServiceByName("Schema/SimpleTestServiceSchema");
                assert.equal(1, service.addedThisProperty.length);
            });


            // Test adding and removing plugins on the factory.
            it("testAddingAndRemovingPlugins",  function () {
                var plugin = {
                    name: "pluginAdded",
                    type: "read",
                    pointcut: "*.*"
                }, factory = new Factory({'plugins': plugins, resolver: SyncResolveServices});

                assert.equal(4, factory.config.plugins.length);
                factory.addPlugin(plugin);
                assert.equal(5, factory.config.plugins.length);
                factory.removePlugin(plugin);
                assert.equal(4, factory.config.plugins.length);
                factory.addPlugin(plugin);
                assert.equal(5, factory.config.plugins.length);
                factory.removePluginByName(plugin.name, plugin.type);
                assert.equal(4, factory.config.plugins.length);
            });

        });

    });
