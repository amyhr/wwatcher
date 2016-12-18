
let  front = (this===undefined || Object.keys(this).length>0 ) //case of babel || of raw-es6
	,d3 = ( front )? window.d3 : null;

class SvgD3 { 
	constructor ( svg ) {
		this.svg = svg.svg;
		this.margin = { top: svg.top, right: svg.right, bottom: svg.bottom, left: svg.left };
		this.svg_w = this.svg.attr( "width" ) - this.margin.left - this.margin.right;
		this.svg_h = this.svg.attr( "height" ) - this.margin.top - this.margin.bottom;
		this.g = this.svg.append( "g" ).attr( "transform", "translate(" + this.margin.left + "," + this.margin.top + ")" );
	}
}

class ShapeD3 extends SvgD3 { 
	constructor ( ...arg ) { 
		super( ...arg );
	}
	config ( type, dset, get_params ) { 
		this.type = type;
		this._bind_data( dset, ( computed ) => {
			let arg = get_params( computed );
			this.width = arg.w;
			this.height = arg.h;
			this.x = arg.x.domain( arg.xm );
			this.y = arg.y.domain( arg.ym );
			this.z = arg.z.domain( arg.zm );
			this.d_len = dset.d.length;
			this.compose( arg );	
		});
	}
	_bind_data ( dset, fn ) {
		let Dset = new DatasetD3();
		let { d, offset } = Dset.opti( this.type, dset );
		let computed = { d: d }; 
	
		this.content = this.g.selectAll( ".d-content" )
			.data( computed.d )
			.enter().append( "g" )
			.attr( "class", "d-content" );
			
		fn( computed );
		offset.reset();
	} 
}

class GraphD3 extends ShapeD3 { 
	constructor ( ...arg ) { 
		super( ...arg );
	}
	compose ( arg ) {
		this._axis( arg );
		this[ `_${this.type}` ]( arg );
	}
	_axis ( arg ) {
		let axisx = d3.axisBottom( this.x ).ticks( (this.d_len<10)? this.d_len: null);
		this.g.append( "g" )
			.attr( "class", "axis axis--x" )
			.attr( "transform", "translate(0," + this.height + ")" )
			.call( axisx )
		  .append( "text" )
			.attr( "transform", d => { return "translate( 30,0 )"; })
		
		let axisy = d3.axisLeft(this.y);
		this.g.append( "g" )
			.attr( "class", "axis axis--y" )
			.call( axisy )
	  	  .append( "text")
			.attr( "transform", "rotate(-90)" )
			.attr( "y", 6)
			.attr( "dy", "0.71em" )
			.text( arg.txt.ay );
	} 
	_lines ( arg ) {
		let [ x, y, z ] = [ this.x, this.y, this.z ];
		let line = d3.line()
			//.curve( d3.curveBasis )
			.x(( d ) => { return x( d.ax ); })
			.y(( d ) => { return y( ( d.ay < 0 )? Math.abs( d.ay ) : d.ay ); })
			.defined(( d ) => { return d.ay });
	
		this.content.append( "path" )
			.attr( "class", "line" )
			.attr( "d", d => { return line( d.values ); })
			.style( "stroke", d => { return z( d.id ); });
		
		this.content
			.selectAll(".dot")
			.data( d => { return d.values; }) 
			.enter().append( "circle" )
			.attr( "class", "dot" )
			.attr( "r", d => { return 3 }) 
			.attr( "cx", ( d, i ) => { 
				if( i===0 ) {
					let  month_name = d3.timeFormat("%B")(d.ax)
						,month_name_need = d3.select('.axis--x>.tick').text().includes( month_name );
					if(!month_name_need) d3.select('.axis--x>text').text(d3.timeFormat("%B")(d.ax));
				}
				return x( d.ax );
			})
			.attr( "cy", d => {  return y( d.ay ); })
			.attr( "data", d => { return d.ay + '@' + d.id + '@' + d3.timeFormat("%x")( d.ax ); })
			.style( "fill", d => { return z( d.id ); });

		this.content.append( "text" )
			.datum(d => { return { id: d.id, value: d.values[ d.values.length - 1 ] }; })
			.attr( "class", "annot" )
			.attr("transform", d => { return "translate(" + x( d.value.ax ) + "," + y( d.value.ay ) + ")"; })
			.attr( "x", 3 )
			.attr( "dy", "0.35em" )
			.text( d => { return d.id; });

	} 
}

class DatasetD3 { 
	constructor () {
		this.factory = this._factory(); 
		this.methods = this._methods();
	}
	opti ( dtype, dset ) {
		let method = this.factory.Dtype( dtype, dset );
		return method.opti(); 
	}
	filter ( dtype, dset ) {
		let method = this.factory.Dtype( dtype, dset );
		return method.filter();
	}
	_factory () {
		let self = this;	
		return {
			Dtype ( dtype, dset ) {	
				this.bundle( dset );
			 	return Object.create( this[ dtype ] );
			},	
			bundle ( { d, k, parse } ) {
				
				this.lines = {
					filter () { 
						if( !k ) return; 
						let { range } = k
							,i_max = d.length-1
							,{ daysfn, arg } = self.methods.decodestr( range, i_max )
							,i_from = ( arg.i < 0 )? 0 : arg.i;
					
						if( !arg.date ) arg.date = d[ i_from ].date;	
	
						let { ranged, far, month_date1st } = daysfn( arg )
							,i_d = arg.i + far
							,negative=( i_d < 0 && far<0)? true : false
							,start_i = -1
							,rangedN = ranged
							,date_dest;
				
						if( negative ) rangedN = arg.i;
						if( i_d<0 ) i_d = 0;
							
						date_dest = d[ i_d ].date;
						
						if( month_date1st ) {
							date_dest = month_date1st;
							rangedN-=1;
						}
			
						let chunk = d.filter( ( dd, i ) => { 
							if( date_dest === dd.date ) start_i = i;
							if( start_i >=0 ) {
								return ( i >= start_i && i <= start_i + rangedN ) 
							}
						});
					
						chunk.columns = d.columns;
						return { chunk, start_i: ( negative )? arg.i-ranged : start_i, ranged };
					},
					opti () {
						let ax = k.ax, temp = [];
						d.forEach( dd => {
							temp.push( dd[ax] );
							dd[ax] = parse.timeParse( dd[ax] );
						});
								
						this.temp_box = { d, k:ax, temp };	
						return { 
							d: d.columns.slice(1).map( id => {
								return {
									id: id,
									values: d.map( dd => { 
										return { id: id, ax: dd[ ax ], ay: dd[ id ] };
									})
								};
							}),
							offset: this
						}	
					},
					reset () {
						this.temp_box.d.forEach( ( d, i ) => {
							d[ this.temp_box.k ] = this.temp_box.temp[i];
						});
						
					}
				}
			}
		}
	}
	_methods () {
		return {
			decodestr ( str, imax ) {
				if( !str ) return;
				let nums = str.match(/-?\d+/g).map(Number);
				if( nums.length < 2 ) return;
				
				let  daysfn
					,arg ={ n_unit: nums[0], n_to_target: nums[1], last: str.includes( 'last' ) }
					,use = ( str.includes( 'date' ) )? 'date' : 'i';
					
				arg[ use ] = ( arg.last )? imax : nums[ nums.length-1 ];
		
				if( str.includes( 'week' )) daysfn = this.days_week;
				if( str.includes( 'month' )) daysfn = this.days_month;
		
				return { daysfn, arg };
			},
			days_month ( { date, n_unit, n_to_target } ) {
				let  month_from = parseInt( date.slice( 4,6 ) )
					,month_to = month_from + n_to_target
					,target_extent = [ month_to, month_to + n_unit ]
					,jump_extent =d3.extent([month_to, ( month_to + n_unit ), month_from]);
				
				let  ranged = 0
					,year = date.slice( 0, 4 )
					,count_m = jump_extent[0]
					,count_far = 0
					,anchor = ( n_to_target > 0 )? 1 : -1;
				
				do {
					if( count_m >12 ) count_m-12;
					let days = new Date(year, count_m, 0).getDate();
					if( jump_extent[1]-1 < count_m && anchor<0 ) count_far += days;
					if( count_m >= target_extent[0] &&  count_m < target_extent[1] ) ranged += days;
					count_m++;
				} while ( count_m < jump_extent[1] );
		
				let   far = count_far*anchor
					 ,month_date1st = `${year}${month_to}01`;
		
				return { ranged, far, month_date1st };
			},
			days_week ( { n_unit, n_to_target } ) {
				let  ranged = 7*n_unit
					,far = ranged*n_to_target;
				return { ranged, far };
			}
		}
	}
}

const factory = {
	Graph ( [ name, settings, margin ] ) {
		let  svg = this.Svg( margin || { top: 20, right: 50, bottom: 30, left: 30 } )
			,Gra = new GraphD3( svg )
			,Dset = new DatasetD3()
			,{ chunk, start_i, ranged } = Dset.filter( 'lines', settings ) || settings.d
			,nums=[]
			,ymax;
		
		settings.k.range_decoded = [ start_i, ranged ];
		settings.d.map( ( dd, i ) => { 
			nums.push( Math.abs( dd.weight ) ); 
			nums.push( Math.abs( dd.goal ) );
		}); 
		ymax = d3.extent( nums );
		
		let config = {
			line_def () {  
					let dset = { 
						d: chunk, k: { ax: "date" }, 
						parse: { timeParse: d3.timeParse( "%Y%m%d" ) }
					}
				
					Gra.config(	'lines', dset, ( computed ) => { 
						return {
							w: Gra.svg_w,
							h: Gra.svg_h,
							x: d3.scaleTime().range( [ 0, Gra.svg_w ] ),
							y: d3.scaleLinear().range( [ Gra.svg_h, 0 ] ),
							z: d3.scaleOrdinal( d3.schemeCategory10 ),
							xm: d3.extent(chunk, (d) => { return d.date;}),
							ym: [ ymax[0] - 5, ymax[1] + 10 ],
							zm: computed.d.map( c => { return c.id; } ),
							txt: { "ay":"Weight, kg" }
						}
					});	
			}
		};
		config[ name ]();
	},
	Svg ( margin ) {
		let svg = { svg: d3.select( "body" ).select( "svg" ) };
		return Object.assign( svg, margin );
	}
}

const d3m = { 
	Graph () {
		factory.Graph( arguments )
	},		
	bind_d3Dom ( window_d3 ) {
		d3 = window_d3;
	}
}

//if( front && !front.hasOwnProperty('window') ) module.exports = d3m; 
if( !front ) module.exports = d3m; 
//true means being called by client having no module
