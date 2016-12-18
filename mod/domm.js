
class Dom { 
	constructor ( $doc ) {
		this.$doc = $doc;
	}
	byId ( id ) {
		return this.$doc.getElementById( id )
	}
	byCl( cl ){
		return this.$doc.getElementByClassName( cl )
	}
	create ( arg ) {
		let { el, id, type, val, cl } = arg;
		const $el = this.$doc.createElement( el );
		if( type ) $el.type = type ;
		if( val ) $el.setAttribute( 'value', val ); 
		if( id ) $el.setAttribute( 'id', id ); 
		if( cl ) $el.setAttribute( 'class', cl ); 
		return $el;
	}
	toBody ( $el ) {
		this.$doc.body.appendChild( $el );	
	}
	html () {
		return this.$doc.documentElement.outerHTML;
	}
}

module.exports = Dom;
 
