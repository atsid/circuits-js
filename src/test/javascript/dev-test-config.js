(function () {
    require.config({
        baseUrl: "/test/src",
        paths: {
            circuits: "main",
            external: "test/javascript/third-party",
            test: "test/javascript",
            TestData: "test/data",
            Schema: "test/data/schema"
        }
    });
}());
