

const HCCrawler = require('headless-chrome-crawler');
const _ = require('underscore');

function mapCookies(cookies) {
    return _.map(cookies, function (cookie) {
        var toReturn = {
            name: cookie.key,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            hostOnly: cookie.hostOnly,
        };
        if (cookie.expires) {
            //convert Date to number
            if (_.isDate(cookie.expires)) {
                toReturn.expires = (cookie.expires.getTime() / 1000);
            }
        }
        return toReturn;

    });


}



function crawlPreviewPage(params, cookieStr, cookies, callback) {
    //debugger;



    let cookiesArr = mapCookies(cookies);
    let url = params.baseUrl + params.redirect_url;

    let res = '';
    HCCrawler.launch({
        args: ['--disable-web-security','--no-sandbox'],
        evaluatePage: (() => {
            const wait = () => new Promise(resolve => void setTimeout(resolve, 7000)); // wait for 6 sec
            return wait().then(() => {
                return '<head>'+$('head').html() + '</head><body>' +$('body').html() + '</body>';
            });
        }),
        // evaluatePage: () => {
        //     content: $('html').html()
        // },
        onSuccess: result => {
            console.log(result);
            callback(null, result.result);
            //callback(null,result);

        },
        onError: err => {
            console.log(err);
            debugger;
            callback(err);
        }

    }).then(function (crawler) {


        crawler.on('newpage', function(page) {

            debugger;
            page.content().then(html => {
                //debugger;
                res = html;
            });
        });


        crawler.on('requestskipped', function(options) {
            console.log('requestskipped');
            console.log(options);
        });


        crawler.on('requestfinished', function(options) {
            console.log('requestfinished');
            console.log(options);
        });

        crawler.on('requestdisallowed', function(options) {
            console.log('requestdisallowed');
            console.log(options);
        });

        crawler.on('requestfailed', function(error) {
            console.log('requestfailed');
            console.log(error);
        });

        crawler.queue({url:url, cookies: cookiesArr, waitUntil: 'domcontentloaded' }).then(function() {

        //crawler.queue({url:url, extraHeaders: { 'cookies':cookieStr}}).then(function(resp) {
            //debugger;
        });
        crawler.onIdle().then(function (res) {
            return crawler.close();
        }).then(function (resp) {
            //debugger;
            console.log('done');
        });
    }).catch(function (err) {
        debugger;
        console.log(err);
    });


}


module.exports = {
    crawlPreviewPage: crawlPreviewPage
};
