/**
 * @copyright Digital Engagement Xperience Inc 2019
 */


const KBSqlDao = require('dex-dao').kb.SqlDao;
const SystemTokenUtil = require('dex-authentication').util.SystemTokenUtil;
const {promisify} = require('util');
const errors = require('dex-errors');
const _ = require('lodash');
const genUtils = require('ps-ice').generalUtils;
/**
 * @class CubeMng
 */
class DynamicIntelligenceConfiguration {

    /**
     * Constructor
     * @param config
     */
    constructor(config){

        if (!config || !config.rae) {
            throw new errors.Config('missing config.rae');
        }

        let mocks = arguments[1] || {};

        this._sysTokenUtil = mocks.sysTokenUtil || new SystemTokenUtil(config);

        let dataStore = config.rae.datastore;
        let map = {
            id: 'id',             // stored as string - unique
            configuration: 'configuration', // stored as string as a json-blob
            name: 'name', // stored as string
            description: 'description', // stored as string
            tenant: 'tenant',            // stored as string
            creation_time: 'creationTime',    // store as int
            supports_configuration: 'supportsConfiguration',
            update_time: 'updateTime'    // store as int
        };
        this._intelConfigurationDao = mocks._intelConfigurationDao || new KBSqlDao(config, dataStore,'intel_dynamic_config',map);
        this._insertAsync= promisify(this._intelConfigurationDao.insert).bind(this._intelConfigurationDao);
        this._updateAsync= promisify(this._intelConfigurationDao.update).bind(this._intelConfigurationDao);
        this._selectAsync = promisify(this._intelConfigurationDao.select).bind(this._intelConfigurationDao);
        this._getSystemAuthTokenAsync = promisify(this._sysTokenUtil.getSystemAuthToken).bind(this._sysTokenUtil);
    }


    async set(tenant, params){

        if (!params || !params.name){
            return new errors.Validation('params required');
        }

        if (!params.configuration || params.configuration.keys().length < 1) {
            return new errors.Validation('params.configuration required');
        }


        let token = await this._getSystemAuthTokenAsync();

        //let opts = (params.rollup ? {rollup: params.rollup} : {});

        let filter =  {
            tenant: tenant,
            name: params.name
        };


        let data = [{
            description: params.description || '',
            configuration: params.configuration,
            updateTime: Math.round((Date.now() /1000))
        }];


        return await this._updateAsync(token,filter,data);
    }


    async list(tenant, params) {
        let token = await this._getSystemAuthTokenAsync();

        let query = {
            tenant:tenant
        };

        let toReturn =  await this._selectAsync(token,query);

        return _.map(toReturn, (obj) => {
            return _.pick(obj, ['name','description', 'supportsConfiguration']);
        });


    }

    async get(tenant, params) {
        let token = await this._getSystemAuthTokenAsync();

        let query = {
            tenant:tenant,
            supportsConfiguration: 1
        };
        if (params.id) {
            query.id = params.id;
        }
        if (params.name) {
            query.name = params.name;
        }

        let result =  await this._selectAsync(token,query);

        let entry = (result && result.length > 0 ? result[0] : null);

        if (!entry) {
            throw new errors.NotFound('not found');
        }

        if (entry.configuration && _.isString(entry.configuration)) {
            entry.configuration = genUtils.parseJSONSafely(entry.configuration);
        }
        delete entry.tenant;
        return entry;
    }

}

/**
 *
 * @type {DynamicIntelligenceConfiguration}
 */
module.exports = DynamicIntelligenceConfiguration;
