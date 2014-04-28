'using strict';

/* Directives */


angular.module('workbenchFilters', [])
	.filter('address', function() {
		return function(val, opts, bigendian) {
			var buf = [];
			bigendian = bigendian || false;

			switch (opts.encoding || "hex") {
				case "hex":
					buf = _.map(
							_.filter(parseInt(val, 10).toString(16).split(/(..)/),
							function(x) { return x !== ''; }),
						function(x) { return ("0" + x).substr(-2); });

					if (bigendian) {
						return (buf.reverse().join(":") + ":00:00:00").substr(11);
					} else {
						return ("00:00:00:" + buf.join(":")).substr(-11);
					}
					break;

				case "bytes":
					buf = _.map(
							_.filter(parseInt(val, 10).toString(16).split(/(..)/),
							function(x) { return x !== ''; }),
						function(x) { return parseInt(x, 16); });

					return (bigendian ? buf.reverse() : buf).join(".");

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
