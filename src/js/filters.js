'using strict';

/* Directives */


angular.module('workbenchFilters', [])
	.filter('address', function() {
		return function(val, opts, bigendian) {
			var buf;
			bigendian = bigendian || false;

			addr = _.filter(("00000000" + parseInt(val, 10).toString(16))
					.substr(-8)
					.split(/(..)/), function(x) { return x !== ''; });
			switch (opts.encoding || "hex") {
				case "hex":
					return (bigendian ? addr : addr.reverse()).join(":");

				case "bytes":
					addr = _.map(addr, function(x) { return parseInt(x, 16); });
					return (bigendian ? addr : addr.reverse()).join('.');

				default:
					return val;
			}
		};
	})
	.filter('byte', function() {
		return function(val, i, enc, base) {
			base = parseInt(base || 10, 10);
			if (undefined === val) {
				return "";
			}

			var ret = parseInt(val, base) >> (parseInt(i, 10)*8) & 255;

			switch (enc) {
				case "hex":   return ("0" + ret.toString(16)).substr(-2, 2);
				case "ascii": return String.fromCharCode(ret);
				default:      return ret;
			}
		};
	});
