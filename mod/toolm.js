const 
	 fs = require( 'fs' )
	,urlm = require( 'url' )
    ,path = require( 'path' );

const toolm = {	 
		get_fullpath ( dirsrc ) {
			let url = urlm.parse( dirsrc ).pathname;
			return path.join( process.cwd(), url );
		},
		isFile ( dirsrc ) {
			let pathname = this.get_fullpath( dirsrc );
			try {
				if( fs.statSync( pathname ).isFile() ) 
				return pathname;
			} catch ( err ) { return null; }			
		},
		listen_flag ( strings, at, ...flags ) {
			let result = [], sliced;
			flags.forEach( f => { 
				let ans = ( typeof strings === 'string' && strings.slice( at ) === f );
				if( ans && !sliced ) sliced = strings.slice( 0, at );
				result.push( ans );
			})
			result.push( sliced || strings )
			return result;
		},
		get_fileType ( filePath,  options) {
			let extname = path.extname( filePath );
			extname  = ( extname [0] == '.') ? extname.substr(1) : extname ;
			return options[ extname ] || 'text/plain' ;
		}
}

module.exports = toolm;

