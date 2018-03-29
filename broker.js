"use strict";

var cluster = require("cluster"),
    options = {
        namespace: ""
    }

var BrokerMngr = {
    workers: null,
    notifyMaster: function(msg){
        let message = {};
        message[options.namespace] = msg;
        try{
            process.send( message );
        }
        catch(e){
            console.error("Error sending notification to master, perhaps you are running in a single node?", e.message);
        }
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
    getWorkers(){
        if (BrokerMngr.workers === null){
            BrokerMngr.workers = Object.keys(cluster.workers);
        }
        return BrokerMngr.workers;
    },
    broadcast: function(message){
        if (BrokerMngr.isCluster()){
            BrokerMngr.getWorkers().forEach( (k)=> cluster.workers[k].send(message) );
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