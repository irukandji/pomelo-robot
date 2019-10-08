/* Generic logging module.
 *
 * Log Levels:
 * - 3 (Debug)
 * - 2 (Info)
 * - 1 (Warn)
 * - 0 (Error)
 */

var Logger = function(log_level) {
  this._log_level = log_level ? log_level : 2;
};

Logger.prototype = {
  _timestamp: function(msg) {
    var now = new Date();
    return now.toLocaleString('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}) + "." + now.getMilliseconds();
  },
	set:function(level){
		this._log_level = level;
	},
  debug: function(msg) {
    if (this._log_level < 3) { return; }
    console.info("[" + this._timestamp() + "] DEBUG: " + msg);
  },

  isDebug: function(msg) {
    if (this._log_level < 3) { return false; } else {return true;}
  },
  
  info: function(msg) {
    if (this._log_level < 2) { return; }
    console.info("[" + this._timestamp() + "] INFO: " + msg);
  },

  warn: function(msg) {
    if (this._log_level < 1) { return; }
    console.warn("[" + this._timestamp() + "] WARN: " + msg);
  },

  error: function(msg) {
    if (this._log_level < 0) { return; }
    console.error("[" + this._timestamp() + "] ERROR: " + msg);
  }
};

var instance = new Logger();

getLogger = function() {
	return instance();
};

exports.Logger = instance;
