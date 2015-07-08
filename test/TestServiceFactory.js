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
        
        describe("TestServiceFactory", function (){
            it("test simplest get service with default configuration and passed SMD object.  No plugins passed", function () {
                var factory = new Factory(),
                smd = CaseService,
                resolvedSmd = (new Reader(smd)).smd,
                service;

                service = factory.getService(resolvedSmd, {});
                assert.equal("CaseService", service.name);
                assert.equal(resolvedSmd, service.reader.smd);
                assert.equal(0, service.factoryPlugins.length);
            });
            
            it("Test that a non-existent service just produces an empty service object.", function () {
                var factory = new Factory(),
                service;

                try {
                    service = factory.getService("Non.Existent.Service", {});
                    assert.isFalse(true);
                } catch (e) {
                    // should have thrown an error
                }
            });
            
            it("test getService with the plugins array instantiated above", function () {
                var factory = new Factory(),
                smd = CaseService,
                resolvedSmd = (new Reader(smd)).smd,
                service;

                service = factory.getService(resolvedSmd, plugins);
                assert.equal("CaseService", service.name);
                assert.equal(0, service.factoryPlugins.length);
                assert.equal(4, service.plugins.length);
                assert.equal("plugin1", service.plugins[0].name);
                assert.equal("plugin2", service.plugins[1].name);
                assert.equal("plugin3", service.plugins[2].name);
                assert.equal("plugin4", service.plugins[3].name);
                assert.equal(resolvedSmd, service.reader.smd);
            });
            
            it("Test getting the service by name with default SMD resolution and no plugins passed", function () {
                var factory = new Factory({resolver: SyncResolveServices}),
                smd = SimpleTestServiceSchema,
                resolvedSmd = (new Reader(smd)).smd,
                service;

                service = factory.getServiceByName("Schema/SimpleTestServiceSchema");
                assert.equal("SimpleTestServiceSchema", service.name);
                assert.equal(resolvedSmd, service.reader.smd);
                assert.equal(0, service.factoryPlugins.length);
            });
            
            it("Test getting the service by name with default SMD resolution and no plugins passed", function () {
                var factory = new Factory({resolver: SyncResolveServices}),
                smd = SimpleTestServiceSchema,
                resolvedSmd = (new Reader(smd)).smd,
                service;

                service = factory.getServiceByName("Schema/SimpleTestServiceSchema", plugins);
                assert.equal("SimpleTestServiceSchema", service.name);
                assert.equal(0, service.factoryPlugins.length);
                assert.equal(4, service.plugins.length);
                assert.equal("plugin1", service.plugins[0].name);
                assert.equal("plugin2", service.plugins[1].name);
                assert.equal("plugin3", service.plugins[2].name);
                assert.equal("plugin4", service.plugins[3].name);
                assert.equal(resolvedSmd, service.reader.smd);
            });
            
            it("Test getting the service by name with custom SMD resolution.", function () {
                var factory = new Factory({resolver: SyncResolveServices}),
                smd = SimpleTestServiceSchema,
                resolvedSmd = (new Reader(smd)).smd,
                service;

                service = factory.getServiceByName("Schema/SimpleTestServiceSchema");
                assert.equal("SimpleTestServiceSchema", service.name);
    //            assert.isTrue(service.reader.smd.taggedByResolver);
                assert.equal(resolvedSmd, service.reader.smd);
                assert.equal(0, service.factoryPlugins.length);
            });
            
            it("Test \"mixin\" plugin handling", function () {
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
               assert.equal("SimpleTestServiceSchema", service.name);
               assert.equal(9, service.addedThisProperty.length);
               assert.equal(resolvedSmd, service.reader.smd);
               assert.equal(1, service.factoryPlugins.length);
               assert.equal('name', service.factoryPlugins[0].name);

               factory.removePluginByName("name", "mixin");
               factory.addPlugin(plugins2[0]);
               service = factory.getServiceByName("Schema/SimpleTestServiceSchema");
               assert.equal(1, service.addedThisProperty.length);
            });
            
            it("Test adding and removing plugins on the factory.", function () {
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
