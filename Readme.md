# ps-ice4mm application


## Setup

### Run
npm install


grunt

### Test
npm install

bower install 

grunt

grunt-test



## Running in production

### User Sessions
It is recommended to use the redis based session store in production.
The environment variable to set this is REDIS_SESSION

### Proxy Support
If running behind a reversed proxy; the TRUST_PROXY_IP should be set to the IP address of the proxy this service is running behind. 

If TRUST_PROXY_IP is not set, the Facebook app will not correctly pick up the x-forwarded-for x-forwarded-host HTTP headers, and the redirect_uri will be set to the Heroku app hostname not the hostname as seen by the end user.


### Event Config for A1

    monitorEventId : process.env.MONITOR_EVENT_ID || '916aec0a-0a4a-4c60-b77a-c65a537af829',

    monitorEventKey : process.env.MONITOR_EVENT_KEY || '09e7da52-df7b-4219-8bc0-6d4509a587d3'