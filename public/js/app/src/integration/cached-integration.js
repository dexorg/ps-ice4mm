/**
 * Copyright Digital Engagement Xperience 2018
 *
 */
/* global: dexit, lscache */

dexit.app.ice.edu.integration.tp ={};
dexit.app.ice.edu.integration.tp.retrieveChannelInstanceFromTPCached = function(tpId, providedCacheTime, callback) {

    function retrieveData(tpId, cb) {
        dexit.app.ice.integration.tpm.retrieveChannelInstanceFromTP(tpId, function(err, channelData) {
            if (err) {
                return cb(err);
            }
            channelData = channelData || [];
            cb(null, channelData);
        });
    }

    //10 minutes for cache time
    var cacheTime = providedCacheTime || 10;


    if (!lscache.supported()) { //skip cache if cache is not supported by browser
        retrieveData(tpId,callback);
        return;
    }else {
        lscache.setBucket('ice4m');
    }

    //check cache
    var key =  'tp-channel-data:'+tpId;
    var item = lscache.get(key);
    if (item){
        console.warn('cache hit!');
        callback(null, item);
    } else {
        console.warn('cache miss!');
        retrieveData(tpId, function(err, channelData){
            if (err){
                callback(err);
            }
            lscache.set(key,channelData,cacheTime);
            callback(null,channelData);
        });
    }


};
