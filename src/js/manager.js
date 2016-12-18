"use strict";

$( document ).ready( () => {
	wwatch_scope();
});

let wwatch_scope = () => {
	let record, admin;
	
	//classes
	class Record { 
		constructor ( d_name ) {
			this.d_name = d_name;
		}
		_dt ( date ) {
			let  dt = (date)? new Date(date) : new Date()
				,m = ( '0' + ( dt.getMonth() + 1 )).slice(-2)
				,d = ( '0' + dt.getDate() ).slice(-2)
			return dt.getFullYear() + '' + m + '' + d ;
		}
		set data ( d ) {
			this._data = d; 
			this.d_len= d.length;
			this.d_imax= d.length-1;
		}  
		get data () { return this._data; }
		set scope ( scope ) {
			let Super = this;
			let _update = {
				slideMax ( v, pxy ) { return Math.ceil( Super.d_imax / pxy.range_decoded[1] ) },
				range( v, pxy ){
					if ( !v.includes( '=' ) ) return;
					let [ mark, update ] = v.split( '=' )
						,marks = {
							'{}@{}': `${update}${pxy['range-from-']}`,
							'@{}from{}': `${pxy['range-unit']}${update}`,
							'from{}': `${pxy['range-unit']}${pxy['range-at-']}${update}`,
							'{}@{}from{}': update
						}
					return marks[ mark.replace(/\s+/g, '') ]
				},
				range_decoded( v, pxy ){
					pxy.range =`from{} = from index{${v[0]}}`;
					return v;
				}
			}
		
			this._scope = new Proxy( scope, {
				set: ( target, name, newval ) => {
					target[ name ] = (_update[ name ] )? _update[ name ]( newval, this._scope ) : newval;
					return true;
				},
				get: ( target, name ) => {
					let points = {}, point;
					if ( name.includes( 'range' ) && !name.includes( 'decoded' ) && name !=='range' ){
						let  [ unit_at , from ]= target.range.split('from')
							,[ unit, at ] = unit_at.replace(/\s+/g, '').split('@');
							point = name.replace(/\s+/g, '').replace('range-', '');
							points = {
								'alphanumeric':unit.replace(/[^a-z0-9]/gi,''),
								'at-':'@'+ at,
								'from-':'from'+ from,
								from, unit, at
							};
					}
					return points[ point ] || target[ name ];
				}
			})
			this._scope.slideMax = 'auto';
		}
		get scope (){ return this._scope; }
		new_rec ( w_v, g_v ){
			const date_from_digit = ( digit ) =>{
				return new Date( digit / 10000, (digit % 10000 / 100) - 1, digit % 100 )
			};
			const convert = (1000 * 60 * 60 * 24);
			
			let  data = this.data
				,last_d = data[this.d_imax]
				,today_digit = this._dt()+''
				,last_digit = last_d.date;
				
			if(today_digit === last_digit )	{
				let ans = confirm( 
					`You have already recorded for today. Would you like to overwrite?` 
				);
				if ( !ans ) return;
			}
			
			let  today = date_from_digit( today_digit ) 
				,last = date_from_digit( last_digit ) 
				,gap = parseInt(( today - last ) / convert )
				,date = today_digit+''
				,weight = w_v || last_d.weight	
				,goal = g_v || last_d.goal	
				,newrec = { date, weight, goal };
		
			for(let i=0; i<gap; i++){
				let  nextday = new Date( last.getTime() + convert )
					,nextday_digit = this._dt( nextday )
					,norec={ date: nextday_digit, weight: last_d.weight*-1, goal: last_d.goal*-1 }
					,rec = ( i === gap-1 )? newrec : norec;
				data.push( rec ) 
				last = date_from_digit( nextday_digit ) 
			}
			if( gap === 0 ) data[this.d_imax] = newrec; //overwrite
				
			this.data = data;
			return newrec;
		}
	}
	
	class Dom { 
		constructor ( d_name ) {
			this.ev = this.define_ev();
		}
		static redraw_svg(){
			$( 'svg' ).empty();
			d3m.Graph( 'line_def', {
				d: record.data,  
				k: record.scope
			});
			let ev = this.ev || new this().ev;
			ev.tooltip_d3();
		}
		landing () {
			this.ev.default();
			let  scope_time_id = record.scope[ 'range-alphanumeric' ];
			$( '#'+scope_time_id ).addClass( 'on' );
		}
		define_ev(){
			let Self = this;
			return {
				update_record () {
					let this_ = this;
					$( '#update_record_btn' ).on( 'click', () => {
						let  w = $( '#w_val' ).val() 
							,g_v = $( '#g_val' ).val() 
							,g = ( Number.isInteger( parseInt( g_v ) ) )? g_v : null
							,newrec = record.new_rec( w, g ); 
							
						if( !newrec ) return;
						mods.ajax.connect ( 'qjson', 'd_app', newrec, null, true );
						
						let  scope = record.scope
							,n_to_target = $( '#week1' ).hasClass( 'on' )? -1 : 0;
						
						scope.range =`@{}from{} = @{${n_to_target}} from last`; //=`from{} = from last`;
						
						Dom.redraw_svg();
						scope.slideMax = 'auto';
						this_.set_slider_past( scope.slideMax, true );
					});
				},
				switch_time (){
					let this_ = this;
					$('#scope_time button').on( 'click', (ev) => {
						if($( ev.target ).hasClass( 'on' )) return;
						$( ev.target ).addClass( 'on' )
						.siblings().removeClass( 'on' );
						
						let  scope = record.scope
							,id = $( ev.target ).attr('id')
							,unit = $( ev.target ).data( 'unit' );
						
						scope.range =`{}@{}from{} = ${unit} from last`;//from index{${scope.range_decoded[0]}}
						
						Dom.redraw_svg(record.data[scope.range]);
						
						scope.slideMax ='auto';
						let slideVal = Math.ceil( scope.range_decoded[0] / scope.range_decoded[1] ) +1;
						Self.$slide.refresh();
						$( '.slider' ).remove();
						this_.set_slider_past( slideVal, true );
					});
				},
				set_slider_past ( sval, reset ){
					if( reset ){
						Self.$slide.refresh();
						$( '.slider' ).remove();
					}
					let  scope = record.scope
						,max = scope.slideMax;	
					Self.$slide = new Slider( '#slider_past', {
							min: 1, max: max, value: sval || max, step: 1
						}).on( 'change', ( { newValue, oldValue } ) => {
							let  start_i = scope.range_decoded[0]
								,anchor = newValue - oldValue;
							scope.range=`@{}from{} = @{${anchor}} from index {${start_i}}`
							Dom.redraw_svg();
						});
				},
				tooltip_d3 (){
					d3.select('#tooltip_d3').remove();
					let div = d3.select( '#colm-svg' ).append('div')	
						.attr( 'id', 'tooltip_d3' )
						.attr( 'class', 'tooltip_d3' )				
						.style( 'opacity', 0)
					
					d3.selectAll( '.dot' )
						.on('mouseover', function() {
							let v = d3.select( this ).attr( 'data' ).split( '@' );//value@kind@date 
				
							div.transition()		
								.duration(100)		
								.style('opacity', .8)		
							div.html( `${v[1]}: ${v[0]}<br/>date: ${v[2]}` )	
								.style( 'left', ( d3.event.pageX ) + 'px' )		
								.style( 'top', ( d3.event.pageY - 28 ) + 'px' )	
								.style( 'background', (d) => {
									let color = d3.select( this ).style( 'fill' );
									return d3.rgb( color ).brighter(2);
								})
						})					
						.on('mouseout', function(d) {		
							div.transition()		
								.duration(300)		
								.style( 'opacity', 0 );
						});
				},
				default () {
					this.set_slider_past();
				 	this.update_record();
					this.switch_time();
					this.tooltip_d3();
				}
			}
		
		}
	}
	
	//modules
	let mods = {
		ajax : {
			apis: {
				admin: {
					key: "/admin", 
					act: ( data , act ) => {
						if( act ) act( data ); 
					}
				}, 
				d_app: {
					key: "d_app", 
					data: null,
					act: ( data, act ) => {
						if( act ) act( data );
					}
				}
			},
			qjson: ( api, act, isPost) => { 
				let url = mods.refine_url(api);
				if( !url ) return; 
				$.ajax({
					url: url,
					type: isPost? 'POST' : 'GET',
					dataType: 'json',
					data: api.data
				}).done( ( data ) => {
					if(api.act) api.act( data, act );
				
				}).fail( ( data ) => {});
			}, 
			qD3: ( api, act, isPost, d3method ) => {
				let url = mods.refine_url(api);
				if( !url ) return; 
				d3method( url, null, ( error, data ) => {
					api.act( data, act );
				});
			},
			connect (method, apikey, data, ...arg) {
				let ajax = mods.ajax, 
				api = ajax.apis[ apikey ];
				if(data) api.data = data;
				ajax[ method ]( api, ...arg );
			}
		},
		refine_url ( api ) {
			if(!api) return;
			if(!admin) return api.key;
			if(!admin.apis[api.key]) return;
			return admin.apis[api.key];
		}
	}
	
	//the initiater
	let ini = (fn) => {	fn() }
	
	ini( () => {
		let ajax = mods.ajax;
		ajax.connect ( 'qjson', 'admin', null, ( data ) => {
			admin = data; 
			record = new Record( "d_record" ); 
			ajax.connect ( 'qD3', 'd_app', null, ( data ) => {
				record.data = data;
				record.scope = admin.def_scope;
				new Dom().landing();
				
			}, false, d3.tsv );
		});
	});
}
