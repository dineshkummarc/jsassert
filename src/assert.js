var assert = function(stmt) {
    var methods = {
        equals: {
            error: function(val) {
                return val + ' did not equal ' + stmt + '!'
            },
            method: function(val) {
                return val == stmt;
            }
        },
        is: {
            error: function() {
                // slow! http://bonsaiden.github.com/JavaScript-Garden/#function.arguments
                var args = Array.prototype.slice.call(arguments);

                if(args.length == 1) {
                    return stmt + ' is not a ' + args[0] + '!';
                }

                return stmt + ' not in types: ' + args.join(', ');
            },
            method: function() {
                // borrowed from RightJS
                var to_s = Object.prototype.toString;

                var typeChecks = {
                    'function': function(val) {
                        return typeof(val) === 'function';
                    },
                    string: function(val) {
                        return typeof(val) === 'string';
                    },
                    number: function(val) {
                        return typeof(val) === 'number';
                    },
                    object: function(val) {
                        return to_s.call(val) === '[object Object]';
                    },
                    array: function(val) {
                        return to_s.call(val) === '[object Array]';
                    }
                };

                for(var i = 0; i < arguments.length; i++) {
                    var value = arguments[i];

                    if(value in typeChecks) {
                        var matched = typeChecks[value](stmt);

                        if(matched) {
                            return true;
                        }
                    }
                }

                return false;
            }
        },
        isDefined: {
            error: function() {
                return 'Expected a defined value, got undefined instead!';
            },
            method: function() {
                // borrowed from RightJS
                return typeof(stmt) !== 'undefined';
            }
        },
        between: {
            error: function(a, b) {
                return stmt + ' was not between ' + a + ' and ' + b + '!'
            },
            method: function(a, b) {
                return a <= stmt && stmt <= b;
            }
        },
        not: {
            error: function() {},
            method: function() {
                invertNext = !invertNext;

                return true;
            }
        }
    };
    var ret = {};
    var invertNext = false;

    var insertMethod = function(name, data) {
        ret[name] = function() {
            var success = data.method.apply(this, arguments);

            if(name != 'not' && invertNext) {
                success = !success;
                invertNext = false;
            }
            
            if(success) {
                return ret;
            }

            // http://aymanh.com/9-javascript-tips-you-may-not-know#assertion
            function AssertionError(message) {
                this.message = message;
            }
            AssertionError.prototype.toString = function () {
                return 'AssertionError: ' + this.message;
            }

            var errorText = data.error.apply(this, arguments);
            throw new AssertionError(errorText);
        }
    }

    for(var methodName in methods) {
        var methodData = methods[methodName];

        insertMethod(methodName, methodData);
    }

    return ret;
}
