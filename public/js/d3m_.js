"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var front = undefined === undefined || Object.keys(undefined).length > 0 //case of babel || of raw-es6
,
    d3 = front ? window.d3 : null;

var SvgD3 = function SvgD3(svg) {
	_classCallCheck(this, SvgD3);

	this.svg = svg.svg;
	this.margin = { top: svg.top, right: svg.right, bottom: svg.bottom, left: svg.left };
	this.svg_w = this.svg.attr("width") - this.margin.left - this.margin.right;
	this.svg_h = this.svg.attr("height") - this.margin.top - this.margin.bottom;
	this.g = this.svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
};

var ShapeD3 = function (_SvgD) {
	_inherits(ShapeD3, _SvgD);

	function ShapeD3() {
		var _ref;

		_classCallCheck(this, ShapeD3);

		for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
			arg[_key] = arguments[_key];
		}

		return _possibleConstructorReturn(this, (_ref = ShapeD3.__proto__ || Object.getPrototypeOf(ShapeD3)).call.apply(_ref, [this].concat(arg)));
	}

	_createClass(ShapeD3, [{
		key: "config",
		value: function config(type, dset, get_params) {
			var _this2 = this;

			this.type = type;
			this._bind_data(dset, function (computed) {
				var arg = get_params(computed);
				_this2.width = arg.w;
				_this2.height = arg.h;
				_this2.x = arg.x.domain(arg.xm);
				_this2.y = arg.y.domain(arg.ym);
				_this2.z = arg.z.domain(arg.zm);
				_this2.d_len = dset.d.length;
				_this2.compose(arg);
			});
		}
	}, {
		key: "_bind_data",
		value: function _bind_data(dset, fn) {
			var Dset = new DatasetD3();

			var _Dset$opti = Dset.opti(this.type, dset),
			    d = _Dset$opti.d,
			    offset = _Dset$opti.offset;

			var computed = { d: d };

			this.content = this.g.selectAll(".d-content").data(computed.d).enter().append("g").attr("class", "d-content");

			fn(computed);
			offset.reset();
		}
	}]);

	return ShapeD3;
}(SvgD3);

var GraphD3 = function (_ShapeD) {
	_inherits(GraphD3, _ShapeD);

	function GraphD3() {
		var _ref2;

		_classCallCheck(this, GraphD3);

		for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			arg[_key2] = arguments[_key2];
		}

		return _possibleConstructorReturn(this, (_ref2 = GraphD3.__proto__ || Object.getPrototypeOf(GraphD3)).call.apply(_ref2, [this].concat(arg)));
	}

	_createClass(GraphD3, [{
		key: "compose",
		value: function compose(arg) {
			this._axis(arg);
			this["_" + this.type](arg);
		}
	}, {
		key: "_axis",
		value: function _axis(arg) {
			var axisx = d3.axisBottom(this.x).ticks(this.d_len < 10 ? this.d_len : null);
			this.g.append("g").attr("class", "axis axis--x").attr("transform", "translate(0," + this.height + ")").call(axisx).append("text").attr("transform", function (d) {
				return "translate( 30,0 )";
			});

			var axisy = d3.axisLeft(this.y);
			this.g.append("g").attr("class", "axis axis--y").call(axisy).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", "0.71em").text(arg.txt.ay);
		}
	}, {
		key: "_lines",
		value: function _lines(arg) {
			var _ref3 = [this.x, this.y, this.z],
			    x = _ref3[0],
			    y = _ref3[1],
			    z = _ref3[2];

			var line = d3.line()
			//.curve( d3.curveBasis )
			.x(function (d) {
				return x(d.ax);
			}).y(function (d) {
				return y(d.ay < 0 ? Math.abs(d.ay) : d.ay);
			}).defined(function (d) {
				return d.ay;
			});

			this.content.append("path").attr("class", "line").attr("d", function (d) {
				return line(d.values);
			}).style("stroke", function (d) {
				return z(d.id);
			});

			this.content.selectAll(".dot").data(function (d) {
				return d.values;
			}).enter().append("circle").attr("class", "dot").attr("r", function (d) {
				return 3;
			}).attr("cx", function (d, i) {
				if (i === 0) {
					var month_name = d3.timeFormat("%B")(d.ax),
					    month_name_need = d3.select('.axis--x>.tick').text().includes(month_name);
					if (!month_name_need) d3.select('.axis--x>text').text(d3.timeFormat("%B")(d.ax));
				}
				return x(d.ax);
			}).attr("cy", function (d) {
				return y(d.ay);
			}).attr("data", function (d) {
				return d.ay + '@' + d.id + '@' + d3.timeFormat("%x")(d.ax);
			}).style("fill", function (d) {
				return z(d.id);
			});

			this.content.append("text").datum(function (d) {
				return { id: d.id, value: d.values[d.values.length - 1] };
			}).attr("class", "annot").attr("transform", function (d) {
				return "translate(" + x(d.value.ax) + "," + y(d.value.ay) + ")";
			}).attr("x", 3).attr("dy", "0.35em").text(function (d) {
				return d.id;
			});
		}
	}]);

	return GraphD3;
}(ShapeD3);

var DatasetD3 = function () {
	function DatasetD3() {
		_classCallCheck(this, DatasetD3);

		this.factory = this._factory();
		this.methods = this._methods();
	}

	_createClass(DatasetD3, [{
		key: "opti",
		value: function opti(dtype, dset) {
			var method = this.factory.Dtype(dtype, dset);
			return method.opti();
		}
	}, {
		key: "filter",
		value: function filter(dtype, dset) {
			var method = this.factory.Dtype(dtype, dset);
			return method.filter();
		}
	}, {
		key: "_factory",
		value: function _factory() {
			var self = this;
			return {
				Dtype: function Dtype(dtype, dset) {
					this.bundle(dset);
					return Object.create(this[dtype]);
				},
				bundle: function bundle(_ref4) {
					var d = _ref4.d,
					    k = _ref4.k,
					    parse = _ref4.parse;


					this.lines = {
						filter: function filter() {
							if (!k) return;
							var range = k.range,
							    i_max = d.length - 1,
							    _self$methods$decodes = self.methods.decodestr(range, i_max),
							    daysfn = _self$methods$decodes.daysfn,
							    arg = _self$methods$decodes.arg,
							    i_from = arg.i < 0 ? 0 : arg.i;


							if (!arg.date) arg.date = d[i_from].date;

							var _daysfn = daysfn(arg),
							    ranged = _daysfn.ranged,
							    far = _daysfn.far,
							    month_date1st = _daysfn.month_date1st,
							    i_d = arg.i + far,
							    negative = i_d < 0 && far < 0 ? true : false,
							    start_i = -1,
							    rangedN = ranged,
							    date_dest = void 0;

							if (negative) rangedN = arg.i;
							if (i_d < 0) i_d = 0;

							date_dest = d[i_d].date;

							if (month_date1st) {
								date_dest = month_date1st;
								rangedN -= 1;
							}

							var chunk = d.filter(function (dd, i) {
								if (date_dest === dd.date) start_i = i;
								if (start_i >= 0) {
									return i >= start_i && i <= start_i + rangedN;
								}
							});

							chunk.columns = d.columns;
							return { chunk: chunk, start_i: negative ? arg.i - ranged : start_i, ranged: ranged };
						},
						opti: function opti() {
							var ax = k.ax,
							    temp = [];
							d.forEach(function (dd) {
								temp.push(dd[ax]);
								dd[ax] = parse.timeParse(dd[ax]);
							});

							this.temp_box = { d: d, k: ax, temp: temp };
							return {
								d: d.columns.slice(1).map(function (id) {
									return {
										id: id,
										values: d.map(function (dd) {
											return { id: id, ax: dd[ax], ay: dd[id] };
										})
									};
								}),
								offset: this
							};
						},
						reset: function reset() {
							var _this4 = this;

							this.temp_box.d.forEach(function (d, i) {
								d[_this4.temp_box.k] = _this4.temp_box.temp[i];
							});
						}
					};
				}
			};
		}
	}, {
		key: "_methods",
		value: function _methods() {
			return {
				decodestr: function decodestr(str, imax) {
					if (!str) return;
					var nums = str.match(/-?\d+/g).map(Number);
					if (nums.length < 2) return;

					var daysfn = void 0,
					    arg = { n_unit: nums[0], n_to_target: nums[1], last: str.includes('last') },
					    use = str.includes('date') ? 'date' : 'i';

					arg[use] = arg.last ? imax : nums[nums.length - 1];

					if (str.includes('week')) daysfn = this.days_week;
					if (str.includes('month')) daysfn = this.days_month;

					return { daysfn: daysfn, arg: arg };
				},
				days_month: function days_month(_ref5) {
					var date = _ref5.date,
					    n_unit = _ref5.n_unit,
					    n_to_target = _ref5.n_to_target;

					var month_from = parseInt(date.slice(4, 6)),
					    month_to = month_from + n_to_target,
					    target_extent = [month_to, month_to + n_unit],
					    jump_extent = d3.extent([month_to, month_to + n_unit, month_from]);

					var ranged = 0,
					    year = date.slice(0, 4),
					    count_m = jump_extent[0],
					    count_far = 0,
					    anchor = n_to_target > 0 ? 1 : -1;

					do {
						if (count_m > 12) count_m - 12;
						var days = new Date(year, count_m, 0).getDate();
						if (jump_extent[1] - 1 < count_m && anchor < 0) count_far += days;
						if (count_m >= target_extent[0] && count_m < target_extent[1]) ranged += days;
						count_m++;
					} while (count_m < jump_extent[1]);

					var far = count_far * anchor,
					    month_date1st = "" + year + month_to + "01";

					return { ranged: ranged, far: far, month_date1st: month_date1st };
				},
				days_week: function days_week(_ref6) {
					var n_unit = _ref6.n_unit,
					    n_to_target = _ref6.n_to_target;

					var ranged = 7 * n_unit,
					    far = ranged * n_to_target;
					return { ranged: ranged, far: far };
				}
			};
		}
	}]);

	return DatasetD3;
}();

var factory = {
	Graph: function Graph(_ref7) {
		var _ref8 = _slicedToArray(_ref7, 3),
		    name = _ref8[0],
		    settings = _ref8[1],
		    margin = _ref8[2];

		var svg = this.Svg(margin || { top: 20, right: 50, bottom: 30, left: 30 }),
		    Gra = new GraphD3(svg),
		    Dset = new DatasetD3(),
		    _ref9 = Dset.filter('lines', settings) || settings.d,
		    chunk = _ref9.chunk,
		    start_i = _ref9.start_i,
		    ranged = _ref9.ranged,
		    nums = [],
		    ymax = void 0;


		settings.k.range_decoded = [start_i, ranged];
		settings.d.map(function (dd, i) {
			nums.push(Math.abs(dd.weight));
			nums.push(Math.abs(dd.goal));
		});
		ymax = d3.extent(nums);

		var config = {
			line_def: function line_def() {
				var dset = {
					d: chunk, k: { ax: "date" },
					parse: { timeParse: d3.timeParse("%Y%m%d") }
				};

				Gra.config('lines', dset, function (computed) {
					return {
						w: Gra.svg_w,
						h: Gra.svg_h,
						x: d3.scaleTime().range([0, Gra.svg_w]),
						y: d3.scaleLinear().range([Gra.svg_h, 0]),
						z: d3.scaleOrdinal(d3.schemeCategory10),
						xm: d3.extent(chunk, function (d) {
							return d.date;
						}),
						ym: [ymax[0] - 5, ymax[1] + 10],
						zm: computed.d.map(function (c) {
							return c.id;
						}),
						txt: { "ay": "Weight, kg" }
					};
				});
			}
		};
		config[name]();
	},
	Svg: function Svg(margin) {
		var svg = { svg: d3.select("body").select("svg") };
		return Object.assign(svg, margin);
	}
};

var d3m = {
	Graph: function Graph() {
		factory.Graph(arguments);
	},
	bind_d3Dom: function bind_d3Dom(window_d3) {
		d3 = window_d3;
	}
};

//if( front && !front.hasOwnProperty('window') ) module.exports = d3m; 
if (!front) module.exports = d3m;
//true means being called by client having no module