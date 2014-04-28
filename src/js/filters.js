'using strict';

/* Directives */


angular.module('workbenchFilters', [])
	.filter('address', function() {
		return function(val, opts, bigendian) {
			var buf = [];
			bigendian = bigendian || false;

			switch (opts.encoding || "hex") {
				case "hex":
					buf.push(("00" + (val & 255)).toString(16).substr(-2, 2));
					buf.push(("00" + (val >> 8)).toString(16).substr(-2, 2));
					buf.push(("00" + (val >> 16)).toString(16).substr(-2, 2));
					buf.push(("00" + (val >> 24)).toString(16).substr(-2, 2));

					return (bigendian ? buf.reverse() : buf).join(":");

				case "bytes":
					buf.push(val & 255);
					buf.push(val >> 8);
					buf.push(val >> 16);
					buf.push(val >> 24);

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
			console.log(val, i, base, parseInt(val, base), ret);

			switch (enc) {
				case "hex":   return ("0" + ret.toString(16)).substr(-2, 2);
				case "ascii": return String.fromCharCode(ret);
				default:      return ret;
			}
		};
	});
