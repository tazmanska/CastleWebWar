var PowerMeter = function (element) {

    var elem = $(element);
    var _min = 0;
    var _max = 100;

    var elemCover = elem.find('.progressbar-cover');
    var elemValue = elem.find('.progressbar-value');
    
    var _enabled = false;

    var clickArea = $(document);
    clickArea.mousedown(function () {
        if (_enabled) {
            _start();
        }
    });

    clickArea.mouseup(function () {
        _stop();
    });

    var _running = false;

    var _start = function () {
        _running = true;
        setTimeout(animator, updatesPerSecond);
    };

    var _stop = function () {
        if (_running) {
            _running = false;
            if (_callback) {
                _callback(elem.val());
            }
        }
    };

    var interval = 2, updatesPerSecond = 1000 / 60;

    var _val = 0;

    var animator = function () {
        if (!_running) {
            return;
        }

        var val = _val + interval;
        if (val >= _max) {
            val = 0;
        }

        _value(val);

        setTimeout(animator, updatesPerSecond);
    };

    var _value = function (val) {
        if (val == null) {
            return _val;
        }
        _val = val;
        var bkcolor = (_val < 25) ? '#0f0' : '#ff0';
        if (_val > 75) { bkcolor = '#f00'; }
        elemCover.css('bottom', _val + '%');  // the cover controls the bar height
        elemValue.css('backgroundColor', bkcolor); // value contains the bar color
    }

    var _callback = null;

    return {
        enable: function (enabled) {
            _enabled = enabled;
        },

        reset: function () {
            _value(0);
        },

        power: function () {
            return _value(null);
        },

        callback: function (method) {
            _callback = method;
        },
    };
};