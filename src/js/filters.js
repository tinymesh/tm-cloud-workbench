'using strict';

/* Directives */


angular.module('workbenchFilters', [])
	.filter('address', function() {
		return function(val, opts, bigendian) {
			var buf;
			bigendian = bigendian || false;

			switch (opts.encoding || "hex") {
				case "hex":
					buf = ["00", "00", "00", "00"];
					_.each(_.filter(parseInt(val, 10).toString(16).split(/(..)/),
							function(x) { return x !== ''; }),
						function(x) {
							if (bigendian) {
								buf.push(("0" + x).substr(-2));
							} else {
								buf.unshift(("0" + x).substr(-2));
							}
						});

					return (bigendian ? buf.slice(-4, 7) : buf.slice(0, 4)).join(":");

				case "bytes":
					buf = [0, 0, 0, 0];
					_.each(_.filter(parseInt(val, 10).toString(16).split(/(..)/),
							function(x) { return x !== ''; }),
						function(x) {
							if (bigendian) {
								buf.push(parseInt(x, 16));
							} else {
								buf.unshift(parseInt(x, 16));
							}
						});

					return (bigendian ? buf.slice(-4, 7) : buf.slice(0, 4)).join(".");

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
