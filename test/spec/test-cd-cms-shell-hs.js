/**
 * Copyright Digital Engagement Xperiance
 * Date: 19/09/16
 * @author Yu Zhao
 * @description
 */
/*global dpa_VM, ko, dexit, sinon */

(function () {
    'use strict';

    var should = chai.should();


    // describe('Test epa_auth', function () {
    //     var mapping = [{
    //         "id": "c8195002-048a-4f37-8230-0999379d3ee3",
    //         "shortId": 1
    //     }, {
    //         "id": "3d66062b-8572-43f4-b2d5-be21bde87812",
    //         "shortId": 2
    //     }, {
    //         "id": "e3f4494e-16a0-451a-99be-dfa3cb162e7a",
    //         "shortId": 3
    //     }, {
    //         "id": "f2ca116e-7b55-457b-bd0b-2c4a5d0f6c10",
    //         "shortId": 4
    //     }];
    //
    //
    //     var sandbox;
    //     beforeEach(function () {
    //         sandbox = sinon.sandbox.create();
    //     });
    //     afterEach(function () {
    //         sandbox.restore();
    //         storyboard_VM._shortIdEPMapping = [];
    //     });
    //
    //
    //     var pageDetails = {
    //         "ab": false,
    //         "ab_variation": false,
    //         "absolute_url": "http://test1-dev-4853026-4853026.hs-sites.com/-temporary-slug-3946d2c4-e993-4ea0-ac9d-18d733aa42dd",
    //         "allowed_slug_conflict": false,
    //         "analytics_page_id": "6195339801",
    //         "analytics_page_type": "landing-page",
    //         "archived": false,
    //         "attached_stylesheets": [],
    //         "author": "shawn.talbot@dexit.co",
    //         "author_at": 1537302596004,
    //         "author_email": "shawn.talbot@dexit.co",
    //         "author_name": "Shawn Talbot",
    //         "author_user_id": 6442452,
    //         "author_username": "shawn.talbot@dexit.co",
    //         "blueprint_type_id": 0,
    //         "category": 1,
    //         "category_id": 1,
    //         "created": 1537286550732,
    //         "created_by_id": 6442452,
    //         "created_time": 1537286550732,
    //         "css": {},
    //         "css_text": "",
    //         "ctas": {},
    //         "current_state": "DRAFT",
    //         "currently_published": false,
    //         "deleted_at": 0,
    //         "domain": "",
    //         "featured_image": "",
    //         "featured_image_alt_text": "",
    //         "featured_image_height": 0,
    //         "featured_image_length": 0,
    //         "featured_image_width": 0,
    //         "flex_areas": {},
    //         "freeze_date": 1537302596004,
    //         "has_user_changes": true,
    //         "id": 6195339801,
    //         "include_default_custom_css": false,
    //         "is_draft": true,
    //         "is_published": false,
    //         "keywords": [],
    //         "label": "Hubspot1_page",
    //         "last_edit_session_id": 1537286551909,
    //         "last_edit_update_id": 21,
    //         "layout_sections": {},
    //         "link_rel_canonical_url": "",
    //         "live_domain": "test1-dev-4853026-4853026.hs-sites.com",
    //         "meta": {
    //             "author_email": "shawn.talbot@dexit.co",
    //             "author_username": "shawn.talbot@dexit.co",
    //             "author_user_id": 6442452,
    //             "has_user_changes": true,
    //             "last_edit_session_id": 1537286551909,
    //             "last_edit_update_id": 21,
    //             "css": {},
    //             "password": null,
    //             "attached_stylesheets": [],
    //             "campaign_name": null,
    //             "campaign_utm": null,
    //             "css_text": "",
    //             "enable_domain_stylesheets": null,
    //             "enable_layout_stylesheets": null,
    //             "featured_image": "",
    //             "featured_image_alt_text": "",
    //             "footer_html": null,
    //             "head_html": null,
    //             "html_title": null,
    //             "include_default_custom_css": false,
    //             "layout_sections": {},
    //             "link_rel_canonical_url": "",
    //             "meta_description": null,
    //             "page_expiry_date": null,
    //             "page_expiry_enabled": null,
    //             "page_expiry_redirect_id": null,
    //             "page_expiry_redirect_url": null,
    //             "public_access_rules": [],
    //             "public_access_rules_enabled": false,
    //             "publish_immediately": true,
    //             "use_featured_image": false
    //         },
    //         "name": "Hubspot1_page",
    //         "page_redirected": false,
    //         "personas": [],
    //         "placement_guids": [],
    //         "portal_id": 4853026,
    //         "preview_key": "GiJcxogU",
    //         "processing_status": "",
    //         "public_access_rules": [],
    //         "public_access_rules_enabled": false,
    //         "publish_date": 0,
    //         "publish_date_local_time": 0,
    //         "publish_immediately": true,
    //         "published_url": "",
    //         "resolved_domain": "test1-dev-4853026-4853026.hs-sites.com",
    //         "slug": "-temporary-slug-3946d2c4-e993-4ea0-ac9d-18d733aa42dd",
    //         "state": "DRAFT",
    //         "subcategory": "landing_page",
    //         "team_perms": [],
    //         "template_path": "generated_layouts/6141848348.html",
    //         "template_path_for_render": "generated_layouts/6141848348.html",
    //         "translated_content": {},
    //         "tweet_immediately": false,
    //         "unpublished_at": 0,
    //         "updated": 1537302596004,
    //         "updated_by_id": 6442452,
    //         "upsize_featured_image": false,
    //         "url": "http://test1-dev-4853026-4853026.hs-sites.com/-temporary-slug-3946d2c4-e993-4ea0-ac9d-18d733aa42dd",
    //         "use_featured_image": false,
    //         "user_perms": [],
    //         "widget_containers": {
    //             "module_153608350183752": {
    //                 "widgets": []
    //             },
    //             "module_153608350473454": {
    //                 "widgets": [
    //                     {
    //                         "body": {
    //                             "engagement_element": [
    //                                 "<img src=\"https://cdn2.hubspot.net/hubfs/4853026/HubspotTest1__232322__1/3__eVoucher.png\" alt=\"3__eVoucher\" width=\"460\" style=\"width: 460px;\">"
    //                             ],
    //                             "module_id": 3909771,
    //                             "widget_name": "ep_rt"
    //                         },
    //                         "child_css": {},
    //                         "css": {},
    //                         "id": 1537286594924,
    //                         "label": "ep_rt",
    //                         "module_id": 3909771,
    //                         "order": 0,
    //                         "type": "module"
    //                     }
    //                 ]
    //             },
    //             "module_153635547877822": {
    //                 "widgets": [
    //                     {
    //                         "body": {
    //                             "engagement_element": [
    //                                 "<video width=\"600\" height=\"338\" style=\"width: 600px; height: 338px;\" src=\"https://cdn2.hubspot.net/hubfs/4853026/HubspotTest1__232322__1/2__aav1.mp4\" controls=\"controls\"></video>",
    //                                 "<img src=\"https://cdn2.hubspot.net/hubfs/4853026/HubspotTest1__232322__1/1__dynamic.png\" alt=\"1__dynamic\" width=\"460\" style=\"width: 460px;\">"
    //                             ],
    //                             "module_id": 3909771,
    //                             "widget_name": "ep_rt"
    //                         },
    //                         "child_css": {},
    //                         "css": {},
    //                         "id": 1537286639006,
    //                         "label": "ep_rt",
    //                         "module_id": 3909771,
    //                         "order": 0,
    //                         "type": "module"
    //                     }
    //                 ]
    //             },
    //             "module_153635548431624": {
    //                 "widgets": [
    //                     {
    //                         "body": {
    //                             "engagement_element": [
    //                                 "<img src=\"https://cdn2.hubspot.net/hubfs/4853026/HubspotTest1__232322__1/4__logo901x145.png\" alt=\"4__logo901x145\" width=\"901\" style=\"width: 901px;\">"
    //                             ],
    //                             "module_id": 3909771,
    //                             "widget_name": "ep_rt"
    //                         },
    //                         "child_css": {},
    //                         "css": {},
    //                         "id": 1537286562616,
    //                         "label": "ep_rt",
    //                         "module_id": 3909771,
    //                         "order": 0,
    //                         "type": "module"
    //                     }
    //                 ]
    //             }
    //         },
    //         "widgetcontainers": {},
    //         "widgets": {}
    //     };
    //
    //     it('should parse body, process body and add data-region references (names with module ids), and return template string with regions', function (done) {
    //
    //
    //         var bodyStr =`<div class="header-container-wrapper">
    //             <div class="header-container container-fluid">
    //
    //             <div class="row-fluid-wrapper row-depth-1 row-number-1">
    //             <div class="row-fluid ">
    //             <div class="span12 widget-span widget-type-widget_container " style="" data-widget-type="widget_container" data-x="0" data-w="12">
    //             <span id="hs_cos_wrapper_module_153635548431624" class="hs_cos_wrapper hs_cos_wrapper_widget_container hs_cos_wrapper_type_widget_container" style="" data-hs-cos-general-type="widget_container" data-hs-cos-type="widget_container"><div id="hs_cos_wrapper_widget_1537286562616" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="" data-hs-cos-general-type="widget" data-hs-cos-type="module">
    //             <img src="https://cdn2.hubspot.net/hub/4853026/hubfs/HubspotTest1__232322__1/4__logo901x145.png?t=1537286467740&amp;width=901&amp;name=4__logo901x145.png" alt="4__logo901x145" width="901" style="width: 901px;"></div></span>
    //         </div><!--end widget-span -->
    //         </div><!--end row-->
    //         </div><!--end row-wrapper -->
    //
    //         </div><!--end header -->
    //         </div><!--end header wrapper -->
    //
    //         <div class="body-container-wrapper">
    //             <div class="body-container container-fluid">
    //
    //             <div class="row-fluid-wrapper row-depth-1 row-number-1">
    //             <div class="row-fluid ">
    //             <div class="span6 widget-span widget-type-widget_container " style="" data-widget-type="widget_container" data-x="0" data-w="6">
    //             <span id="hs_cos_wrapper_module_153608350183752" class="hs_cos_wrapper hs_cos_wrapper_widget_container hs_cos_wrapper_type_widget_container" style="" data-hs-cos-general-type="widget_container" data-hs-cos-type="widget_container"></span>
    //             </div><!--end widget-span -->
    //             <div class="span6 widget-span widget-type-widget_container " style="" data-widget-type="widget_container" data-x="6" data-w="6">
    //             <span id="hs_cos_wrapper_module_153608350473454" class="hs_cos_wrapper hs_cos_wrapper_widget_container hs_cos_wrapper_type_widget_container" style="" data-hs-cos-general-type="widget_container" data-hs-cos-type="widget_container"><div id="hs_cos_wrapper_widget_1537286594924" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="" data-hs-cos-general-type="widget" data-hs-cos-type="module">
    //             <img src="https://cdn2.hubspot.net/hub/4853026/hubfs/HubspotTest1__232322__1/3__eVoucher.png?t=1537286467740&amp;width=460&amp;name=3__eVoucher.png" alt="3__eVoucher" width="460" style="width: 460px;"></div></span>
    //         </div><!--end widget-span -->
    //         </div><!--end row-->
    //         </div><!--end row-wrapper -->
    //
    //         <div class="row-fluid-wrapper row-depth-1 row-number-2">
    //             <div class="row-fluid ">
    //             <div class="span12 widget-span widget-type-widget_container " style="" data-widget-type="widget_container" data-x="0" data-w="12">
    //             <span id="hs_cos_wrapper_module_153635547877822" class="hs_cos_wrapper hs_cos_wrapper_widget_container hs_cos_wrapper_type_widget_container" style="" data-hs-cos-general-type="widget_container" data-hs-cos-type="widget_container"><div id="hs_cos_wrapper_widget_1537286639006" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="" data-hs-cos-general-type="widget" data-hs-cos-type="module">
    //             <video width="600" height="338" style="width: 600px; height: 338px;" src="https://cdn2.hubspot.net/hubfs/4853026/HubspotTest1__232322__1/2__aav1.mp4?t=1537286467740" controls="controls"></video></div></span>
    //         </div><!--end widget-span -->
    //         </div><!--end row-->
    //         </div><!--end row-wrapper -->
    //
    //         </div><!--end body -->
    //         </div><!--end body wrapper -->
    //         <div class="footer-container-wrapper">
    //             <div class="footer-container container-fluid">
    //             </div>
    //             </div>`;
    //
    //
    //         storyboard_VM._shortIdEPMapping = mapping;
    //
    //         var shell = new dexit.scm.cd.HsCMSShell({});
    //         //TODO: stub
    //         //sandbox.stub(storyboard_VM,findLongId);
    //         self.pageDetailsCache = pageDetails;
    //         var parsed = shell._prepareRegionsAndTemplate(bodyStr,pageDetails, 'tp123');
    //
    //
    //         should.exist(parsed);
    //         parsed.should.have.property('regions').that.is.an('array').with.lengthOf(4);
    //         parsed.should.have.property('html').that.is.a('string');
    //
    //         done();
    //
    //
    //         debugger;
    //     });
    //
    //
    //
    // });
})();
