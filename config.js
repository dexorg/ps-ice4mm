/**
 * Copyright Digital Engagement Xperience
 */

/*jslint node: true */
'use strict';

var config = {
    tpm: {
        datastore: process.env.TPM_DATASTORE || 'tpm_live',
        defaultDeviceCategory: process.env.TPM_DEFAULT_DEVICE_CATEGORY || '101'
    },
    reportEngine: {
        host: process.env.REPORTING_ENGINE || 'icep-re-latest.herokuapp.com',
        port: process.env.REPORTING_ENGINE_PORT || 80
    },
    fb: {
        appGroupPrivacy: process.env.appGroupPrivacy || 'closed',
        appAdminUserId: process.env.appAdmin || '58022333',
        callbackURL: process.env.CALLBACK_URL_FB || '/facebook/login/callback',
        scope: process.env.FB_PERMISSIONS_SCOPE || 'public_profile, manage_pages, publish_pages, publish_actions', //'public_profile, manage_pages, publish_pages, user_groups, publish_actions'
    },
    scPersistInstance: {
        datastore: 'sc_instance',
        datastoreType: process.env.PERSIST_DATASTORE_TYPE || 'cassandra',
        cassandra : {
            contactPoints: [process.env.PERSIST_CASSANDRA_URL || '127.0.0.1'],
            keyspace: process.env.PERSIST_CASSANDRA_KEYSPACE || 'sc_data'
        }
    },
    sdk: {
        clientLib: process.env.SDK_CLIENT_LIB || '//releases.dexit.co/dex-sdk/master/dex-sdk.js'
    },
    scpm:{
        clientLib: process.env.SC_PLAYBACK_CLIENT_LIB || '//releases.dexit.co/sc-playback/master/sc-playback.js',
        enableProxy: process.env.ENABLE_PROXY || true,
        proxyMaxSockets: process.env.MAX_SOCKETS_FOR_PROXY || 'Infinity', //This is reserved value for the Node http agent
        proxy: {
            sb: {
                config: 'sb'
            },
            cb: {
                config: 'cb'
            },
            lpm: {
                config: 'lpm'
            },
            upm: {
                config: 'profileUser',
                tokentype:'system'
            },
            tpm: {
                config: 'tpm'
            },
            scp: {
                config: 'scp'
            },
            scprm: {
                config: 'scprm'
            },
            eb: {
                config: 'eb'
            },
            ep: {
                config: 'ep'
            }
        },
        dexSdkMode:process.env.DEX_SDK_MODE || 'EP', //can be legacy or EP
        fetchOnLoad: process.env.DEX_SDK_FETCH_SCHEDULE_ON_LOAD || false,
        clearCookie: process.env.CLEAR_COOKIE || true,
        monitorEventId : process.env.MONITOR_EVENT_ID || '0534eee1-c9b3-46fa-949e-1d4cb4cd969d',
        monitorEventKey : process.env.MONITOR_EVENT_KEY || '72739b80-3525-4d16-bb37-c0e912de9540',
        epEventId:  process.env.EP_EVENT_ID || 'b9022f3f-cf28-43e5-b972-8e1e89bee208',
        epEventKey: process.env.EP_EVENT_KEY || '05fcfd31-23df-4b2d-90d5-1c7ebd51e7d3'
    },
    templates: {
        host: process.env.TEMPLATE_HOST || 'resource.dexit.co',
        port: process.env.TEMPLATE_PORT || 80,
        path: process.env.TEPMLATE_PATH || '/epTemplates',
        names: process.env.TEMPLATE_NAME || ['defaultEPTemplate.json']
    },
    fm:{
        s3:{
            aws_key : process.env.AWS_ACCESS_KEY_ID || 'dummy',
            aws_secret: process.env.AWS_SECRET_ACCESS_KEY || 'dummy',
            bucketsDomain:process.env.S3_BUCKETS_DOMAIN || 'dexit.co'
        },
        tagsDataStore :process.env.FILES_DATA_STORE||'fm_main'
    },
    security: {
        personMode: process.env.PERSON_MODE || false, //if set use person
        user: process.env.SCP_SYSTEM_USER,
        password: process.env.SCP_SYSTEM_PASSWORD,
        csp: {
            scriptSrc: process.env.DEX_APP_SEC_SCRIPT_SRC || 'www.gstatic.com',
            styleSrc: process.env.DEX_APP_SEC_STYLE_SRC || 'www.gstatic.com,releases.dexit.co'
        }
    },
    eb_url: process.env.EB_URL || 'eb.dexit.co',
    dcm: {
        clientLib: process.env.DCM_CLIENT_LIB || '//releases.dexit.co/dcm/0.12.3/ps-dcm.js'
    },
    ice: {
        clientLib: process.env.ICE_CLIENT_LIB || '//releases.dexit.co/ice/2.11.0/ps-ice.js'
    },
    // ice4e: {
    //     clientLib: process.env.ICE4E_CLIENT_LIB || '/js/app/ps-ice4mm.js',
    //     logoutView: process.env.LOGOUT_FRAG || '/html/logout.html'
    // },
    ucc: {
        clientLib: process.env.UCC_CLIENT_LIB || '//releases.dexit.co/ucc/0.3.23/ps-ucc.js', //'/js/lib/ucc-main.js',
        assets_prefix: process.env.UCC_ASSETS_PREFIX || '//releases.dexit.co/ucc/0.3.23/assets'
    },
    securedSchedule: process.env.SECURED_SCEHDULE || false, //TODO: Should be removed once scc schedule authorization is resolved.
    login: {
        enforceFBLogin: process.env.ENFORCE_FB_LOGIN || false,
        hideDEXLogin: process.env.HIDE_DEX_LOGIN || false
    },

    proxyIP: process.env.TRUST_PROXY_IP || '127.0.0.1',
    defaultRole: process.env.DEFAULT_ROLE,
    enableBehaviour : process.env.COURSE_CONTENT_BEHAVIOUR || true,
    assetsResource: process.env.ASSETS_RESOURCE || 'public/assets',
    configEnvironments: {
        latest: {
            fb: {
                parentAppId: process.env.FACEBOOK_PARENT_CLIENT_ID || '1496063827342488'
            }
        }
    },
    demo: {
        autoScheduleNew: process.env.demo_autoschedulenew || 'disabled',
        scId: process.env.demo_sc_id || 'cd4ebfba-7922-45e4-9484-0de46e878637',
        layoutId: process.env.demo_layout_id || '9882bff8-8e4b-40e4-b478-a02bbb1106ed',
        touchpoints: process.env.demo_touchpoints || ['15251567-d1d7-4994-9556-75fcfd061d47'],
        eventId: process.env.event_id || 'e970af5c-2a00-47fd-a0f9-bd8a52d2c322',
        repo: process.env.demo_repo || 'knustedugh',
        tenant: process.env.demo_tenant || 'knust.edu.gh'
    },
    engagementDb: {
        datastore: process.env.ENGAGEMENT_DB_DATASTORE || 'engagement_db'
    },
    ice4mURL: process.env.ICE4M_URL || 'https://ice4mm.herokuapp.com',
    intelligenceSchema: '{"$schema":"http://json-schema.org/draft-04/schema#","type":"object","properties":{"questionnaireId":{"type":"string"},"responses":{"type":"array","items":{"type":"object","properties":{"id":{"type":"string"},"questionnaireId":{"type":"string"},"createTime":{"type":"string"},"updateTime":{"type":"string"},"user":{"type":"object","properties":{"id":{"type":"string"},"name":{"type":"string"}},"required":["id","name"]},"answers":{"type":"array","items":{"type":"string"}}},"required":["id","questionnaireId","createTime","answers"]}},"nextOffset":{"type":"string"}},"required":["questionnaireId","responses"]}',
    am: {
        userRegistration: {
            enterEmailText: process.env.USER_REGISTRATION_ENTER_EMAIL_TEXT || 'Company Email (User Name)*',
            confirmEmailText: process.env.USER_REGISTRATION_CONFIRM_EMAIL_TEXT || 'Confirm Company Email*',
            userRegistrationDescriptionText: process.env.USER_REGISTRATION_DESCRIPTION_TEXT|| 'Please fill in the fields below to create an account. <b>Please use your your company email account.</b>'
        },
        dataStore : process.env.AM_DATASTORE || 'am_developer'
    },
    openidm: {
        host: process.env.OPENIDM_HOST || '54.172.25.153',
        port: process.env.OPENIDM_PORT || '18080',
        useSSL: process.env.ENABLE_SSL || false,
        userName: process.env.OPENIDM_USERNAME || 'name',
        password: process.env.OPENIDM_PASSWORD || 'password'
    },
    epm: {
        enableEPDispatch: process.env.ENABLE_EP_DISPATCH,

    },
    epDispatcher: {
        host: process.env.EP_DISPATCH_HOST || 'ep-dispatcher-latest.herokuapp.com',
        port: process.env.EP_DISPATCH_PORT || 80,
        ssl: process.env.EP_DISPATCH_SSL || false,
    },
    bcp: {
        permissionCacheTTL: parseIntParam(process.env.PERMISSION_CACHE_TTL,500),
        bciCacheTTL: process.env.BCI_CACHE_TTL,
        updateCacheOnSave: process.env.BCI_UPDATE_CACHE_ON_SAVE,
        redisCache: {
            url: process.env.REDIS_URL
        },
        //bcp should convert these properties of behaviours to/from string/obj for storage/retrieval
        behaviourStringObjParams: process.env.BC_BEHAVIOUR_STR_OBJ_PARAMS || 'ds,parameters,display,body,input_parameters,output_parameters',
    },
    //if we need to load local BC definition file, set this configuration, otherwise BC definition will be loaded from theme file by default
    localBCDefinition: process.env.LOCAL_BC_DEFINITION || false,
    ice4m: {
        clientLib: (process.env.ICE4M_CLIENT_LIB || process.env.ICE4E_CLIENT_LIB) || '/js/app/ps-ice4mm.js',
        cssLib: process.env.ICE4M_CSS_LIB || '//releases.dexit.co/dex-css-master/master/ice4m_main.css',
        assets_prefix: process.env.ICE4M_ASSETS_PREFIX || '/ice4m',  //TODO: remove old config (can be removed after rest of css is consolidated)
        supersetUr: process.env.SUPERSET_URL || 'https://supertesta-herokuapp.com'
    },
    epmEm: {
        datastore: process.env.METRIC_DB_DATASTORE || 'metric_db'
    },
    bcc: {
        channelUrl: process.env.DEFAULT_CHANNEL_URL || 'ps-ice4mm.herokuapp.com/customer-portal',
        clientLib: process.env.BCC_CLIENT_LIB || '//releases.dexit.co/bcc/1.2.9/ps-bcc.js', //,'/js/lib/bcc-main.js',
        assets_prefix: process.env.BCC_ASSETS_PREFIX || '//releases.dexit.co/bcc/1.0.2/assets',
        previewUrl: process.env.BCC_PREVIEW_URL || 'https://dex-bcc-preview-latest.herokuapp.com/'
    },
    scm: {
        validIntelligenceTypes: process.env.VALID_INTELLIGENCE_TYPES || 'concept,information,engagementpattern,engagementmetric,report'
    },
    sb:{
        digitalServiceStore: process.env.DS_DATASTORE || 'digital_service'
    },
    cms: {
        supportedModes: [{id:'internal', name:'GrapesJS'},{id:'external-HubSpotCOS',name:'HubSpot'},{id:'external-wch',name:'IBM WCH'}],
        defaultCMSMode: process.env.DEFAULT_CMS_MODE || 'external-wch',
        modes: [{
            mode: 'external',
            moduleName:'HsCMSShell',
            name: 'external-HubSpotCOS',
            params: {
                name: 'HubSpotCOS',
                moduleName:'HsCMSShell',
                tableId: 849569,
                url:'https://app.hubspot.com/reports-dashboard/4853026/marketing',
                epModuleId:3584470
            },
            integration: {
                scopes:'contacts content files hubdb',
                clientId: process.env.HUBSPOT_APP_CLIENT_ID || 'f31288c2-c11b-4b7e-9881-ce139f6eea5d',
                clientSecret: process.env.HUBSPOT_APP_CLIENT_SECRET || '859e93fd-0fe1-4a7b-9b72-2797e2c353cc',
                apiKey: process.env.HuBSPOT_APP_API_KEY || 'd2506db8-38ee-400c-a52d-128ac45e363c',
                host: 'api.hubapi.com',
                protocol:'https://',
                portalId: process.env.HUBSPOT_PORTAL_ID || '4853026',
                mmUploadModule: 'handleFilesHubSpot'
            }
        }, {
            mode: 'external',
            name: 'external-wch',
            moduleName:'WchCMSShell',
            params: {
                name: 'WatsonContentHub',
                moduleName:'WchCMSShell',
                url:'https://www.customer-engagement.ibm.com/content-hub/Landing-Pages',
                tenantId: process.env.WCH_TENANT_ID || '1a63c84f-0593-4e6c-9bbb-99472fcec8d6',
                contentRegionTypeId: process.env.WCH_CONTENT_REGION_TYPE_ID || '9128538d-7fae-4041-a2a0-2754c0ef5a95',
                page: { // configurations to put into body when making content for pageId
                    layoutId: process.env.WCH_PAGE_LAYOUT_ID || 'lp-blog-layout',
                    contentTypeId: process.env.WCH_PAGE_CONTENT_TYPE_ID || '3ada037d-e4b7-4ed0-9aef-c72c176a4017',
                    parentId: '',
                    wchPreviewUrl: process.env.WCH_PREVIEW_URL || 'https://m7.digitalexperience.ibm.com'
                }
            },
            integration: {
                requiresTokenExchange: true,
                apiKey: process.env.IBM_PLATFORM_API_KEY,
                tokenUrl: 'https://iam.bluemix.net/identity/token',
                tokenGrantType: 'urn:ibm:params:oauth:grant-type:apikey',
                cos: {
                    endpoint: process.env.COS_ENDPOINT || 'https://s3.us-east.objectstorage.softlayer.net',
                    apiKeyId: process.env.IBM_PLATFORM_API_KEY,
                    ibmAuthEndpoint: 'https://iam.bluemix.net/identity/token',
                    serviceInstanceId: process.env.IBM_PLATFORM_SERVICE_INSTANCE_ID || 'ServiceId-80eb2fa2-02da-4468-8a1a-ad3bb542ba52'
                },
                wchPreviewAuthUrl: process.env.WCH_PREVIEW_AUTH_URL || 'https://my7-preview.digitalexperience.ibm.com/api/1a63c84f-0593-4e6c-9bbb-99472fcec8d6/login/v1/basicauth',
                wchPreviewUrl: process.env.WCH_PREVIEW_URL || 'https://my7.digitalexperience.ibm.com',
                wchUrl: process.env.WCH_API_URL || 'https://my7.digitalexperience.ibm.com/api/1a63c84f-0593-4e6c-9bbb-99472fcec8d6',
                wchUserName: process.env.WCH_USERNAME ||  'shawn.talbot2@dexit.co',
                wchPassword:  process.env.WCH_PASSWORD ||'ccT4QpPHGzZUkBj',
                wchSitesPath: process.env.WCH_SITE_PATH || '/api/1a63c84f-0593-4e6c-9bbb-99472fcec8d6/authoring/v1/sites/default/pages',
                bucketName: process.env.IBM_BUCKET_NAME || 'wch-dex-integration',
                wchPageContentTypeId: process.env.WCH_PAGE_CONTENT_TYPE_ID || '3ada037d-e4b7-4ed0-9aef-c72c176a4017pre',
                // wchPageContentTypeId: '9c6ec42a-1326-4813-86aa-ed98b201c092' || process.env.WCH_PAGE_CONTENT_TYPE_ID,
                mmUploadModule: 'handleFilesWatson',
                host: process.env.WCH_HOST || 'my7.digitalexperience.ibm.com',
                protocol:'https://',
                port:443
            }
        }, {
            mode: 'internal',
            name:'internal',
            params: {
                name: 'GrapesJS'
            }
        }]
    },
    availableBI: (process.env.AVAILABLE_BI ? parseAvailableBI(process.env.AVAILABLE_BI) : require('./config/default_available_bi')),
    scemTpc: {
        deliverInterval: 5000
    },
    socialPreview: {
        cacheTTL: parseIntParam(process.env.SOCIAL_PREVIEW_RESULT_CACHE_TTL, 180000), //default to 3 minutes
        clientResultCheckInterval: parseIntParam(process.env.SOCIAL_PREVIEW_CLIENT_CHECK_INTERVAL,3000) //default to 3 seconds
    },
    cognos: {
        enabled: process.env.ENABLE_COGNOS_DASHBOARD || false,
        dde_base_url: process.env.DDE_BASE_URL || 'https://dde-us-south.analytics.ibm.com',
        dde_session_uri: (process.env.DDE_BASE_URL || 'https://dde-us-south.analytics.ibm.com') + '/daas/v1/session',
        dde_client_id: process.env.DDE_CLIENT_ID,
        dde_client_secret: process.env.DDE_CLIENT_SECRET,
        web_domain: process.env.APP_BASE_URL ||  ('https://localhost:'+process.env.PORT)
    },
    tpAllocatorDatastore: process.env.TP_ALLOCATOR_DS || 'engagement_pattern_system',
    brLink: process.env.BR_UI_LINK || 'https://kie-wb1.dexit.co/business-central/kie-wb.jsp?standalone=&perspective=LibraryPerspective',
    brm: {
        baseWBUrl: process.env.BRM_BASE_URL || 'https://kie-wb1.dexit.co/business-central/rest',
        baseKieServerUrl: 'https://kie-server1.dexit.co/kie-server/services/rest/server/',
        containerId: 'br1_1.0.0-SNAPSHOT'
    },
    learning:{
        watsonStudioUrl: process.env.WATSON_STUDIO_URL || 'https://dataplatform.cloud.ibm.com/registration/steptwo?redirectIfAccountExists=True'
    }
};


function parseIntParam(envValue, defaultValue) {
    if (!envValue) {
        return defaultValue; //short-circut
    }
    let val = 0;
    try {
        val = parseInt(envValue);
    } catch (e) {
        val = defaultValue;
    }
    return val;
}

function parseAvailableBI(str) {
    var parsed = [];
    try {
        parsed = JSON.parse(str);
    } catch (e) {
        console.warn('invalid env:AVAILABLE_BI passed');
    }

    return parsed;
}


//Export the endpoints
module.exports = config;
