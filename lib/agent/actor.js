var util = require('util');
var vm = require('vm');
var EventEmitter = require('events').EventEmitter;
var monitor = require('../monitor/monitor');
var fs = require('fs');
var __ = require('underscore');
const path = require('path');
const envConfig = require(path.join(process.cwd(), "/app/config/env.json"));

var Actor = function(conf,aid) {
  EventEmitter.call(this);
  this.id = aid;
  this.config = conf || {};
  var self = this;
  self.on('start',function(action,reqId){
    monitor.beginTime(action,self.id,reqId);
  });
  self.on('end',function(action,reqId){
    monitor.endTime(action,self.id,reqId);
  });
  self.on('incr',function(action){
    monitor.incr(action);
  });
  self.on('decr',function(action){
    monitor.decr(action);
  });
};
 
util.inherits(Actor, EventEmitter);

var pro = Actor.prototype;

pro.run = function() {
	try
	{
        var sandbox = __.clone(this.config.sandbox);
        sandbox.actor = this;

        const scriptFileName = path.join(process.cwd(), this.config.script ? this.config.script : envConfig.script)
        var script = fs.readFileSync(scriptFileName, 'utf8');
        var compiledScript = new vm.Script(script, {displayErrors :true});
        var context = new vm.createContext(sandbox);
        compiledScript.runInContext(context, {displayErrors :true});
	}
	catch(ex)
	{
	    console.log("[Actor.Run] " + ex.stack);
		this.emit('error',ex.stack);
	}
};

/**
 * clear data 
 *
 */ 
pro.reset = function() {
   monitor.clear();
};

/**
 * wrap setTimeout
 *
 *@param {Function} fn
 *@param {Number} time
 */
pro.later = function(fn,time){
  if (time>0 && typeof(fn)=='function') {
    return setTimeout(fn,time);
  }
};

/**
 * wrap setInterval 
 * when time is Array, the interval time is thd random number
 * between then
 * 
 *@param {Function} fn
 *@param {Number} time
 */
pro.interval = function(fn,time){
  var fn = arguments[0];
  var self = this;
  switch (typeof(time)) {
  case 'number':
    if (arguments[1]>0)	return setInterval(fn,arguments[1]);
    break;
  case 'object':
    var start = time[0], end = time[1];
    var time = Math.round(Math.random()*(end-start) +start);
    return setTimeout(function(){fn(),self.interval(fn,time);},time); 
    break;
  default:
    self.log.error('wrong argument');
    return;
  }
};

/**
 *wrap clearTimeout
 *
 * @param {Number} timerId
 *
 */
pro.clean = function(timerId){
  clearTimeOut(timerId);
}

/**
 *encode message
 *
 * @param {Number} id
 * @param {Object} msg
 *
 */

exports.Actor = Actor;
