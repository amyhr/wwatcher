const 
	 { src } = require( './adminm' )
	,Media = require( src.js_mdam$ );

class Router extends Media {
	constructor ( sarg ) {
		super( sarg );
	}
	rou ( url ) {
		this.url = url;
		return this;
	}
	get ( index ) {
		this._call_index(index, 'GET');
		return this;
	}
	post ( index ) {
		this._call_index(index, 'POST')
		return this;
	}
	_call_index ( index, meth ) {
		if( this.url === this.req.url && this.req.method === meth ){
			index( this );
		}
	}
}

const routerm = {  
	rou () { let Route = new Router( arguments ); return Route.rou.bind( Route ); } 
}

module.exports = routerm;

