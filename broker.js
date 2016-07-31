"use strict";

var cluster = require("cluster"),
    options = {
        namespace: ""
    }

var BrokerMngr = {
    notifyMaster: function(msg){
        let message = {};
        message[options.namespace] = msg;
        process.send( message );
    },
    handle: function(msg){
        if (msg[options.namespace]){
            let message = msg[options.namespace],
                args = {};
            if (typeof BrokerMngr.handlers!=="undefined"){
                if (typeof message==="object"){
                    args = message;
                    message = message["msg"];
                }
                if (typeof BrokerMngr.handlers[message] === "function"){
                    BrokerMngr.handlers[message](args);
                }
            }
        }
    },
    workerHandler: function(msg){
        if (msg[options.namespace]){
            let message = msg[options.namespace],
                args = {};
            if (typeof BrokerMngr.workerHandlers!=="undefined"){
                if (typeof message==="object"){
                    args = message;
                    message = message["msg"];
                }
                if (typeof BrokerMngr.workerHandlers[message] === "function"){
                    BrokerMngr.workerHandlers[message](args);
                }
            }
        }
    },
    notifyAll: function(msg){
        let message = {};
        message[options.namespace] = msg;
        if (BrokerMngr.isCluster())
            BrokerMngr.workersDo( (worker)=>worker.send( message ) );
    },
    workersDo: function(cb){
        let workers = Object.keys(cluster.workers);
        workers.forEach( (k,v)=> cb(cluster.workers[k]) );
    },
    workerCount: function(){
        return ( BrokerMngr.isCluster() ) ? Object.keys(cluster.workers).length : 0;
    },
    isCluster: function(){
        return typeof cluster.workers!=="undefined";
    }
};

var Broker = function(namespace){
    if (typeof namespace==="string"){
        options.namespace = namespace;
    }
    return BrokerMngr;
};

module.exports=Broker;