"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

$(document).ready(function () {
	wwatch_scope();
});

var wwatch_scope = function wwatch_scope() {
	var record = void 0,
	    admin = void 0;

	//classes

	var Record = function () {
		function Record(d_name) {
			_classCallCheck(this, Record);

			this.d_name = d_name;
		}

		_createClass(Record, [{
			key: '_dt',
			value: function _dt(date) {
				var dt = date ? new Date(date) : new Date(),
				    m = ('0' + (dt.getMonth() + 1)).slice(-2),
				    d = ('0' + dt.getDate()).slice(-2);
				return dt.getFullYear() + '' + m + '' + d;
			}
		}, {
			key: 'new_rec',
			value: function new_rec(w_v, g_v) {
				var date_from_digit = function date_from_digit(digit) {
					return new Date(digit / 10000, digit % 10000 / 100 - 1, digit % 100);
				};
				var convert = 1000 * 60 * 60 * 24;

				var data = this.data,
				    last_d = data[this.d_imax],
				    today_digit = this._dt() + '',
				    last_digit = last_d.date;

				if (today_digit === last_digit) {
					var ans = confirm('You have already recorded for today. Would you like to overwrite?');
					if (!ans) return;
				}

				var today = date_from_digit(today_digit),
				    last = date_from_digit(last_digit),
				    gap = parseInt((today - last) / convert),
				    date = today_digit + '',
				    weight = w_v || last_d.weight,
				    goal = g_v || last_d.goal,
				    newrec = { date: date, weight: weight, goal: goal };

				for (var i = 0; i < gap; i++) {
					var nextday = new Date(last.getTime() + convert),
					    nextday_digit = this._dt(nextday),
					    norec = { date: nextday_digit, weight: last_d.weight * -1, goal: last_d.goal * -1 },
					    rec = i === gap - 1 ? newrec : norec;
					data.push(rec);
					last = date_from_digit(nextday_digit);
				}
				if (gap === 0) data[this.d_imax] = newrec; //overwrite

				this.data = data;
				return newrec;
			}
		}, {
			key: 'data',
			set: function set(d) {
				this._data = d;
				this.d_len = d.length;
				this.d_imax = d.length - 1;
			},
			get: function get() {
				return this._data;
			}
		}, {
			key: 'scope',
			set: function set(scope) {
				var _this = this;

				var Super = this;
				var _update = {
					slideMax: function slideMax(v, pxy) {
						return Math.ceil(Super.d_imax / pxy.range_decoded[1]);
					},
					range: function range(v, pxy) {
						if (!v.includes('=')) return;

						var _v$split = v.split('='),
						    _v$split2 = _slicedToArray(_v$split, 2),
						    mark = _v$split2[0],
						    update = _v$split2[1],
						    marks = {
							'{}@{}': '' + update + pxy['range-from-'],
							'@{}from{}': '' + pxy['range-unit'] + update,
							'from{}': '' + pxy['range-unit'] + pxy['range-at-'] + update,
							'{}@{}from{}': update
						};

						return marks[mark.replace(/\s+/g, '')];
					},
					range_decoded: function range_decoded(v, pxy) {
						pxy.range = 'from{} = from index{' + v[0] + '}';
						return v;
					}
				};

				this._scope = new Proxy(scope, {
					set: function set(target, name, newval) {
						target[name] = _update[name] ? _update[name](newval, _this._scope) : newval;
						return true;
					},
					get: function get(target, name) {
						var points = {},
						    point = void 0;
						if (name.includes('range') && !name.includes('decoded') && name !== 'range') {
							var _target$range$split = target.range.split('from'),
							    _target$range$split2 = _slicedToArray(_target$range$split, 2),
							    unit_at = _target$range$split2[0],
							    from = _target$range$split2[1],
							    _unit_at$replace$spli = unit_at.replace(/\s+/g, '').split('@'),
							    _unit_at$replace$spli2 = _slicedToArray(_unit_at$replace$spli, 2),
							    unit = _unit_at$replace$spli2[0],
							    at = _unit_at$replace$spli2[1];

							point = name.replace(/\s+/g, '').replace('range-', '');
							points = {
								'alphanumeric': unit.replace(/[^a-z0-9]/gi, ''),
								'at-': '@' + at,
								'from-': 'from' + from,
								from: from, unit: unit, at: at
							};
						}
						return points[point] || target[name];
					}
				});
				this._scope.slideMax = 'auto';
			},
			get: function get() {
				return this._scope;
			}
		}]);

		return Record;
	}();

	var Dom = function () {
		function Dom(d_name) {
			_classCallCheck(this, Dom);

			this.ev = this.define_ev();
		}

		_createClass(Dom, [{
			key: 'landing',
			value: function landing() {
				this.ev.default();
				var scope_time_id = record.scope['range-alphanumeric'];
				$('#' + scope_time_id).addClass('on');
			}
		}, {
			key: 'define_ev',
			value: function define_ev() {
				var Self = this;
				return {
					update_record: function update_record() {
						var this_ = this;
						$('#update_record_btn').on('click', function () {
							var w = $('#w_val').val(),
							    g_v = $('#g_val').val(),
							    g = Number.isInteger(parseInt(g_v)) ? g_v : null,
							    newrec = record.new_rec(w, g);

							if (!newrec) return;
							mods.ajax.connect('qjson', 'd_app', newrec, null, true);

							var scope = record.scope,
							    n_to_target = $('#week1').hasClass('on') ? -1 : 0;

							scope.range = '@{}from{} = @{' + n_to_target + '} from last'; //=`from{} = from last`;

							Dom.redraw_svg();
							scope.slideMax = 'auto';
							this_.set_slider_past(scope.slideMax, true);
						});
					},
					switch_time: function switch_time() {
						var this_ = this;
						$('#scope_time button').on('click', function (ev) {
							if ($(ev.target).hasClass('on')) return;
							$(ev.target).addClass('on').siblings().removeClass('on');

							var scope = record.scope,
							    id = $(ev.target).attr('id'),
							    unit = $(ev.target).data('unit');

							scope.range = '{}@{}from{} = ' + unit + ' from last'; //from index{${scope.range_decoded[0]}}

							Dom.redraw_svg(record.data[scope.range]);

							scope.slideMax = 'auto';
							var slideVal = Math.ceil(scope.range_decoded[0] / scope.range_decoded[1]) + 1;
							Self.$slide.refresh();
							$('.slider').remove();
							this_.set_slider_past(slideVal, true);
						});
					},
					set_slider_past: function set_slider_past(sval, reset) {
						if (reset) {
							Self.$slide.refresh();
							$('.slider').remove();
						}
						var scope = record.scope,
						    max = scope.slideMax;
						Self.$slide = new Slider('#slider_past', {
							min: 1, max: max, value: sval || max, step: 1
						}).on('change', function (_ref) {
							var newValue = _ref.newValue,
							    oldValue = _ref.oldValue;

							var start_i = scope.range_decoded[0],
							    anchor = newValue - oldValue;
							scope.range = '@{}from{} = @{' + anchor + '} from index {' + start_i + '}';
							Dom.redraw_svg();
						});
					},
					tooltip_d3: function tooltip_d3() {
						d3.select('#tooltip_d3').remove();
						var div = d3.select('#colm-svg').append('div').attr('id', 'tooltip_d3').attr('class', 'tooltip_d3').style('opacity', 0);

						d3.selectAll('.dot').on('mouseover', function () {
							var _this2 = this;

							var v = d3.select(this).attr('data').split('@'); //value@kind@date 

							div.transition().duration(100).style('opacity', .8);
							div.html(v[1] + ': ' + v[0] + '<br/>date: ' + v[2]).style('left', d3.event.pageX + 'px').style('top', d3.event.pageY - 28 + 'px').style('background', function (d) {
								var color = d3.select(_this2).style('fill');
								return d3.rgb(color).brighter(2);
							});
						}).on('mouseout', function (d) {
							div.transition().duration(300).style('opacity', 0);
						});
					},
					default: function _default() {
						this.set_slider_past();
						this.update_record();
						this.switch_time();
						this.tooltip_d3();
					}
				};
			}
		}], [{
			key: 'redraw_svg',
			value: function redraw_svg() {
				$('svg').empty();
				d3m.Graph('line_def', {
					d: record.data,
					k: record.scope
				});
				var ev = this.ev || new this().ev;
				ev.tooltip_d3();
			}
		}]);

		return Dom;
	}();

	//modules


	var mods = {
		ajax: {
			apis: {
				admin: {
					key: "/admin",
					act: function act(data, _act) {
						if (_act) _act(data);
					}
				},
				d_app: {
					key: "d_app",
					data: null,
					act: function act(data, _act2) {
						if (_act2) _act2(data);
					}
				}
			},
			qjson: function qjson(api, act, isPost) {
				var url = mods.refine_url(api);
				if (!url) return;
				$.ajax({
					url: url,
					type: isPost ? 'POST' : 'GET',
					dataType: 'json',
					data: api.data
				}).done(function (data) {
					if (api.act) api.act(data, act);
				}).fail(function (data) {});
			},
			qD3: function qD3(api, act, isPost, d3method) {
				var url = mods.refine_url(api);
				if (!url) return;
				d3method(url, null, function (error, data) {
					api.act(data, act);
				});
			},
			connect: function connect(method, apikey, data) {
				var ajax = mods.ajax,
				    api = ajax.apis[apikey];
				if (data) api.data = data;

				for (var _len = arguments.length, arg = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
					arg[_key - 3] = arguments[_key];
				}

				ajax[method].apply(ajax, [api].concat(arg));
			}
		},
		refine_url: function refine_url(api) {
			if (!api) return;
			if (!admin) return api.key;
			if (!admin.apis[api.key]) return;
			return admin.apis[api.key];
		}
	};

	//the initiater
	var ini = function ini(fn) {
		fn();
	};

	ini(function () {
		var ajax = mods.ajax;
		ajax.connect('qjson', 'admin', null, function (data) {
			admin = data;
			record = new Record("d_record");
			ajax.connect('qD3', 'd_app', null, function (data) {
				record.data = data;
				record.scope = admin.def_scope;
				new Dom().landing();
			}, false, d3.tsv);
		});
	});
};