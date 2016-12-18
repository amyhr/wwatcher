const 
	{ src } = require( './adminm' );

class Media { 
	constructor ( sarg ) { 
		let arg = sarg[0] || {};
		this.req = pipe.req || arg.req;
		this.res = pipe.res || arg.res;
		this.type = arg.type || 'text/plain';
		this.piped_mods = pipe.modules;
		this.act = ( datamap ) => {
			if(arg.act) arg.act( datamap ); 
			if(this.req) this.end_res( datamap )	
		}
	}
	static define_default ( req, res ) {
		 req.on( 'error', ( err ) => {
			console.error( err );
			res.statusCode = 400;
			res.end();
		 });
		 res.on( 'error', ( err ) => {
    		console.error( err );
  		});
	}
	end_res ( arg ) {
		this.res.writeHead( arg.err || 200, { 'Content-Type': this.type } );
		this.res.end( arg.data );
	}
	processErr ( err ) {
		if( this.res ){
			this.type = 'text/plain';
			let msg = ( err === 'api/noFile' )? err : `error : ${ err.code }`;
			this.end_res( { data: msg  ||  'error' } );
		}
	}
	async ( fn ) {
		return new Promise(( resolve, reject ) => {
			fn( ( err, result ) => {
				if( err ) reject( err );
				resolve( result );
			}, this );
		}); 
	}
	static pipe ( ...arg ) {
		return pipe.bundle( ...arg );
	}
}

const pipe = { 
	bundle ( ...arg ) {
		[ this.req, this.res ] = arg;
		Media.define_default( ...arg ); 
		if(! this.modules ) {
			this.modules = Object.assign( {}, 
				require( src.js_logm$ ),
				require( src.js_roum$ )
			)
		}
		return this.modules;
	}
}

module.exports = Media;
