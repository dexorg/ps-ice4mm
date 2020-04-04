
var responseContent =
    '<html>' +
    '<body>' +
    '<style>' +
    'body {text-align: center; background-color: #4f4f4f; color: #eee;}' +
    '</style>' +
    '<h1>ICE4M</h1>' +
    '<p>There seems to be a problem with your connection.</p>' +
    '</body>' +
    '</html>';


/**
 * TODO: Increase reliability with backup scripts from CDN not loading
 * Increase
 */


self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request).catch(function() {
            return new Response(
                responseContent,
                {headers: {'Content-Type': 'text/html'}}
            );
        })
    );
});
