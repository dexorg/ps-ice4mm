/**
 * @copyright Digital Engagement Xperience Inc 2019
 */


const KBSqlDao = require('dex-dao').kb.SqlDao;
const SystemTokenUtil = require('dex-authentication').util.SystemTokenUtil;
const {promisify} = require('util');
const errors = require('dex-errors');
const _ = require('lodash');
/**
 * @class CubeMng
 */
class CubeMng {


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
            id: 'id',             // stored as int - unique, auto-generated
            dimensions: 'dimensions', // stored as string comma seperated
            name: 'name', // stored as string
            description: 'description', // stored as string
            tenant: 'tenant',            // stored as string
            measure: 'measure',            // stored as string
            options: 'options',       //stored as string
            creation_time: 'creationTime',    // store as int
            status: 'status' //stored as string
        };
        this._cubeDao = mocks.cubeDao || new KBSqlDao(config, dataStore,'cube_config',map);

        this._insertAsync= promisify(this._cubeDao.insert).bind(this._cubeDao);
        this._selectAsync = promisify(this._cubeDao.select).bind(this._cubeDao);



        this._getSystemAuthTokenAsync = promisify(this._sysTokenUtil.getSystemAuthToken).bind(this._sysTokenUtil);
    }

    async add(tenant, params){

        if (!params){
            return new errors.Validation('params required');
        }

        let token = await this._getSystemAuthTokenAsync();

        let opts = (params.rollup ? {rollup: params.rollup} : {});

        let data = [{
            tenant:tenant,
            name: params.name,
            description: params.description || '',
            dimensions: params.dimensions,
            measure: params.metric,
            options: JSON.stringify(opts),
            status: 'pending'
        }];

        //TODO: call druid

        return await this._insertAsync(token,data);
    }


    async list(tenant, params) {
        let token = await this._getSystemAuthTokenAsync();

        let query = {
            tenant:tenant
        };

        let toReturn =  await this._selectAsync(token,query);

        return _.map(toReturn, (obj) => {
            return _.omit(obj, 'tenant');
        });


    }


}

/**
 *
 * @type {CubeMng}
 */
module.exports = CubeMng;
