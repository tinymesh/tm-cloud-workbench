angular.module('workbenchQuery', ['ngRoute'])
	.value('version', '0.0.1')
	.controller('wbQueryCtrl', function($scope, $location, tmMsgQuery) {
		$scope.date = {
			from: $location.$$search['date.from'] || new Date().toISOString().substr(0, 11) + "00:00",
			to:   $location.$$search['date.to'] || new Date().toISOString().substr(0, 16)
		};
		$scope.sort = {
			by: ($location.$$search['sort.by'] || "datetime").split(','),
			reverse: "true" === $location.$$search['sort.reverse'] || "false",
		};

		$scope.filter = {
			omit: _.filter(($location.$$search['filter.omit'] || "").split(","), function(x) { return x !== ""; }),
			pick: _.filter(($location.$$search['filter.pick'] || "").split(","), function(x) { return x !== ""; })
		};

		$scope.q = ["type:event"];
		$scope.query = ($location.$$search['query'] || "type:event").split(",");
		$scope.result = undefined;

		var updateURL = function(q) {
			var update = function(k) {
				if($location.$$search[k] !== q[k]) {
					$location.search(k, q[k]);
				}
			};

			update('date.from');
			update('date.to');
			update('filter.pick');
			update('filter.omit');
			update('sort.by');
			update('sort.reverse');
			update('query');
		};

		$scope.qstatus = 0;
		$scope.run = function(sel) {
			var network = sel[0] || "",
				device = sel[1] || "",
				sanetize = function(d) { return d.replace(/(?:^,|,$)/, ''); },
				q;

			$scope.q = {
				'network': network,
				'device': device,
				'date.from': $scope.date.from,
				'date.to': $scope.date.to,
				'filter.omit': sanetize($scope.filter.omit.toString()),
				'filter.pick': sanetize($scope.filter.pick.toString()),
				'query':       sanetize($scope.query.toString()),
				'sort.by':     sanetize($scope.sort.by.toString()),
				'sort.reverse': $scope.sort.reverse ? "true" : "false"
			};

			updateURL($scope.q);
			$scope.qstatus = 1;
			$scope.result = tmMsgQuery.query($scope.q);
			$scope.result.$promise.then(function() {
				$scope.qstatus = 2;
			});

			if ('graph' === $scope.subtab) {
				$scope.result.$promise.then($scope.rickshaw);
			}
		};

		$scope.next = function() {
			$scope.q = _.extend($scope.q, $scope.result.meta.query.next);

			updateURL($scope.q);
			$scope.result = tmMsgQuery.query($scope.q);
		};

		$scope.prev = function() {
			$scope.q = _.extend($scope.q, $scope.result.meta.query.prev);

			updateURL($scope.q);
			$scope.result = tmMsgQuery.query($scope.q);
		};


		var palette = new Rickshaw.Color.Palette( { scheme: 'spectrum14' } );
		var ticksTreatment = 'glow';

		var RenderControls = function(args) {

			console.log('a', args);
			this.initialize = function() {
				console.log('b', args);

				this.element = args.element;
				this.graph = args.graph;
				this.settings = this.serialize();

				this.inputs = {
					renderer: this.element.elements.renderer,
					interpolation: this.element.elements.interpolation,
					offset: this.element.elements.offset
				};

				console.log(this.element);
				this.element.addEventListener('change', function(e) {
					console.log("i changed...");

					this.settings = this.serialize();

					if (e.target.name === 'renderer') {
						this.setDefaultOffset(e.target.value);
					}

					this.syncOptions();
					this.settings = this.serialize();

					var config = {
						renderer: this.settings.renderer,
						interpolation: this.settings.interpolation
					};

					if (this.settings.offset === 'value') {
						config.unstack = true;
						config.offset = 'zero';
					} else if (this.settings.offset === 'expand') {
						config.unstack = false;
						config.offset = this.settings.offset;
					} else {
						config.unstack = false;
						config.offset = this.settings.offset;
					}

					this.graph.configure(config);
					this.graph.render();

				}.bind(this), false);
			};

			this.serialize = function() {

				var values = {};
				var pairs = $(this.element).serializeArray();

				pairs.forEach( function(pair) {
					values[pair.name] = pair.value;
				} );

				return values;
			};

			this.syncOptions = function() {

				var options = this.rendererOptions[this.settings.renderer];

				Array.prototype.forEach.call(this.inputs.interpolation, function(input) {

					if (options.interpolation) {
						input.disabled = false;
						input.parentNode.classList.remove('disabled');
					} else {
						input.disabled = true;
						input.parentNode.classList.add('disabled');
					}
				});

				Array.prototype.forEach.call(this.inputs.offset, function(input) {

					if (options.offset.filter( function(o) { return o === input.value; } ).length) {
						input.disabled = false;
						input.parentNode.classList.remove('disabled');

					} else {
						input.disabled = true;
						input.parentNode.classList.add('disabled');
					}

				}.bind(this));

			};

			this.setDefaultOffset = function(renderer) {

				var options = this.rendererOptions[renderer];

				if (options.defaults && options.defaults.offset) {

					Array.prototype.forEach.call(this.inputs.offset, function(input) {
						if (input.value === options.defaults.offset) {
							input.checked = true;
						} else {
							input.checked = false;
						}

					}.bind(this));
				}
			};

			this.rendererOptions = {

				area: {
					interpolation: true,
					offset: ['zero', 'wiggle', 'expand', 'value'],
					defaults: { offset: 'zero' }
				},
				line: {
					interpolation: true,
					offset: ['expand', 'value'],
					defaults: { offset: 'value' }
				},
				bar: {
					interpolation: false,
					offset: ['zero', 'wiggle', 'expand', 'value'],
					defaults: { offset: 'zero' }
				},
				scatterplot: {
					interpolation: false,
					offset: ['value'],
					defaults: { offset: 'value' }
				}
			};

			this.initialize();
		};

		$scope.graph = undefined;
		$scope.rickshaw = function(data) {
			$('#legend').empty();
			$('#chart_container').html(
				'<div id="chart"></div><div id="timeline"></div><div id="preview"></div>'
			);

			if (0 === data.result.length) {
				$scope.qstatus = -1;
				return false;
			}

			$scope.graph = new Rickshaw.Graph( {
				element: document.getElementById("chart"),
				width: 830,
				height: 370,
				renderer: "line",
				stroke: true,
				preserve: true,
				series: _.map($scope.filter.pick, function(pick) {
					return {
						color: palette.color(),
						data: _.map(data.result, function(m) { return {x: new Date(m.datetime).getTime() / 1000, y: m['proto/tm'][pick]}; }),
						name: pick
					};
				})
			} );

			var xAxis = new Rickshaw.Graph.Axis.Time( {
				graph: $scope.graph,
				ticksTreatment: ticksTreatment,
				timeFixture: new Rickshaw.Fixtures.Time.Local()
			} );

			var yAxis = new Rickshaw.Graph.Axis.Y( {
				graph: $scope.graph,
				tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
				ticksTreatment: ticksTreatment
			} );

			$scope.graph.render();

			var preview = new Rickshaw.Graph.RangeSlider.Preview( {
				graph: $scope.graph,
				element: document.getElementById('preview'),
			} );

			var hoverDetail = new Rickshaw.Graph.HoverDetail( {
				graph: $scope.graph,
				xFormatter: function(x) {
					return new Date(x * 1000).toString();
				}
			} );

			var annotator = new Rickshaw.Graph.Annotate( {
				graph: $scope.graph,
				element: document.getElementById('timeline')
			} );

			var legend = new Rickshaw.Graph.Legend( {
				graph: $scope.graph,
				element: document.getElementById('legend')
			} );

			var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
				graph: $scope.graph,
				legend: legend
			} );

			var order = new Rickshaw.Graph.Behavior.Series.Order( {
				graph: $scope.graph,
				legend: legend
			} );

			var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight( {
				graph: $scope.graph,
				legend: legend
			} );

			var smoother = new Rickshaw.Graph.Smoother( {
				graph: $scope.graph,
				element: $('#smoother')
			} );


			xAxis.render();
			yAxis.render();

			var controls = new RenderControls( {
				element: document.getElementById('side_panel'),
				graph: $scope.graph
			} );

			var previewXAxis = new Rickshaw.Graph.Axis.Time({
				graph: preview.previews[0],
				timeFixture: new Rickshaw.Fixtures.Time.Local(),
				ticksTreatment: ticksTreatment
			});

			previewXAxis.render();
		};
	});
