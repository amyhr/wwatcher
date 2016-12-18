const 
	tool = require( './toolm' );
	
const adminm = ( () => {
	const	 m = methods()
  			,dir = {
					asset: "/asset/",
					pubjs: "/public/js/",  
					mod: "/mod/", 
					router: "/router/" 
					}
			 ,src = {
					d_app: "data.tsv", 
					js_d3m: "d3m.js",
					js_d3m_pub: "d3m_.js",
					js_logm: "logm.js",
					js_mdam: "mediam.js",
					js_mg: "manager.js",
					js_roum: "routerm.js",
					js_toolm: "toolm.js",
					js_domm: "domm.js"
					}
			,ext = {			
					jq: "https://code.jquery.com/jquery-2.2.4.min.js",
					d3: "https://d3js.org/d3.v4.min.js",
					bs_sl: "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/9.5.1/bootstrap-slider.min.js"
					}
			,apis = {	
					admin: "/admin", 
					d_app: "/d_app"
				}
			,types_file = {
					'html': 'text/html',
					'js': 'text/javascript',
					'css': 'text/css',
					'json': 'application/json',
					'tsv': 'application/json',
					'png': 'image/png',   
					'jpg': 'image/jpg',
					'wav':'audio/wav'
				}
			,def_scope = {
				range_decoded: null,
				range: 'week {1}@{-1} from last',
			}
			
		return {
			dir: new Proxy( dir, m.compile_dir ),
			src: new Proxy( src, m.compile_src ),
			ext, apis, types_file, def_scope
		}
})();


function methods () {
	return {
		compile_src: {
			get: ( target, name_ ) => {
				let [ $isFull, _isDocname, name ] = tool.listen_flag( name_, -1, '$', '_' );
				const dirs = adminm.dir;
				for(let key in dirs ){
					let  dirsrc = dirs[key] + target[ name ]
						,pathname = tool.isFile( dirsrc );
					if( pathname ){
						if( $isFull ) return pathname;
						if( _isDocname ) return target[ name ];
						return dirsrc;
					}
				}
			}
		},
		compile_dir: {
			get: ( target, name_ ) => {
				let [ $isFull, _isDocname, name ] = tool.listen_flag( name_, -1, '$', '_' );
				if( $isFull ) return tool.get_fullpath( target[ name ] );
				else return target[ name ];
			}
		}
	}
}

module.exports = adminm;
