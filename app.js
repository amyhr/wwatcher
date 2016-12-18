"use strict";

const 
	http = require( 'http' )
	
	,{ src, dir, apis } = require( './mod/adminm' )
	,mediam = require( src.js_mdam$ )
	,router = require( dir.router$ )
	
	,server = http.createServer();

server.on( 'request', ( req, res ) => {
	// interfere & get mediam's modules;
	let media = mediam.pipe( req, res ),
		rou = media.rou();
	// load static file, if so
	media.static( req.url );
	
	// set router upon url
	rou( '/' )
	.get( router.index );
	
	rou( apis.d_app )
	.get( router.get_d_app )
	.post( router.post_d_app )
	
	rou( apis.admin )
	.get( router.get_admin )
	
	rou('/test')
	.get( router.test)
	
});

server.listen( 8080, '127.0.0.1' );

