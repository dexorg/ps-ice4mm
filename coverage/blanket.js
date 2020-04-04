require('blanket')({
    // skip all files in node_modules and test from instrumentation
    pattern: /^(?!.*(node_modules|test).*$)/
});