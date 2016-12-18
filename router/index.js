"use strict";
const 
	 jsdom = require( 'jsdom' ).jsdom
	,admin = require( '../mod/adminm' )
	,{ src, ext, def_scope } = admin
	,Domm = require( src.js_domm$ )
	,d3m = require( src.js_d3m$ );

exports.index = ( media ) => {
	jsdom.env({
		file: "./index.html",
		scripts: [ ext.jq, ext.d3, ext.bs_sl, src.js_d3m_pub, src.js_mg ],
		done: ( err, $ ) => {//$=window
			const d3 = $.d3
				 ,Dom = new Domm( $.document )
				 ,$svg = Dom.byId( 'major-svg' )
				 ,$colm = Dom.byId( 'colm-svg' )
				 ,svg_w = ($.innerWidth*.9 > 700 ) ? 700 : $.innerWidth*.9;
		
			$colm.style.width = svg_w + 'px';
			$svg.setAttribute( 'width', svg_w ); 
			$svg.setAttribute( 'height', svg_w*.5 ); 
			d3m.bind_d3Dom( d3 );
	
			d3.tsv( src.d_app$, null, ( err, data ) => {
				if( err ) media.processErr( err );
				d3m.Graph( 'line_def', {
					d: data, 
					k: def_scope
				});
				media.type = 'text/html';
				media.act( { data: Dom.html() } )
			});
		}
	});
};

exports.get_d_app = ( media ) => {
	media.piped_mods.read( { filename: src.d_app$ } )
};

exports.post_d_app = ( media )  => {
	media.piped_mods.write_d_app( { filename: './asset/data2.tsv' } );
};

exports.get_admin = ( media )  => { 
	media.type = 'application/json';
	media.act( { data: JSON.stringify( admin ) } );
};

exports.test = ( media )  => {
	media.piped_mods.read({ filename: "./data2.tsv"});
};
