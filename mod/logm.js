const fs = require( 'fs' )
	 ,urlm = require( 'url' )
     ,path = require( 'path' )
	
 	 ,{ src, types_file } = require( './adminm' )
	 ,Media = require( src.js_mdam$ )
	 ,tool = require( src.js_toolm$ );

class FSm extends Media {
    constructor ( sarg ) { 
		super( sarg ); 
		let arg = sarg[0];
		this._filename = arg.filename || null ;
		this.type = tool.get_fileType( this.filename, types_file);
		this.enc = arg.enc || 'UTF-8';
	}
	set filename ( name ) {
		this._filename = name;
		this.type = tool.get_fileType( this.filename, types_file);
	}
	get filename () { return this._filename; }
	rocessErr ( err, fd ) {
		super.processErr( err );
	}
	exist ( then, self = this ) {
		fs.stat( self.filename, ( err, stats ) => {
			if( err && !stats ) err = "api/noFile"; 
			then( err, stats );
		});
	}
	open ( then, self = this ) {
		fs.open( self.filename, "r", ( err, fd ) => {
			then( err, fd );
		});
	}
};

class Reader extends FSm {
	constructor ( sarg ) { 
		super( sarg ); 
	}
	read_cue ( stats, fd ) {
		let txt = new Buffer( stats.size );	
		fs.read( fd, txt, 0, txt.length, null, ( err, bytesRead, txt ) => {
			if( err ) this.processErr( err ); 
			else {
				let data = txt.toString( this.enc, 0, txt.length ); 
				this.act( { data } )
			}
			fs.close( fd );
		});
	}
	read () {	
		Promise.all([
			this.async( this.exist ), 
			this.async( this.open )
		]).then((　[ stats = 1, fd = 2 ]　) => { 
			this.read_cue( stats, fd )
		}).catch( ( err ) => {
			this.processErr( err );
		});
	}
}

class Writer extends FSm {
	constructor ( sarg ) {  
		super( sarg );
	}
	write_stm_unique () {
		Promise.all([
			this.async( this.exist )
		]).then(( [ stats ]　) => { 
			this.write_stm_cue()
		}).catch( ( err ) => {
			this.processErr( err);
		});
	}
	write_stm_cue () {
		let wstream = fs.createWriteStream( this.filename );
		this.req.pipe( wstream );
		wstream.on('error', (err) => {
			this.processErr( err);
		});
	}
}

class Loader extends FSm {
    constructor ( sarg ) {  
		super( sarg );
	}
	load () {
		Promise.all([
			this.async( this.exist )
		]).then( ( data ) => {
			this.load_cue();		
		})
		.catch( ( err ) => {
			this.processErr( err )
		});
	}
	load_cue () {
		fs.readFile( this.filename, this.enc, ( err, data ) => {
			if( err ) this.processErr( err ); 
			else {
				this.act( { data } );}
		});
	}
	static static_path ( url ) {
		let pathname = tool.isFile( url );
		if( pathname ) new Loader( [ { filename: pathname } ] ).load_cue();
		else return false;
	}
}

const logm = { 
	read () { new Reader( arguments ).read(); },
	static ( ...arg ) { Loader.static_path( ...arg ); },
	write_d_app () { new Writer( arguments ).write_stm_unique(); },
}

module.exports = logm;
