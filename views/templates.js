/**
 * @copyright Digital Engagement Xperience 2017
 */
/*jslint node: true */
'use strict';

/** required modules */
var fs = require('fs');

/** read all templates into ui object */
var ui = {};

var templateList = [
    {
        name: 'global',
        file: __dirname+'/html/global.html'
    },
    {
        name: 'header',
        file: __dirname+'/html/header.html'
    },
    {
        name: 'footer',
        file: __dirname+'/html/footer.html'
    },
    {
        name: 'scripts',
        file: __dirname+'/html/scripts.html'
    },
    {
        name: 'ice4mdashboardConsumer',
        file: __dirname+'/html/ice4m-dashboard-consumer.html'
    },
    {
        name: 'ice4mdashboardProducer',
        file: __dirname+'/html/ice4m-dashboard-producer.html'
    },
    {
        name: 'ice4mdashboardError',
        file: __dirname+'/html/ice4m-dashboard-error.html'
    },
    {
        name: 'flexEpa',
        file: __dirname+'/html/epa_jointjs.html'
        // file: __dirname+'/html/flex_epa_jointjs.html'
    },
    {
        name: 'campaignPlanner',
        file: __dirname+'/html/campaign-planner-jointjs.html'
        // file: __dirname+'/html/flex_epa_jointjs.html'
    },
    {
        name: 'sidebar',
        file: __dirname+'/html/sidebar.html'
    },
    {
        name: 'navbar',
        file: __dirname+'/html/navbar.html'
    },
    {
        name: 'ice4mBCInsCreate',
        file: __dirname+'/html/ice4m-bc-ins-creation.html'
    },
    {
        name: 'ice4mBCInsListNew',
        file: __dirname+'/html/ice4m-bc-ins-list-new.html'
    },
    {
        name: 'touchpointPopover',
        file: __dirname+'/html/ice4m-touchpoint-popover.html'
    },
    {
        name: 'promotionPlayer',
        file: __dirname+'/html/ice4m-promotion-player.html'
    },
    {
        name: 'merchandisingChannelWidget',
        file: __dirname+'/html/bcc-merch-widget.html'
    },
    {
        name: 'bccPlayerTemplate',
        file: __dirname+'/html/bcc-player-template_UX.html'
    },
    {
        name: 'bcInstanceCard',
        file: __dirname+'/html/bc-card.html'
    },
    {
        name: 'ice4mEPtTemplates',
        file: __dirname+'/html/ice4m-ept-templates.html'
    },
    {
        name: 'bccSeServiceView',
        file: __dirname+'/html/bcc-seservice.html'
    },
    {
        name: 'storyboardView',
        file: __dirname+'/html/story-view.html'
    },
    {
        name: 'emPage',
        file: __dirname+'/html/em/em-mng.html'
    },
    {
        name: 'rmPage',
        file: __dirname+'/html/rm/role-permission-mng.html'
    },
    {
        name: 'ecIntelView',
        file: __dirname+'/html/ed_intel.html'
    },
    {
        name: 'campaignPage',
        file: __dirname+'/html/ice4m-campaign.html'
    },
    {
        name: 'twitterPreview',
        file: __dirname+'/html/preview/twitter-main.html'
    },
    {
        name: 'facebookPreview',
        file: __dirname+'/html/preview/facebook-main.html'
    },
    {
        name: 'pendingPreview',
        file: __dirname+'/html/preview/pending.html'
    },
    {
        name: 'dynamicIntelPage',
        file: __dirname+'/html/intelligence/dynamic-intel-configuration.html'
    },
    {
        name: 'reportView',
        file: __dirname+'/html/intelligence/report.html'
    },
    {
        name: 'tagsPage',
        file: __dirname+'/html/tag/tag.html'
    }

];

/* read all html into ui object */
for (var idx = 0; idx < templateList.length; idx++ ) {

    ui[templateList[idx].name]= fs.readFileSync( templateList[idx].file, 'utf8' );
}

/**
 * export the ui object
 * @type {object}
 */
module.exports = ui;
