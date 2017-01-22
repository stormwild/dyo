/*
 *  ___ __ __  
 * (   (  /  \ 
 *  ) ) )( () )
 * (___(__\__/ 
 * 
 * dio is a javascript framework for building applications.
 * 
 * @licence MIT
 */
(function (factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory(global);
	}
	else if (typeof define === 'function' && define.amd) {
		define(factory(window));
	}
	else {
		window.dio = factory(window);
	}
}(function (window) {


	'use strict';


	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * constants
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	// current version
	var version = '6.0.1';
	
	// enviroment specific variables
	var document = window.document || null;
	var browser = document !== null;
	var Promise = window.Promise;
	
	// namespaces
	var nsStyle = 'data-scope';
	var nsMath = 'http://www.w3.org/1998/Math/MathML';
	var nsXlink = 'http://www.w3.org/1999/xlink';
	var nsSvg = 'http://www.w3.org/2000/svg';
	
	// empty shapes
	var objEmpty = {};
	var arrEmpty = [];
	var nodeEmpty = createVNodeShape(0, '', objEmpty, arrEmpty, null, null, null, null, null);
	var funcEmpty = function () {};
	var fragProps = {style: 'display: inherit;'};
	
	
	/**
	 * call function with context
	 * 
	 * @param  {function} func
	 * @param  {any}      context
	 * @param  {any}      arg
	 * @return {any}
	 */
	function call (func, context, arg) {
		return func.call(context, arg);
	}
	
	
	/**
	 * element shape
	 *
	 * @public
	 * 
	 * @param  {string}               type
	 * @param  {Object<string, any>=} props
	 * @param  {VNode[]=}             children
	 * @return {VNode}
	 */
	function createElementShape (type, props, children) {
		return {
			nodeType: 1,
			type: type,
			props: props || objEmpty,
			children: children || [],
			DOMNode: null,
			instance: null,
			index: 0,
			parent: null,
			key: null
		};
	}
	
	
	/**
	 * component shape
	 *
	 * @public
	 * 
	 * @param  {(function|Component)} type
	 * @param  {Object<string, any>=} props
	 * @param  {any[]=}               children
	 * @return {VNode}
	 */
	function createComponentShape (type, props, children) {
		return {
			nodeType: 2,
			type: type,
			props: props || objEmpty,
			children: children || arrEmpty,
			DOMNode: null,
			instance: null,
			index: 0,
			parent: null,
			key: null
		};
	}
	
	
	/**
	 * fragment shape
	 *
	 * @public
	 * 
	 * @param  {VNode[]} children
	 * @return {VNode}
	 */
	function createFragmentShape (children) {
		return {
			nodeType: 1,
			type: 'fragment',
			props: fragProps,
			children: children,
			DOMNode: null,
			instance: null,
			index: 0,
			parent: null,
			key: null
		};
	}
	
	
	/**
	 * create text shape
	 *
	 * @public
	 * 
	 * @param  {(string|boolean|number)} text
	 * @return {VNode}
	 */
	function createTextShape (text) {
		return {
			nodeType: 3,
			type: '#text',
			props: objEmpty,
			children: text,
			DOMNode: null,
			instance: null,
			index: null,
			parent: null,
			key: null
		};
	}
	
	
	/**
	 * svg shape
	 *
	 * @public
	 * 
	 * @param  {string}               type
	 * @param  {Object<string, any>=} props
	 * @param  {VNode[]=}             children
	 * @return {VNode}
	 */
	function createSvgShape (type, props, children) {
		return {
			nodeType: 1,
			type: type,
			props: (props = props || {}, props.xmlns = nsSvg, props),
			children: children || [],
			DOMNode: null,
			instance: null,
			index: 0,
			parent: null,
			key: null
		};
	}
	
	
	/**
	 * create VNode shape
	 *
	 * @param  {number}                      nodeType
	 * @param  {(string|function|Component)} type
	 * @param  {Object<string, any>}         props
	 * @param  {VNode[]}                     children
	 * @param  {Node}                        DOMNode
	 * @param  {Component}                   instance
	 * @param  {number}                      index
	 * @param  {Component}                   parent
	 * @return {VNode}
	 */
	function createVNodeShape (nodeType, type, props, children, DOMNode, instance, index, parent, key) {
		return {
			nodeType: nodeType,
			type: type,
			props: props,
			children: children,
			DOMNode: DOMNode,
			instance: instance,
			index: index,
			parent: parent,
			key: key
		};
	}
	
	
	/**
	 * empty shape
	 * 
	 * @return {VNode}
	 */
	function createEmptyShape () {
		return {
			nodeType: 1,
			type: 'noscript',
			props: objEmpty,
			children: [],
			DOMNode: null,
			instance: null,
			index: 0,
			parent: null,
			key: null
		};
	}
	
	

	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * stylesheet
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * create scoped stylesheet
	 *
	 * @param {Component} component
	 * @param {function}  constructor
	 * @param {Node?}     element
	 */
	function createScopedStylesheet (component, constructor, element) {
		try {
			// create
			if (component.stylesheet.CSSNamespace === void 0) {
				createScopedCSS(component, constructor.COMPCache || constructor, true)(element);
			}
			// namespace
			else {
				component.stylesheet(element);
			}
		}
		catch (error) {
			componentErrorBoundary(error, component, 'stylesheet');
		}
	}
	
	
	/**
	 * create scoped css
	 * 
	 * @param  {Component}       component
	 * @param  {function}        constructor
	 * @param  {boolean}         inject
	 * @return {function(?Node)}
	 */
	function createScopedCSS (component, constructor, inject) {
		var namespace = component.displayName || constructor.name;
		var selector  = '['+nsStyle+'='+namespace+']';
		var css = component.stylesheet();
		var output = stylesheet(selector, css, true, true, null);
	
		if (browser && inject) {
			// obscure namesapce to avoid id/global namespace conflicts
			var id = '\''+namespace+'\'';
	
			// prevent duplicate styles when SSR outputs stylesheet
			if (document.getElementById(id) == null) {			
				var style = document.createElement('style');
				
				style.textContent = output;
				style.id = id;
	
				document.head.appendChild(style);
			}
		}
	
		/**
		 * decorator
		 * 
		 * @param  {?Node} DOMNode
		 * @return {(undefined|string)}
		 */
		function decorator (DOMNode) {
			// SSR
			if (DOMNode === null) {
				return output;
			}
			// DOM
			else {
				DOMNode.setAttribute(nsStyle, namespace);
			}
		}
	
		decorator.CSSNamespace = namespace;
	
		// replace stylesheet method for all instances with the style constructor `decorator`
		return component.stylesheet = constructor.prototype.stylesheet = decorator;
	}
	
	
	/**
	 * css compiler
	 *
	 * @public
	 *
	 * @example stylesheet('.foo', 'css...', true, true, null);
	 * 
	 * @param  {string}   selector   - i.e `.class` or `#id` or `[attr=id]`
	 * @param  {string}   styles     - css string
	 * @param  {boolean=} animations - prefix animations and keyframes, true by default
	 * @param  {boolean=} compact    - enable additional features(mixins and variables)
	 * @param  {function(context, content, line, column)=} middleware
	 * @return {string}
	 */
	function stylesheet (selector, styles, animations, compact, middleware) {
	    // to string
	    selector += '';
	
	    var prefix = '';
	    var namespace = '';
	    var type = selector.charCodeAt(0) || 0;
	
	    // [ attr selector
	    if (type === 91) {
	        // `[data-id=namespace]` -> ['data-id', 'namespace']
	        var attr = selector.substring(1, selector.length-1).split('=');
	        var char = (namespace = attr[1]).charCodeAt(0);
	
	        // [data-id="namespace"]/[data-id='namespace']
	        // --> "namespace"/'namspace' --> namespace
	        if (char === 34 || char === 39) {
	            namespace = namespace.substring(1, namespace.length-1);
	        }
	
	        prefix = '['+ attr[0] + '="' + namespace +'"]';
	    }
	    // `#` `.` `>` id class and descendant selectors
	    else if (type === 35 || type === 46 || type === 62) {
	        namespace = (prefix = selector).substring(1);
	    }
	    // element selector
	    else {
	        namespace = prefix = selector;
	    }
	
	    // reset type signature
	    type = 0;
	
	    // animation and keyframe namespace
	    var animns = (animations === void 0 || animations === true) ? namespace : '';
	
	    // uses middleware
	    var use = middleware != null;
	
	    // object
	    if (use) {
	        var uses = (typeof middleware).charCodeAt(0);
	
	        // o, object of middlewares
	        if (uses === 111) {
	            var keys = Object.keys(middleware).map(function (key) {
	                return [key, new RegExp(key+'\\([ \t\r\n]*([^\0]*?)[ \t\r\n]*\\)', 'g')];
	            });
	
	            var plugins = middleware;
	            var funcs = keys.length;
	
	            middleware = function (ctx, str, line, col) {
	                // block context
	                if (ctx === 2) {
	                    for (var i = 0; i < funcs; i++) {
	                        var plugin = keys[i];
	                        var key = plugin[0];
	                        var regex = plugin[1];
	
	                        str = str.replace(regex, function (match, capture) {
	                            return (
	                                    plugins[key].apply(
	                                    null, 
	                                    capture.replace(/[ \t\r\n]*,[ \t\r\n]*/g, ',').split(',')
	                                ) || match
	                            );
	                        });
	                    }
	
	                    return str;
	                }
	            };
	        }
	        // f, single function middleware
	        else if (uses !== 102) {
	            use = false;
	        }
	    }
	
	    var colon;
	    var inner;
	    var selectors;
	    var build;
	    var media;
	    var temp;
	    var prev;
	    var indexOf;
	
	    // variables
	    var variables;
	
	    // mixins
	    var mixins;
	    var mixin;
	
	    // buffers
	    var buff = '';
	    var blob = '';
	    var blck = '';
	    var nest = '';
	    var flat = '';
	
	    // positions
	    var caret = 0;
	    var depth = 0;
	    var column = 0;
	    var line = 1;
	    var eof = styles.length;
	
	    // context signatures       
	    var special = 0;
	    var close = 0;
	    var closed = 0;
	    var comment = 0;
	    var strings = 0;
	    var nested = 0;
	
	    // context(flat) signatures
	    var levels = 0;
	    var level = 0;
	
	    // prefixes
	    var moz = '-moz-';
	    var ms = '-ms-';
	    var webkit = '-webkit-';
	
	    var output = '';
	
	    // parse + compile
	    while (caret < eof) {
	        var code = styles.charCodeAt(caret);
	
	        // {, }, ; characters, parse line by line
	        if (strings === 0 && (code === 123 || code === 125 || code === 59)) {
	            buff += styles[caret];
	
	            var first = buff.charCodeAt(0);
	
	            // only trim when the first character is a space ` `
	            if (first === 32) {
	                first = (buff = buff.trim()).charCodeAt(0);
	            }
	
	            // default to 0 instead of NaN if there is no second/third character
	            var second = buff.charCodeAt(1) || 0;
	            var third = buff.charCodeAt(2) || 0;
	
	            // middleware, selector/property context, }
	            if (use && code !== 125) {
	                // { selector context
	                if (code === 123) {
	                    temp = middleware(0, buff.substring(0, buff.length-1).trim(), line, column);
	                } 
	                // ; property context
	                else {
	                    temp = middleware(1, buff, line, column);
	                }
	
	                if (temp !== void 0) {
	                    buff = code === 123 ? temp + '{' : temp;
	                }
	            }
	
	            // ignore comments
	            if (comment === 2) {
	                code === 125 && (comment = 0);
	                buff = ''; 
	            }
	            // @, special block
	            else if (first === 64) {
	                // push flat css
	                if (levels === 1 && flat.length !== 0) {
	                    levels = 0;
	                    flat = prefix + ' {' + flat + '}';
	
	                    // middleware, flat context
	                    if (use) {
	                        temp = middleware(3, flat, line, column);
	                    
	                        temp !== void 0 && (flat = temp);
	                    }
	
	                    output += flat;
	                    flat = '';
	                }
	
	                // @keyframe/@global, `k` or @global, `g` character
	                if (second === 107 || second === 103) {
	                    // k, @keyframes
	                    if (second === 107) {
	                        blob = buff.substring(1, 11) + animns + buff.substring(11);
	                        buff = '@'+webkit+blob;
	                        type = 1;
	                    }
	                    // g, @global
	                    else {
	                        buff = '';
	                    }
	                }
	                // @media/@mixin `m` character
	                else if (second === 109) {
	                    // @mixin
	                    if (compact === true && third === 105) {
	                        // first match create mixin store
	                        mixins === void 0 && (mixins = {});
	
	                        // retrieve mixin identifier
	                        blob = (mixin = buff.substring(7, buff.indexOf('{')) + ' ').trim();
	
	                        // cache current mixin name
	                        mixin = mixin.substring(0, mixin.indexOf(' ')).trim();
	
	                        // append mixin identifier
	                        mixins[mixin] = {key: blob.trim(), body: ''};
	
	                        type = 3;
	                        buff = '';
	                        blob = '';
	                    }
	                    // @media
	                    else if (third === 101) {
	                        // nested
	                        if (depth !== 0) {
	                            // discard first character {
	                            caret++;
	                            
	                            media = '';
	                            inner = '';
	                            selectors = prev.split(',');
	
	                            // keep track of opening `{` and `}` occurrences
	                            closed = 1;
	
	                            // travel to the end of the block
	                            while (caret < eof) {
	                                char = styles.charCodeAt(caret);
	
	                                // {, }, nested blocks may have nested blocks
	                                char === 123 ? closed++ : char === 125 && closed--;
	
	                                // break when the nested block has ended
	                                if (closed === 0) {
	                                    break;
	                                }
	
	                                // build content of nested block
	                                inner += styles[caret++];
	                            }
	
	                            for (var i = 0, length = selectors.length; i < length; i++) {
	                                selector = selectors[i];
	
	                                // build media block
	                                media += stylis(
	                                    // remove { on last selector
	                                    (i === length - 1 ? selector.substring(0, selector.length-1) :  selector).trim(),
	                                    inner, 
	                                    animations, 
	                                    compact, 
	                                    middleware
	                                );
	                            }
	
	                            media = buff + media + '}';
	                            buff = '';
	                            type = 4;
	                        }
	                        // top-level
	                        else {
	                            type = 2;
	                        }
	                    }
	                    // unknown
	                    else {
	                        type = 6;
	                    }
	                }
	
	                // @include/@import `i` character
	                if (second === 105) {   
	                    if (compact === true) {                 
	                        // @include `n` character
	                        if (third === 110) {
	                            buff = buff.substring(9, buff.length-1);
	                            indexOf = buff.indexOf('(');
	
	                            // function mixins
	                            if (indexOf > -1) {
	                                // mixin name
	                                var name = buff.substring(0, indexOf);
	
	                                // mixin data
	                                var data = mixins[name];
	
	                                // args passed to the mixin
	                                var argsPassed = buff.substring(name.length+1, buff.length-1).split(',');
	
	                                // args the mixin expects
	                                var argsExpected = data.key.replace(name, '').replace(/\(|\)/g, '').trim().split(',');
	                                
	                                buff = data.body;
	
	                                for (var i = 0, length = argsPassed.length; i < length; i++) {
	                                    var arg = argsExpected[i].trim();
	
	                                    // if the mixin has a slot for that arg
	                                    if (arg !== void 0) {
	                                        buff = buff.replace(new RegExp('var\\(~~'+arg+'\\)', 'g'), argsPassed[i].trim());
	                                    }
	                                }
	
	                                // create block and update styles length
	                                styles += buff;
	                                eof += buff.length;
	
	                                // reset
	                                buff = '';
	                            }
	                            // static mixins
	                            else {
	                                buff = mixins[buff].body;
	
	                                if (depth === 0) {
	                                    // create block and update styles length
	                                    styles += buff;
	                                    eof += buff.length;
	
	                                    // reset
	                                    buff = '';
	                                }
	                            }
	                        }
	                        // @import `m` character
	                        else if (third === 109 && use) {
	                            // avoid "foo.css"; "foo" screen; "http://foo.com/bar"; url(foo);
	                            var match = /@import.*?(["'][^\.\n\r]*?["'];|["'].*\.scss["'])/g.exec(buff);
	
	                            if (match !== null) {
	                                // middleware, import context
	                                buff = middleware(4, match[1].replace(/['"; ]/g, ''), line, column) || '';
	
	                                if (buff) {
	                                    // create block and update styles length
	                                    styles = styles.substring(0, caret+1) + buff + styles.substring(caret+1);
	                                    eof += buff.length;
	                                }
	
	                                buff = '';
	                            }
	                        }
	                    }
	                }
	                // flag special, i.e @keyframes, @global
	                else if (type !== 4) {
	                    close = -1;
	                    special++;
	                }
	            }
	            // ~, ; variables
	            else if (compact === true && code === 59 && first === 126 && second === 126) {
	                colon = buff.indexOf(':');
	
	                // first match create variables store 
	                variables === void 0 && (variables = []);
	
	                // push key value pair
	                variables[variables.length] = [buff.substring(0, colon), buff.substring(colon+1, buff.length-1).trim()];
	
	                // reset buffer
	                buff = '';
	            }
	            // property/selector
	            else {
	                // animation: a, n, i characters
	                if (first === 97 && second === 110 && third === 105) {
	                    // removes ;
	                    buff = buff.substring(0, buff.length-1);
	
	                    // position of :
	                    colon = buff.indexOf(':')+1;
	
	                    // left hand side everything before `:`
	                    build = buff.substring(0, colon);
	
	                    // right hand side everything after `:` /* @type string[] */
	                    var anims = buff.substring(colon).trim().split(',');
	
	                    // - short hand animation syntax
	                    if ((buff.charCodeAt(9) || 0) !== 45) {
	                        // because we can have multiple animations `animation: slide 4s, slideOut 2s`
	                        for (var j = 0, length = anims.length; j < length; j++) {
	                            var anim = anims[j];
	                            var props = anim.split(' ');
	
	                            // since we can't be sure of the position of the name of the animation we have to find it
	                            for (var k = 0, l = props.length; k < l; k++) {
	                                var prop = props[k].trim();
	                                var frst = prop.charCodeAt(0);
	                                var third = prop.charCodeAt(2);
	                                var slen = prop.length;
	                                var last = prop.charCodeAt(slen-1);
	
	                                // animation name is anything not in this list
	                                if (
	                                    // cubic-bezier()
	                                    !(frst === 99 && last === 41) &&
	
	                                    // infinite, i, f, e
	                                    !(frst === 105 && third === 102 && last === 101 && slen === 8) &&
	
	                                    // linear, l, n, r
	                                    !(frst === 108 && third === 110 && last === 114 && slen === 6) &&
	
	                                    // alternate, a, t, e
	                                    !(frst === 97 && third === 116 && last === 101 && slen === 9) &&
	
	                                    // normal, n, r, l
	                                    !(frst === 110 && third === 114 && last === 108 && slen === 6) &&
	
	                                    // backwords, b, c, s
	                                    !(frst === 98 && third === 99 && last === 115 && slen === 9) &&
	
	                                    // forwards, f, r, s
	                                    !(frst === 102 && third === 114 && last === 115 && slen === 8) &&
	
	                                    // both, b, t, h
	                                    !(frst === 98 && third === 116 && last === 104 && slen === 4) &&
	
	                                    // none, n, n, e
	                                    !(frst === 110 && third === 110 && last === 101 && slen === 4)&&
	
	                                    // ease, e, s, e
	                                    !(frst === 101 && third === 115 && last === 101 && slen === 4) &&
	
	                                    // ease-
	                                    !(frst === 101 && slen > 4 && prop.charCodeAt(4) === 45) &&
	
	                                    // durations 0.4ms, .4s, 400ms ...
	                                    isNaN(parseFloat(prop))
	                                ) {
	                                    props[k] = animns+prop;
	                                    anim = props.join(' ');
	                                }
	                            }
	
	                            build += (j === 0 ? '' : ',') + anim.trim();
	                        }
	                    }
	                    // explicit syntax, anims array should have only one elemenet
	                    else {
	                        // n
	                        build += ((buff.charCodeAt(10) || 0) !== 110 ? '' : animns) + anims[0].trim();
	                    }
	
	                    // vendor prefix
	                    buff = webkit + build + ';' + build + ';';
	                }
	                // appearance: a, p, p
	                else if (first === 97 && second === 112 && third === 112) {
	                    // vendor prefix -webkit- and -moz-
	                    buff = (
	                        webkit + buff + 
	                        moz + buff + 
	                        buff
	                    );
	                }
	                // display: d, i, s
	                else if (first === 100 && second === 105 && third === 115) {
	                    if (buff.indexOf('flex') > -1) {
	                        // vendor prefix
	                        buff = 'display:'+webkit+'box;display:'+webkit+'flex;'+ms+'flexbox;display:flex;';
	                    }
	                }
	                // transforms & transitions: t, r, a 
	                else if (first === 116 && second === 114 && third === 97) {
	                    // vendor prefix -webkit- and -ms- if transform
	                    buff = (
	                        webkit + buff + 
	                        (buff.charCodeAt(5) === 102 ? ms + buff : '') + 
	                        buff
	                    );
	                }
	                // hyphens: h, y, p
	                // user-select: u, s, e
	                else if (
	                    (first === 104 && second === 121 && third === 112) ||
	                    (first === 117 && second === 115 && third === 101)
	                ) {
	                    // vendor prefix all
	                    buff = (
	                        webkit + buff + 
	                        moz + buff + 
	                        ms + buff + 
	                        buff
	                    );
	                }
	                // flex: f, l, e
	                else if (first === 102 && second === 108 && third === 101) {
	                    // vendor prefix all but moz
	                    buff = (
	                        webkit + buff + 
	                        ms + buff + 
	                        buff
	                    );
	                }
	                // order: o, r, d
	                else if (first === 111 && second === 114 && third === 100) {
	                    // vendor prefix all but moz
	                    buff = (
	                        webkit + buff + 
	                        ms + 'flex-' + buff + 
	                        buff
	                    );
	                }
	                // align-items, align-center, align-self: a, l, i, -
	                else if (first === 97 && second === 108 && third === 105 && (buff.charCodeAt(5) || 0) === 45) {
	                    switch (buff.charCodeAt(6) || 0) {
	                        // align-items, i
	                        case 105: {
	                            temp = buff.replace('-items', '');
	                            buff = (
	                                webkit + 'box-' + temp + 
	                                ms + 'flex-'+ temp + 
	                                buff
	                            );
	                            break;
	                        }
	                        // align-self, s
	                        case 115: {
	                            buff = (
	                                ms + 'flex-item-' + buff.replace('-self', '') + 
	                                buff
	                            );
	                            break;
	                        }
	                        // align-content
	                        default: {
	                            buff = (
	                                ms + 'flex-line-pack' + buff.replace('align-content', '') + 
	                                buff
	                            );
	                            break;
	                        }
	                    }
	                }
	                // { character, selector declaration
	                else if (code === 123) {
	                    depth++;
	
	                    // push flat css
	                    if (levels === 1 && flat.length !== 0) {
	                        levels = 0;
	                        flat = prefix + ' {' + flat + '}';
	
	                        // middleware, flat context
	                        if (use) {
	                            temp = middleware(3, flat, line, column);
	                        
	                            temp !== void 0 && (flat = temp);
	                        }
	
	                        output += flat;
	                        flat = '';
	                    }
	
	                    if (special === 0 || type === 2) {
	                        // nested selector
	                        if (depth === 2) {
	                            // discard first character {
	                            caret++;
	
	                            // inner content of block
	                            inner = '';
	                            
	                            var nestSelector = buff.substring(0, buff.length-1).split(',');
	                            var prevSelector = prev.substring(0, prev.length-1).split(',');
	
	                            // keep track of opening `{` and `}` occurrences
	                            closed = 1;
	
	                            // travel to the end of the block
	                            while (caret < eof) {
	                                char = styles.charCodeAt(caret);
	
	                                // {, }, nested blocks may have nested blocks
	                                char === 123 ? closed++ : char === 125 && closed--;
	
	                                // break when the nested block has ended
	                                if (closed === 0) {
	                                    break;
	                                }
	
	                                // build content of nested block
	                                inner += styles[caret++];
	                            }
	
	                            // handle multiple selectors: h1, h2 { div, h4 {} } should generate
	                            // -> h1 div, h2 div, h2 h4, h2 div {}
	                            for (var j = 0, length = prevSelector.length; j < length; j++) {
	                                // extract value, prep index for reuse
	                                temp = prevSelector[j];
	                                prevSelector[j] = '';
	
	                                // since there could also be multiple nested selectors
	                                for (var k = 0, l = nestSelector.length; k < l; k++) {
	                                    selector = temp.replace(prefix, '').trim();
	
	                                    if (nestSelector[k].indexOf(' &') > 0) {
	                                        selector = nestSelector[k].replace('&', '').trim() + ' ' + selector;
	                                    }
	                                    else {
	                                        selector = selector + ' ' + nestSelector[k].trim();
	                                    }
	
	                                    prevSelector[j] += selector.trim() + (k === l - 1  ? '' : ',');
	                                }
	                            }
	
	                            // the `new line` is to avoid conflicts when the last line is a // line comment
	                            buff = ('\n' + prevSelector.join(',') + ' {'+inner+'}');
	
	                            // append nest
	                            nest += buff.replace(/&| +&/g, '');
	
	                            // signature
	                            nested = 1;
	
	                            // clear current line, to avoid adding nested blocks to the normal flow
	                            buff = '';
	
	                            // decreament depth
	                            depth--;
	                        }
	                        // top-level selector
	                        else {
	                            selectors = buff.split(',');
	                            build = '';
	
	                            // prefix multiple selectors with namesapces
	                            // @example h1, h2, h3 --> [namespace] h1, [namespace] h1, ....
	                            for (var j = 0, length = selectors.length; j < length; j++) {
	                                var firstChar = (selector = selectors[j]).charCodeAt(0);
	
	                                // ` `, trim if first character is a space
	                                if (firstChar === 32) {
	                                    firstChar = (selector = selector.trim()).charCodeAt(0);
	                                }
	
	                                // [, [title="a,b,..."]
	                                if (firstChar === 91) {
	                                    for (var k = j+1, l = length-j; k < l; k++) {
	                                        var broken = (selector += ',' + selectors[k]).trim();
	
	                                        // ], end
	                                        if (broken.charCodeAt(broken.length-1) === 93) {
	                                            length -= k;
	                                            selectors.splice(j, k);
	                                            break;
	                                        }
	                                    }
	                                }
	
	                                // &
	                                if (firstChar === 38) {
	                                    // before: & {
	                                    selector = prefix + selector.substring(1);
	                                    // after: ${prefix} {
	                                }
	                                else {
	                                    // default to :global if & exist outside of the first non-space character
	                                    if ((indexOf = selector.indexOf(' &')) > 0) {
	                                        // `:`
	                                        firstChar = 58;
	                                        // before: html & {
	                                        selector = ':global('+selector.substring(0, indexOf)+')' + selector.substring(indexOf);
	                                        // after: html ${prefix} {
	                                    }
	
	                                    // :
	                                    if (firstChar === 58) {
	                                        var secondChar = selector.charCodeAt(1);
	
	                                        // h, t, :host
	                                        if (secondChar === 104 && selector.charCodeAt(4) === 116) {
	                                            var nextChar = (selector = selector.substring(5)).charCodeAt(0);
	
	                                            // :host(selector)                    
	                                            if (nextChar === 40) {
	                                                // before: `(selector)`
	                                                selector = prefix + selector.substring(1).replace(')', '');
	                                                // after: ${prefx} selector {
	                                            }
	                                            // :host-context(selector)
	                                            else if (nextChar === 45) {
	                                                indexOf = selector.indexOf(')');
	
	                                                // before: `-context(selector)`
	                                                selector = (
	                                                    selector.substring(9, indexOf)+' '+prefix+selector.substring(indexOf+1)
	                                                );
	                                                // after: selector ${prefix} {
	                                            }
	                                            // :host
	                                            else {
	                                                selector = prefix + selector;
	                                            }
	                                        }
	                                        // g, :global(selector)
	                                        else if (secondChar === 103) {
	                                            // before: `:global(selector)`
	                                            selector = selector.substring(8).replace(')', '').replace('&', prefix);
	                                            // after: selector
	                                        }
	                                        // :hover, :active, :focus, etc...
	                                        else {
	                                            selector = prefix + selector;
	                                        }
	                                    }
	                                    // non-pseudo selectors
	                                    else {
	                                        selector = prefix + ' ' + selector;
	                                    }
	                                }
	
	                                // if first selector do not prefix with `,`
	                                build += (j === 0 ? selector : ',' + selector);
	                            }
	
	                            // cache current selector
	                            prev = (buff = build);
	                        }
	                    }
	                }
	                // } character
	                else if (code === 125) {
	                    if (depth !== 0) {
	                        depth--;
	                    }
	
	                    // concat nested css
	                    if (depth === 0 && nested === 1) {
	                        styles = styles.substring(0, caret+1) + nest + styles.substring(caret+1);
	                        eof += nest.length;
	                        nest = '';
	                        nested = 0;
	                        close++;
	                    }
	                }
	
	                // @global/@keyframes
	                if (special !== 0) {
	                    // }, find closing tag
	                    if (code === 125) {
	                        close++;
	                    } 
	                    // {
	                    else if (code === 123 && close !== 0) {
	                        close--;
	                    }
	
	                    // append flat @media css
	                    if (level === 1 && (code === 123 || close === 0) && flat.length !== 0) {
	                        level = 0;
	                        buff = prefix + ' {'+flat+'}' + buff;
	                        flat = '';
	                    }
	
	                    // closing tag
	                    if (close === 0) {
	                        // @global
	                        if (type === 0) {
	                            buff = '';
	                        }
	                        // @keyframes 
	                        else if (type === 1) {
	                            // vendor prefix
	                            buff = '}@'+blob+'}';
	
	                            // reset
	                            blob = '';
	                        }
	                        // @mixin
	                        else if (type === 3) {
	                            // append body of mixin
	                            mixins[mixin].body = blob;
	
	                            // reset
	                            mixin = '';
	                            buff = '';
	                            blob = '';
	                        }
	
	                        // reset signatures
	                        type = 0;
	                        close--;
	                        special--;
	                    }
	                    // @keyframes, @mixin
	                    else if (type === 1 || type === 3) {
	                        blob += buff;
	
	                        if (type === 3) {
	                            buff = '';
	                        }
	                    }
	                    // @media flat context
	                    else if (type === 2 && depth === 0) {
	                        if (code !== 125) {
	                            if (level === 0) {
	                                flat = '';
	                            }
	
	                            flat += buff;
	                            buff = '';
	                        }
	
	                        level = 1;
	                    }
	                }
	                // flat context
	                else if (depth === 0 && code !== 125) {
	                    levels = 1;
	                    flat = flat === void 0 ? buff : flat + buff;
	                    buff = '';
	                }
	            }
	
	            // append line to blck buffer
	            blck += buff;
	
	            // reset line buffer
	            buff = '';
	
	            // add blck buffer to output
	            if (code === 125 && comment === 0 && (type === 0 || type === 4)) {                  
	                // append if the block is not empty {}
	                if (blck.charCodeAt(blck.length-2) !== 123) {
	                    // middleware, block context
	                    if (use && blck.length !== 0) {
	                        temp = middleware(2, blck, line, column);
	
	                        temp !== void 0 && (blck = temp);
	                    }
	
	                    // append blck buffer
	                    output += blck.trim();
	                }
	
	                // nested @media
	                if (type === 4) {
	                    // middleware, block context
	                    if (use) {
	                        temp = middleware(2, media, line, column);
	
	                        temp !== void 0 && (media = temp);
	                    }
	
	                    // reset
	                    type = 0;
	
	                    // concat nested @media block
	                    output += media;
	                }
	
	                // reset blck buffer
	                blck = '';
	            }
	        }
	        // build line by line
	        else {
	            // \r, \n, new lines
	            if (code === 13 || code === 10) {
	                // ignore line and block comments
	                if (comment === 2) {
	                    buff = '';
	                    comment = 0;
	                }
	
	                column = 0;
	                line++;
	            }
	            // not `\t` tab character
	            else if (code !== 9) {
	                // " character
	                if (code === 34) {
	                    // exit string " context / enter string context
	                    strings = strings === 34 ? 0 : (strings === 39 ? 39 : 34);
	                }
	                // ' character
	                else if (code === 39) {
	                    // exit string ' context / enter string context
	                    strings = strings === 39 ? 0 : (strings === 34 ? 34 : 39);
	                }
	                // / character
	                else if (code === 47) {
	                    code === 47 && comment < 2 && comment++;
	                }
	
	                // build line buffer
	                buff += styles[caret];
	            }
	        }
	
	        // move caret position
	        caret++;
	
	        // move column position
	        column++;
	    }
	
	    // trailing flat css
	    if (flat !== void 0 && flat.length !== 0) {
	        flat = prefix + ' {' + flat + '}';
	
	        // middleware, flat context
	        if (use) {
	            temp = middleware(3, flat, line, column);
	        
	            temp !== void 0 && (flat = temp);
	        }
	
	        // append flat css
	        output += flat;
	    }
	
	    // has variables
	    if (compact && variables !== void 0) {
	        // replace all variables
	        for (var i = 0, l = variables.length; i < l; i++) {
	            output = output.replace(new RegExp('var\\('+variables[i][0]+'\\)', 'g'), variables[i][1]);
	        }
	    }
	
	    // middleware, output context
	    if (use) {
	        temp = middleware(5, output, line, column);
	    
	        temp !== void 0 && (output = temp);
	    }
	
	    return output;
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * element
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * create virtual element
	 *
	 * @public
	 * 
	 * @param  {(string|function|Component)} type
	 * @param  {Object<string, any>=}        props
	 * @param  {...any=}                     children
	 * @return {Object<string, any>}
	 */
	function createElement (type, props) {
		var length = arguments.length;
		var children = [];
		var position = 2;
	
		// if props is not a normal object
		if (props == null || props.nodeType !== void 0 || props.constructor !== Object) {
			// update position if props !== null
			if (props !== null) {
				props = null;
				position = 1; 
			}
		}
	
		if (length !== 1) {
			var index = 0;
			
			// construct children
			for (var i = position; i < length; i++) {
				var child = arguments[i];
				
				// only add non null/undefined children
				if (child != null) {
					// if array, flatten
					if (child.constructor === Array) {
						// add array child
						for (var j = 0, len = child.length; j < len; j++) {
							index = createChild(child[j], children, index);
						}
					}
					else {
						index = createChild(child, children, index);
					}
				}
			}
		}
	
		// component
		if (typeof type === 'function') {
			return createComponentShape(type, props, children);
		}
		// fragment
		else if (type === '@') {
			return createFragmentShape(children);
		} 
		else {
			if (props === null) {
				props = {};
			}
	
			// if props.xmlns is undefined and type === 'svg' or 'math' 
			// assign svg && math namespaces to props.xmlns
			if (props.xmlns === void 0) {	
				if (type === 'svg') { 
					props.xmlns = nsSvg; 
				}
				else if (type === 'math') { 
					props.xmlns = nsMath; 
				}
			}
	
			return createElementShape(type, props, children);
		}
	}
	
	
	/**
	 * create virtual child node
	 * 
	 * @param  {*}       child
	 * @param  {VNode[]} children
	 * @param  {number}  index
	 * @return {number}  index
	 */
	function createChild (child, children, index) {
		if (child != null) {
			if (child.nodeType !== void 0) {
				// Element
				children[index++] = child;
			}
			else {
				var type = typeof child;
	
				if (type === 'function') {
					// Component
					children[index++] = createComponentShape(child, null, null);
				}
				else if (type === 'object') {
					// Array
					for (var i = 0, len = child.length; i < len; i++) {
						index = createChild(child[i], children, index);
					}
				}
				else {
					// Text
					children[index++] = createTextShape(type !== 'boolean' ? child : '');
				}
			}
		}
	
		return index;
	}
	
	
	/**
	 * clone and return an element having the original element's props
	 * with new props merged in shallowly and new children replacing existing ones.
	 *
	 * @public
	 * 
	 * @param  {VNode}                subject
	 * @param  {Object<string, any>=} newProps
	 * @param  {any[]=}               newChildren
	 * @return {VNode}
	 */
	function cloneElement (subject, newProps, newChildren) {
		var type = subject.type;
		var props = subject.props;
		var children = newChildren || subject.children;
	
		newProps = newProps || {};
	
		// copy old props
		for (var name in subject.props) {
			if (newProps[name] === void 0) {
				newProps[name] = props[name];
			}
		}
	
		// replace children
		if (newChildren !== void 0) {
			var length = newChildren.length;
	
			// if not empty, copy
			if (length > 0) {
				var index = 0;
				
				children = [];
	
				// copy old children
				for (var i = 0; i < length; i++) {
					index = createChild(newChildren[i], children, index);
				}
			}
		}
	
		return createElement(type, newProps, children);
	}
	
	
	/**
	 * clone virtual node
	 * 
	 * @param  {VNode} subject
	 * @return {VNode}
	 */
	function cloneNode (subject) {
		return createVNodeShape(
			subject.nodeType,
			subject.type,
			subject.props,
			subject.children,
			subject.DOMNode,
			null,
			null,
			null,
			null
		);
	}
	
	
	/**
	 * create element factory
	 * 
	 * @param  {string}              type
	 * @param  {Object<string, any>} props
	 * @return {createElement(?Object<string>, ...any=)}
	 */
	function createFactory (type, props) {
		return props ? createElement.bind(null, type, props) : createElement.bind(null, type);
	}
	/**
	 * is valid element
	 *
	 * @public
	 * 
	 * @param  {any} subject
	 * @return {boolean}
	 */
	function isValidElement (subject) {
		return subject != null && subject.nodeType != null && subject.nodeName === void 0;
	}
	
	
	/**
	 * DOM factory, create vnode factories
	 *
	 * @public
	 * 
	 * @param  {string[]}                 types
	 * @return {Object<string, function>} elements
	 */
	function DOM (types) {
		var elements = {};
	
		// add element factories
		for (var i = 0, length = types.length; i < length; i++) {
			elements[types[i]] = createElementShape.bind(null, types[i]);
		}
		
		// if svg, add related svg element factory
		if (elements.svg !== void 0) {
			elements.svg = createSvgShape.bind(null, 'svg');
		}
	
		return elements;
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * component
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * set state
	 *
	 * @public
	 * 
	 * @param {Object}                    newState
	 * @param {function(this:Component)=} callback
	 */
	function setState (newState, callback) {
		// exist early if shouldComponentUpdate exists and returns false
		if (this.shouldComponentUpdate !== void 0 && 
			componentUpdateBoundary(this, 'shouldComponentUpdate', this.props, newState) === false) {
			return;
		}
	
		// update state
		updateState(this.state, newState);
	
		// callback
		if (callback != null && typeof callback === 'function') {
			componentStateBoundary(this, callback, 0);
		}
	
		// update component
		this.forceUpdate(null);
	}
	
	
	/**
	 * update state, hoisted to avoid `for in` deopts
	 * 
	 * @param {Object} oldState
	 * @param {Object} newState
	 */
	function updateState (oldState, newState) {
		for (var name in newState) {
			oldState[name] = newState[name];
		}
	}
	
	
	/**
	 * force an update
	 *
	 * @public
	 * 
	 * @param  {function(this:Component)=} callback
	 */
	function forceUpdate (callback) {
		if (this.componentWillUpdate !== void 0) {
			componentUpdateBoundary(this, 'componentWillUpdate', this.props, this.state);
		}
	
		var newNode = extractRenderNode(this);
		var oldNode = this.vnode;
	
		var newType = newNode.nodeType;
		var oldType = oldNode.nodeType;
	
		// different root node
		if (newNode.type !== oldNode.type) {
			// render returns a promise
			if (newType === void 0) {
				return;
			}
	
			replaceRootNode(newNode, oldNode, newType, oldType, this);
		} 
		// patch node
		else {
			// text root node
			if (oldType === 3) {
				if (newNode.children !== oldNode.children) {
					oldNode.DOMNode.nodeValue = oldNode.children = newNode.children;
				}
			} 
			// element root node
			else {
				patchNodes(newNode, oldNode, newType, oldType);
			}
		}
	
		if (this.componentDidUpdate !== void 0) {
			componentUpdateBoundary(this, 'componentDidUpdate', this.props, this.state);
		}
	
		// callback
		if (callback != null && typeof callback === 'function') {
			componentStateBoundary(this, callback, 1, null);
		}
	}
	
	
	/**
	 * Component class
	 *
	 * @public
	 * 
	 * @param {Object<string, any>=} props
	 */
	function Component (props) {
		// initial props
		if (this.getInitialProps !== void 0) {
			props = this.props = (
				componentDataBoundary(
					this, 
					'getInitialProps', 
					(props = (props === objEmpty ? {} : props) || {}) || props)
			);
	
			this.async = (
				props != null && props.constructor !== Object && typeof props.then === 'function'
			) ? true : false;
		}
		else {
			// assign props
			if (props !== objEmpty) {
				// hydrate default props
				if (this.getDefaultProps !== void 0) {
					assignDefaultProps(componentDataBoundary(this, 'getDefaultProps', props), props);
				}
				
				if (this.componentWillReceiveProps !== void 0) {
					componentPropsBoundary(this, props);
				}
	
				this.props = props;
			} 
			// default props
			else {
				this.props = (
					this.props || 
					(this.getDefaultProps !== void 0 && componentDataBoundary(this, 'getDefaultProps', null)) || 
					{}
				);
			}
	
			this.async = false;
		}
	
		// assign state
		this.state = (
			this.state || 
			(this.getInitialState !== void 0 && componentDataBoundary(this, 'getInitialState', null)) || 
			{}
		);
	
		this.thrown = 0;
		this.yield = false;
		this.vnode = null;
		this.refs = null;
	}
	
	
	/**
	 * Component prototype
	 * 
	 * @type {Object<string, function>}
	 */
	Component.prototype = Object.create(null, {
		setState: {value: setState},
		forceUpdate: {value: forceUpdate}
	});
	
	
	/**
	 * create class
	 *
	 * @public
	 * 
	 * @param  {(Object<string, any>|function(createElement): (Object<string, any>|function))} subject
	 * @return {function(new:Component, Object<string, any>)}
	 */
	function createClass (subject) {
		// empty class
		if (subject == null) {
			subject = createEmptyShape();
		}
	
		// component cache
		if (subject.COMPCache !== void 0) {
			return subject.COMPCache;
		}
	
		// is function?
		var func = typeof subject === 'function';
	
		// extract shape of component
		var shape = func ? (subject(createElement) || createEmptyShape()) : subject;
		
		var construct = false;
	
		var vnode;
		var constructor;
		var render;
	
		// numbers, strings, arrays
		if (shape.constructor !== Object && shape.render === void 0) {
			shape = extractVirtualNode(shape, null);
		}
	
		// elements/functions
		if (shape.nodeType !== void 0 || typeof shape === 'function') {
			// render method
			render = shape.nodeType !== void 0 ? (vnode = shape, function () { return vnode; }) : shape;
	
			// new shape
			shape = { render: render };
		}
		else {
			// shape has a constructor
			(construct = shape.hasOwnProperty('constructor')) && (constructor = shape.constructor);
	
			// create render method if one does not exist
			if (typeof shape.render !== 'function') {
				shape.render = function () { return createEmptyShape(); };
			}
		}
	
		// create component class
		function component (props) {
			// constructor
			construct && constructor.call(this, props);
	
			// extend Component
			Component.call(this, props); 
		}
	
		// extends shape
		component.prototype = shape;
	
		// extends Component class
		shape.setState = Component.prototype.setState;
		shape.forceUpdate = Component.prototype.forceUpdate;
		component.constructor = Component;
	
		// function shape, cache component
		if (func) {
			shape.constructor = subject;
			subject.COMPCache = component;
		}
	
		// stylesheet namespaced
		if (func || shape.stylesheet !== void 0) {
			// displayName / function name / random string
			shape.displayName = (
				shape.displayName || 
				(func ? subject.name : false) || 
				((Math.random()+1).toString(36).substr(2, 5))
			);
		}
	
		return component;
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * error boundries
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * mount error boundaries
	 *
	 * @param {Component} component
	 * @param {string}    method
	 * @param {Node}      DOMNode
	 */
	function componentMountBoundary (component, method, DOMNode) {	
		try {
			component[method](DOMNode);
		}
		catch (error) {
			componentErrorBoundary(error, component, method);
		}
	}
	
	
	/**
	 * update error boundaries
	 *
	 * @param  {Component} component
	 * @param  {string}    method
	 * @param  {Object}    newProps
	 * @param  {Object}    newState
	 * @return {boolean?}
	 */
	function componentUpdateBoundary (component, method, newProps, newState) {
		try {
			return component[method](newProps, newState);
		}
		catch (error) {
			componentErrorBoundary(error, component, method);
		}
	}
	
	
	/**
	 * state error boundaries
	 *
	 * @param {Component} component
	 * @param {function}  func
	 */
	function componentStateBoundary (component, func, location) {	
		try {
			return func.call(component);
		}
		catch (error) {
			componentErrorBoundary(error, component, location === 0 ? 'setState' : 'forceUpdate');
		}
	}
	
	
	/**
	 * props error boundaries
	 *
	 * @param {Component} component
	 * @param {Object}    props
	 */
	function componentPropsBoundary (component, props) {	
		try {
			component.componentWillReceiveProps(props);
		}
		catch (error) {
			componentErrorBoundary(error, component, 'componentWillReceiveProps');
		}
	}
	
	
	/**
	 * data error boundaries
	 *
	 * @param {Component} component
	 * @param {string}    method
	 * @param {Object}    props
	 */
	function componentDataBoundary (component, method, data) {	
		try {
			return component[method](data);
		}
		catch (error) {
			componentErrorBoundary(error, component, method);
		}
	}
	
	
	/**
	 * render error boundaries
	 *
	 * @param {Component} component
	 * @param {string}    type
	 * @param {string}    name
	 * @param {Error}     error
	 */
	function componentRenderBoundary (component, type, name, error) {
		return componentErrorBoundary(
			'Encountered an unsupported ' + type + ' type `'+ name + '`.\n\n' + error,
			component, 
			type
		);
	}
	
	
	/**
	 * generate error
	 *
	 * @param {string|Error} error
	 * @param {Component}    component
	 * @param {string}       location
	 * @param {Error}
	 */
	function componentErrorBoundary (error, component, location) {
		if (component == null) {
			return;
		}
	
		var newNode;
		var oldNode;
		var displayName;
		var authored;
		var thrown = component.thrown;
	
		component.thrown = thrown + 1;
	
		if ((error instanceof Error) === false) {
			error = new Error(error);
		}
	
		// intial throw from render, retry once
		if (thrown === 0 && browser && location === 'render') {
			setTimeout(call, 0, component.forceUpdate, component, null);
		}
		// multiple render throws / non-render location
		else {
			authored = typeof component.componentDidThrow === 'function';
	
			// define error
			Object.defineProperties(error, {
				silence: {value: false, writable: true},
				location: {value: location}, 
				from: {value: (displayName = component.displayName || component.constructor.name)}
			});
	
			// authored error handler
		    if (authored) {
		    	try {
		    		newNode = component.componentDidThrow(error);
		    	}
		    	catch (err) {
		    		if (thrown >= 0) {
		    			component.thrown = -1;
		    			componentErrorBoundary(err, component, 'componentDidThrow');
		    		}
		    	}
		    }
	
		    if (error.silence !== true) {
		    	// default error handler
		    	console.error(
		          'Dio caught an error thrown by ' + 
		          (displayName ? '`' + displayName + '`' : 'one of your components') + 
		          ', the error was thrown in `' + location + '`.' + 
		          '\n\n' + error.stack.replace(/\n+/, '\n\n')
		        );
		    }
	
		    if (authored && location !== 'stylesheet') {	    	
		    	// return render node
		    	if (location === 'render' || location === 'element') {
		    		if (typeof newNode.type === 'string') {
		    			if (/^[A-z]/g.exec(newNode.type) === null) {
	    					console.error(
	    						'Dio bailed out of rendering an error state.\n\n'+
	    						'Reason: `componentDidThrow` returned an invalid element `'+ newNode.type +'`'
							);
	
		    				return;
		    			}
	
		    			newNode.type = newNode.type.replace(/ /g, '');
		    		}
	
		    		return newNode;
		    	}
		    	// async replace render node
		    	else if (browser && newNode != null && newNode !== true && newNode !== false) {	 
					setTimeout(
						replaceRootNode, 
						0, 
						extractVirtualNode(newNode), 
						oldNode = component.vnode, 
						newNode.nodeType, 
						oldNode.nodeType, 
						component
					)
		    	}
		    }
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * render components
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * extract component
	 * 
	 * @param  {VNode} subject
	 * @return {VNode} 
	 */
	function extractComponentNode (subject) {
		/** @type {Component} */
		var owner;
	
		/** @type {(Component|function(new:Component, Object<string, any>))} */
		var type = subject.type;
	
		/** @type {Object<string, any>} */
		var props = subject.props;
	
		// default props
		if (type.defaultProps !== void 0) {
			// clone default props if props is not an empty object, else use defaultProps as props
			props !== objEmpty ? assignDefaultProps(type.defaultProps, props) : (props = type.defaultProps);
		}
	
		// assign children to props if not empty
		if (subject.children.length !== 0) {
			// prevents mutating the empty object constant
			if (props === objEmpty) {
				props = { children: subject.children };
			}
			else {
				props.children = subject.children;			
			}
		}
		
		// cached component
		if (type.COMPCache !== void 0) {
			owner = type.COMPCache;
		} 
		// function components
		else if (type.constructor === Function && (type.prototype === void 0 || type.prototype.render === void 0)) {
			// create component
			owner = createClass(type);
		}
		// class / createClass components
		else {
			owner = type;
		}
	
		// create component instance
		var component = subject.instance = new owner(props);
		
		// retrieve vnode
		var vnode = extractRenderNode(component);
	
		// if render returns a component, extract that component
		if (vnode.nodeType === 2) {
			vnode = extractComponentNode(vnode);
		}
		
		// if keyed, assign key to vnode
		if (props.key !== void 0 && vnode.props.key === void 0) {
			vnode.props.key = props.key;
		}
	
		// replace props and children
		subject.props    = vnode.props
		subject.children = vnode.children;
	
		// assign reference to component and return vnode
		(component.vnode = vnode).parent = subject;
	
		return vnode;
	}
	
	
	/**
	 * extract a render function
	 *
	 * @param  {Component} component
	 * @return {VNode}
	 */
	function extractRenderNode (component) {
		try {
			// async render
			if (component.async === true) {			
				if (browser) {
					component.props.then(function resolveAsyncClientComponent (props) {
						component.props = props;
						component.forceUpdate();
					}).catch(funcEmpty);
					
					component.async = false;
				}
	
				return createEmptyShape();
			}
			// generator
			else if (component.yield) {
				return extractVirtualNode(
					component.render.next().value, 
					component
				);
			}
			// sync render
			else {
				return extractVirtualNode(
					component.render(component.props, component.state, component), 
					component
				);
			}
		}
		// error thrown
		catch (error) {
			return componentErrorBoundary(error, component, 'render') || createEmptyShape();
		}
	}
	
	
	/**
	 * render to virtual node
	 * 
	 * @param  {(VNode|function|Component)} subject
	 * @param  {Component}                  component
	 * @return {VNode}
	 */
	function extractVirtualNode (subject, component) {
		// empty
		if (subject == null) {
			return createEmptyShape();
		}
		// element
		else if (subject.nodeType !== void 0) {
			return subject;
		}
		else {
			switch (subject.constructor) {
				// component
				case Component: {
					return createComponentShape(subject, null, null);
				}
				// fragment
				case Array: {
					return createElement('@', null, subject);
				}
				// string/number
				case String: case Number: {
					return createTextShape(subject);
				}
				// component/function
				case Function: {
					// component
					if (subject.prototype !== void 0 && subject.prototype.render !== void 0) {
						return createComponentShape(subject, null, null);
					}
					// function
					else {
						return createComponentShape(createClass(subject), null, null);
					}
				}
				// promise
				case Promise: {
					if (browser) {
						subject.then(function resolveAsyncComponent (newNode) {
							replaceRootNode(
								extractVirtualNode(newNode), 
								subject = component.vnode, 
								newNode.nodeType, 
								subject.nodeType, 
								component
							);
						}).catch(funcEmpty);
					}
					else {
						component.async = subject;
					}
	
					return createEmptyShape();
				}
				default: {
					// coroutine
					if (subject.return != null && typeof subject.next === 'function' && component != null) {
						component.yield = true;
						component.render = subject;
	
						if (component.constructor.prototype !== void 0) {
							component.constructor.prototype.render = function render () {
								return subject.next().value;
							};
						}
	
						return extractVirtualNode(subject.next().value, component);
					}
					// component descriptor
					else if (typeof subject.render === 'function') {
						return (
							subject.COMPCache || 
							createComponentShape(subject.COMPCache = createClass(subject), null, null)
						);
					} 
					// unsupported render types, fail gracefully
					else {
						return componentRenderBoundary(
							component,
							'render', 
							subject.constructor.name, 
							''
						) || createEmptyShape();
					}
				}
			}
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * render
	 * 
	 * ---------------------------------------------------------------------------------
	 */
		
	
	/**
	 * render
	 *
	 * @public
	 * 
	 * @param  {(Component|VNode|function|Object<string, any>)} subject
	 * @param  {(Node|string)=}                                 target
	 * @param  {function(this:Component, Node)=}                callback
	 * @param  {boolean=}                                       hydration
	 * @return {function(Object=)}
	 */
	function render (subject, target, callback, hydration) {
		var initial = true;
		var nodeType = 2;
		
		var component;	
		var vnode;
		var element;
		
		// renderer
		function renderer (newProps) {
			if (initial) {
				// dispatch mount
				appendNode(nodeType, vnode, element, createNode(vnode, null, null));
	
				// register mount has been dispatched
				initial = false;
	
				// assign component instance
				component = vnode.instance;
			}
			else {
				// update props
				if (newProps !== void 0) {
					// component with shouldComponentUpdate
					if (component.shouldComponentUpdate !== void 0 && 
						componentUpdateBoundary(component, 'shouldComponentUpdate', newProps, component.state) === false) {
						// exit early
						return renderer;
					}
	
					component.props = newProps;
				}
	
				// update component
				component.forceUpdate(null);
			}
	
			return renderer;
		}
	
		// exit early
		if (browser === false) {
			return renderer;
		}
	
		// Object
		if (subject.render !== void 0) {
			vnode = createComponentShape(createClass(subject));
		}
		// array/Component/function
		else if (subject.nodeType === void 0) {
			// fragment
			if (subject.constructor === Array) {
				vnode = createElement('@', null, subject);
			}
			// component
			else {
				vnode = createComponentShape(subject);
			}
		} 
		// element/component
		else {
			vnode = subject;
		}
	
		// mount
	  	if (target != null && target.nodeType != null) {
	  		// target is a dom element
	  		element = target === document ? docuemnt.body : target;
		} 
		else {
	  		// selector
	  		target = document.querySelector(target);
	
	  		// default to document.body if no match/document
	  		element = (target === null || target === document) ? document.body : target;
		}
	
		// element
		if (vnode.nodeType !== 2) {
			vnode = createComponentShape(createClass(subject));
		}
	
		// hydration
		if (hydration != null && hydration !== false) {
			// dispatch hydration
			hydrate(element, vnode, typeof hydration === 'number' ? hydration : 0, null, null);
	
			// register mount has been dispatched
			initial = false;
	
			// assign component
			component = vnode.instance;
		} 
		else {
			// destructive mount
			hydration === false && (element.textContent = '');
			
			renderer();
		}
	
		// if present call root components context, passing root node as argument
		if (callback && typeof callback === 'function') {
			callback.call(component, vnode.DOMNode || target);
		}
	
		return renderer;
	}
	
	
	/**
	 * shallow render
	 *
	 * @public
	 * 
	 * @param  {(VNode|Component|function)}
	 * @return {VNode}
	 */
	function shallow (subject) {
		if (isValidElement(subject)) {
			return subject.nodeType === 2 ? extractComponentNode(subject) : subject;
		}
		else {
			return extractComponentNode(createElement(subject, null, null));
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * render props
	 * 
	 * ---------------------------------------------------------------------------------
	 */
		
	
	/**
	 * assign prop for create element
	 * 
	 * @param  {Node}       target
	 * @param  {Object}     props
	 * @param  {boolean}    onlyEvents
	 * @param  {Component}  component
	 */
	function assignProps (target, props, onlyEvents, component) {
		for (var name in props) {
			assignProp(target, name, props, onlyEvents, component);
		}
	}
	
	
	/**
	 * assign prop for create element
	 * 
	 * @param  {Node}       target
	 * @param  {string}     name
	 * @param  {Object}     props
	 * @param  {boolean}    onlyEvents,
	 * @param  {Component}  component
	 */
	function assignProp (target, name, props, onlyEvents, component) {
		if (isEventName(name)) {
			addEventListener(target, extractEventName(name), props[name], component);
		}
		else if (onlyEvents === false) {
			// add attribute
			updateProp(target, 'setAttribute', name, props[name], props.xmlns);
		}
	}
	
	
	/**
	 * patch props
	 * 
	 * @param  {VNode} newNode
	 * @param  {VNode} oldNode
	 */
	function patchProps (newNode, oldNode) {
		var diff   = diffProps(newNode, oldNode, newNode.props.xmlns || '', []);
		var length = diff.length;
	
		// if diff length > 0 apply diff
		if (length !== 0) {
			var target = oldNode.DOMNode;
	
			for (var i = 0; i < length; i++) {
				var prop = diff[i];
				// [0: action, 1: name, 2: value, namespace]
				updateProp(target, prop[0], prop[1], prop[2], prop[3]);
			}
	
			oldNode.props = newNode.props;
		}
	}
	
	
	/**
	 * collect prop diffs
	 * 
	 * @param  {VNode}   newNode 
	 * @param  {VNode}   oldNode 
	 * @param  {string}  namespace
	 * @param  {Array[]} diff
	 * @return {Array[]}          
	 */
	function diffProps (newNode, oldNode, namespace, diff) {
		// diff newProps
		for (var newName in newNode.props) { 
			diffNewProps(newNode, oldNode, newName, namespace, diff); 
		}
	
		// diff oldProps
		for (var oldName in oldNode.props) { 
			diffOldProps(newNode, oldName, namespace, diff); 
		}
	
		return diff;
	}
	
	
	/**
	 * diff newProps agains oldProps
	 * 
	 * @param  {VNode}   newNode 
	 * @param  {VNode}   oldNode 
	 * @param  {string}  newName
	 * @param  {string}  namespace
	 * @param  {Array[]} diff
	 * @return {Array[]}          
	 */
	function diffNewProps (newNode, oldNode, newName, namespace, diff) {
		var newValue = newNode.props[newName];
		var oldValue = oldNode.props[newName];
	
		if (newValue != null && oldValue !== newValue) {
			diff[diff.length] = ['setAttribute', newName, newValue, namespace];
		}
	}
	
	
	/**
	 * diff oldProps agains newProps
	 * 
	 * @param  {VNode}   newNode 
	 * @param  {Object}  oldName 
	 * @param  {string}  namespace
	 * @param  {Array[]} diff
	 * @return {Array[]}          
	 */
	function diffOldProps (newNode, oldName, namespace, diff) {
		var newValue = newNode.props[oldName];
	
		if (newValue == null) {
			diff[diff.length] = ['removeAttribute', oldName, '', namespace];
		}
	}
	
	
	/**
	 * assign/update/remove prop
	 * 
	 * @param  {Node}   target
	 * @param  {string} action
	 * @param  {string} name
	 * @param  {any}    propValue
	 * @param  {string} namespace
	 */
	function updateProp (target, action, name, propValue, namespace) {
		// avoid refs, keys, events and xmlns namespaces
		if (name === 'ref' || 
			name === 'key' || 
			isEventName(name) || 
			propValue === nsSvg || 
			propValue === nsMath
		) {
			return;
		}
	
		// if xlink:href set, exit, 
		if (name === 'xlink:href') {
			return (target[action + 'NS'](nsXlink, 'href', propValue), void 0);
		}
	
		var isSVG = false;
		var propName;
	
		// svg element, default to class instead of className
		if (namespace === nsSvg) {
			isSVG = true;
			propName = name === 'className' ? 'class' : name;
		}
		// html element, default to className instead of class
		else {
			propName = name === 'class' ? 'className' : name;
		}
	
		var targetProp = target[propName];
		var isDefinedValue = propValue != null && propValue !== false;
	
		// objects
		if (isDefinedValue && typeof propValue === 'object') {
			targetProp === void 0 ? target[propName] = propValue : updatePropObject(propName, propValue, targetProp);
		}
		// primitives `string | number | boolean`
		else {
			// id, className etc..
			if (targetProp !== void 0 && isSVG === false) {
				target[propName] = propValue;
			}
			// setAttribute/removeAttribute
			else {
				if (isDefinedValue) {
					// reduce value to an empty string if true, <tag checked=true> --> <tag checked>
					propValue === true && (propValue = '');
	
					target.setAttribute(propName, propValue);
				}
				else {
					// remove attributes with false/null/undefined values
					target.removeAttribute(propName);
				}
			}
		}
	}
	
	
	/**
	 * update prop objects, i.e .style
	 *
	 * @param {string} parent
	 * @param {Object} prop
	 * @param {Object} target
	 */
	function updatePropObject (parent, prop, target) {
		for (var name in prop) {
			var value = prop[name] || null;
	
			// assign if target object has property
			if (name in target) {
				target[name] = value;
			}
			// style properties that don't exist on CSSStyleDeclaration
			else if (parent === 'style') {
				// assign/remove
				value ? target.setProperty(name, value, null) : target.removeProperty(name);
			}
		}
	}
	
	
	/**
	 * assign default props
	 * 
	 * @param  {Object<string, any>} defaultProps
	 */
	function assignDefaultProps (defaultProps, props) {
		for (var name in defaultProps) {
			props[name] = props[name] || defaultProps[name];
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * render nodes
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * create DOMNode
	 *
	 * @param {number}    type
	 * @param {Component} component
	 */
	function createDOMNode (type, component) {
		try {
			return document.createElement(type);
		} 
		catch (error) {
			return createDOMNodeError(
				componentRenderBoundary(component, 'element', type, error),
				component
			);
		}
	}
	
	
	/**
	 * create namespaced DOMNode
	 *
	 * @param {namespace} namespace
	 * @param {number}    type
	 * @param {Componnet} component
	 */
	function createDOMNodeNS (namespace, type, component) {
		try {
			return document.createElementNS(namespace, type);
		}
		catch (error) {
			return createDOMNodeError(
				componentRenderBoundary(component, 'element', type, error),
				component
			);
		}
	}
	
	
	/**
	 * create error state DOMNode
	 * 
	 * @param  {VNode}      vnode
	 * @param  {Component?} component
	 * @return {Node}
	 */
	function createDOMNodeError (vnode, component) {
		// empty, null/undefined
		if (vnode == null) {
			return createNode(createEmptyShape(), null, null);
		}
		// string, number, element, array
		else {
			return createNode(createElement('@', null, vnode), component, null);
		}
	}
	
	
	/**
	 * create node
	 * 
	 * @param  {VNode}      subject
	 * @param  {?Component} component
	 * @param  {?string}    namespace
	 * @return {Node}
	 */
	function createNode (subject, component, namespace) {
		var nodeType = subject.nodeType;
		
		// create text node element	
		if (nodeType === 3) {
			return subject.DOMNode = document.createTextNode(subject.children);
		}
	
		// hoisted, clone DOMNode, ensure fragments are not cloned
		if (subject.DOMNode !== null) {
			return subject.DOMNode = subject.DOMNode.cloneNode(true);
		}
	
		// create
		var vnode = nodeType === 2 ? extractComponentNode(subject) : subject;
		var type = vnode.type;
		var children = vnode.children;
		var props = vnode.props;
		var length = children.length;
		var element;
	
		var thrown = 0;
		var vnodeType = vnode.nodeType;
	
		// text
		if (vnodeType === 3) {
			return vnode.DOMNode = subject.DOMNode = document.createTextNode(children);
		}
	
		var instance = subject.instance !== null;
	
		// assign namespace
		if (props.xmlns !== void 0) { 
			namespace = props.xmlns; 
		}
	
		// has a component instance
		if (instance) {
			// hydrate component instance
			component = subject.instance;
			thrown = component.thrown;
		}
	
		// create namespaced element
		if (namespace !== null) {
			// if undefined, assign svg namespace
			if (props.xmlns === void 0) {
				props === objEmpty ? (props = {xmlns: namespace}) : (props.xmlns = namespace);
			}
	
			element = createDOMNodeNS(namespace, type, component);
		}
		// create html element
		else {
			element = createDOMNode(type, component);
		}
	
		// stylesheets
		if (instance) {
			// avoid appending children if an error was thrown
			if (thrown !== 0 || thrown !== component.thrown) {
				return vnode.DOMNode = subject.DOMNode = element;
			}
	
			if (component.vnode.DOMNode === null) {
				component.vnode.DOMNode = element;
			}
	
			if (nodeType === 2 && component.stylesheet !== void 0 && type !== 'noscript') {
				createScopedStylesheet(component, subject.type, element);
			}
		}
	
		// has children
		if (length !== 0) {
			// append children
			for (var i = 0; i < length; i++) {
				var newChild = children[i];
	
				// hoisted, clone VNode
				if (newChild.DOMNode !== null) {
					newChild = children[i] = cloneNode(newChild);
				}
	
				// append child
				appendNode(newChild.nodeType, newChild, element, createNode(newChild, component, namespace));					
			}
		}
	
		// props is not an empty object
		if (props !== objEmpty) {
			// refs
			if (props.ref !== void 0) {
				refs(props.ref, component, element);
			}
	
			// props and events
			assignProps(element, props, false, component);
		}
	
		// cache element reference
		return vnode.DOMNode = subject.DOMNode = element;
	}
	
	
	/**
	 * append node
	 *
	 * @param {number} newType
	 * @param {VNode}  newNode
	 * @param {Node}   parentNode
	 * @param {Node}   nextNode
	 */
	function appendNode (newType, newNode, parentNode, nextNode) {
		if (newType === 2 && newNode.instance !== null && newNode.instance.componentWillMount) {
			componentMountBoundary(newNode.instance, 'componentWillMount', nextNode);
		}
	
		// append element
		parentNode.appendChild(nextNode);
	
		if (newType === 2 && newNode.instance !== null && newNode.instance.componentDidMount) {
			componentMountBoundary(newNode.instance, 'componentDidMount', nextNode);
		}
	}
	
	
	/**
	 * insert node
	 *
	 * @param {number} newType
	 * @param {VNode}  newNode
	 * @param {Node}   prevNode
	 * @param {Node}   parentNode
	 * @param {Node}   nextNode
	 */
	function insertNode (newType, newNode, prevNode, parentNode, nextNode) {
		if (newType === 2 && newNode.instance !== null && newNode.instance.componentWillMount) {
			componentMountBoundary(newNode.instance, 'componentWillMount', nextNode);
		}
	
		// insert element
		parentNode.insertBefore(nextNode, prevNode);
	
		if (newType === 2 && newNode.instance !== null && newNode.instance.componentDidMount) {
			componentMountBoundary(newNode.instance, 'componentDidMount', nextNode);
		}
	}
	
	
	/**
	 * remove node
	 *
	 * @param {number} oldType
	 * @param {VNode}  oldNode
	 * @param {Node}   parentNode
	 */
	function removeNode (oldType, oldNode, parentNode) {
		if (oldType === 2 && oldNode.instance !== null && oldNode.instance.componentWillUnmount) {
			componentMountBoundary(oldNode.instance, 'componentWillUnmount', oldNode.DOMNode);
		}
	
		// remove element
		parentNode.removeChild(oldNode.DOMNode);
	
		// clear references
		oldNode.DOMNode = null;
	}
	
	
	/**
	 * replace node
	 *
	 * @param {VNode} newType
	 * @param {VNode} oldType
	 * @param {VNode} newNode
	 * @param {VNode} oldNode
	 * @param {Node}  parentNode 
	 * @param {Node}  nextNode
	 */
	function replaceNode (newType, oldType, newNode, oldNode, parentNode, nextNode) {
		if (oldType === 2 && oldNode.instance !== null && oldNode.instance.componentWillUnmount) {
			componentMountBoundary(oldNode.instance, 'componentWillUnmount', oldNode.DOMNode);
		}
	
		if (newType === 2 && newNode.instance !== null && newNode.instance.componentWillMount) {
			componentMountBoundary(newNode.instance, 'componentWillMount', nextNode);
		}
	
		// replace element
		parentNode.replaceChild(nextNode, oldNode.DOMNode);
		
		if (newType === 2 && newNode.instance !== null && newNode.instance.componentDidMount) {
			componentMountBoundary(newNode.instance, 'componentDidMount', nextNode);
		}
	
		// clear references
		oldNode.DOMNode = null;
	}
	
	
	/**
	 * replace root node
	 * 
	 * @param  {VNode}     newNode
	 * @param  {VNode}     oldNode
	 * @param  {number}
	 * @param  {number}
	 * @param  {Component} component
	 */
	function replaceRootNode (newNode, oldNode, newType, oldType, component) {
		var key = oldNode.props.key;
		var node = oldNode.parent;
	
		// replace node
		replaceNode(
			newType, 
			oldType, 
			newNode, 
			oldNode, 
			oldNode.DOMNode.parentNode, 
			createNode(newNode, component, null)
		);
	
		// stylesheet
		if (newType !== 3 && component.stylesheet !== void 0) {
			createScopedStylesheet(component, component.constructor, newNode.DOMNode);
		}
	
		// hydrate new node
		oldNode.nodeType = newType;
		oldNode.type = newNode.type;
		oldNode.props = newNode.props;
		oldNode.children = newNode.children;
		oldNode.DOMNode = newNode.DOMNode;
		oldNode.instance = newNode.instance = component;
	
		node.type = component.constructor;
		node.props = newNode.props;
		node.children = newNode.children;
		node.DOMNode = newNode.DOMNode;
		node.instance = component;
	
		if (key !== void 0) {
			node.props === objEmpty ? (node.props = {key: key}) : (node.props.key = key);
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * render events
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * add event listener
	 *
	 * @param {Node}            element
	 * @param {string}          name
	 * @param {function|Object} listener
	 * @param {Component}       component
	 */
	function addEventListener (element, name, listener, component) {
		// default listener
		if (typeof listener === 'function') {
			element.addEventListener(name, listener, false);
		}
		// non-default listener
		else {
			element.addEventListener(name, bindEvent(name, listener, component), listener.options || false);
		}
	}
	
	
	/**
	 * extract event name from prop
	 * 
	 * @param  {string} name
	 * @return {string}
	 */
	function extractEventName (name) {
		return name.substring(2).toLowerCase();
	}
	
	
	/**
	 * check if a name is an event-like name, i.e onclick, onClick...
	 * 
	 * @param  {string} name
	 * @return {boolean}
	 */
	function isEventName (name) {
		return name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110 && name.length > 3;
	}
	
	
	/**
	 * bind event
	 *
	 * @param  {string}              name
	 * @param  {Object<string, any>} value
	 * @param  {Component}           component
	 * @return {function}
	 */
	function bindEvent (name, value, component) {
		var bind = value.bind || value.handler;
		var data = value.with || value.data;
		var preventDefault = value.preventDefault === true || (!value.options && value.preventDefault === void 0);
	
		if (typeof bind === 'object') {
			var property = bind.property || data;
	
			return function (event) {
				var target = event.currentTarget || event.target;
				var value = data in target ? target[data] : target.getAttribute(data);
	
				preventDefault && event.preventDefault();
	
				// update component state
				component.state[property] = value;
	
				// update component
				component.forceUpdate();
			}
		} 
		else {
			return function (event) {
				preventDefault && event.preventDefault();
				bind.call(data, data, event);
			}
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * render refs
	 * 
	 * ---------------------------------------------------------------------------------
	 */
		
	
	/**
	 * refs
	 *
	 * @param {(string|function(Node))} ref
	 * @param {Component}               component
	 * @param {Node}                    element
	 */
	function refs (ref, component, element) {
		if (typeof ref === 'function') {
			ref.call(component, element);
		}
		else {
			(component.refs = component.refs || {})[ref] = element;
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * reconciler
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * patch keyed nodes
	 *
	 * @param {Object<string, any>[2]} keys
	 * @param {Node}                   parentNode
	 * @param {VNode}                  newNode
	 * @param {VNode}                  oldNode
	 * @param {number}                 newLength
	 * @param {number}                 oldLength
	 * @param {number}                 pos
	 */
	function patchKeys (keys, parentNode, newNode, oldNode, newLength, oldLength, pos) {
		var reconciled = new Array(newLength);
		var childNodes = parentNode.childNodes;
	
		// children
		var newChildren = newNode.children;
		var oldChildren = oldNode.children;
	
		// keys
		var newKeys = keys[0];
		var oldKeys = keys[1];
	
		// position
		var inserted = 0;
		var added = 0;
		var removed = 0;
		var i = 0;
		var index = 0;
	
		// VNodes
		var newChild;
		var oldChild;
	
		// DOMNodes
		var nextNode;
		var prevNode;
	
		// signatures
		var nodeType;
	
		// hydrate clean nodes
		if (pos !== 0) {
			for (var i = 0; i < pos; i++) {
				reconciled[i] = oldChildren[i];
			}
		}
	
		// old children
		for (var i = pos; i < oldLength; i++) {
			oldChild = oldChildren[i];
			newChild = newKeys[oldChild.key];
	
			// removed
			if (newChild === void 0) {
				removeNode(oldChild.nodeType, oldChild, parentNode);
				removed++;
			}
	
			// update forward indexes
			if (removed !== 0) {
				oldChild.index -= removed;
			}
		}
	
		oldLength -= removed;
	
		// new children
		for (var i = pos; i < newLength; i++) {
			newChild = newChildren[i];
			oldChild = oldKeys[newChild.key];
	
			// new
			if (oldChild === void 0) {
				nodeType = newChild.nodeType;
				nextNode = createNode(newChild, null, null);
	
				// insert
				if (i < oldLength + added) {
					oldChild = oldChildren[i - added];
					prevNode = oldChild.DOMNode;
	
					insertNode(nodeType, newChild, prevNode, parentNode, nextNode);
	
					// update forward indexes
					oldChild.index += ++inserted;
				} 
				// append
				else {
					appendNode(nodeType, newChild, parentNode,nextNode);
				}
	
				added++;
	
				reconciled[i] = newChild;
			}
			// old
			else {
				index = oldChild.index;
	
				// moved
				if (index !== i) {
					if (newChild.key !== oldChildren[i - added].key) {
						prevNode = childNodes[i];
						nextNode = oldChild.DOMNode;
	
						if (prevNode !== nextNode) {
							parentNode.insertBefore(nextNode, prevNode);
						}
					}
				}
	
				reconciled[i] = oldChild;
			}
		}
	
		oldNode.children = reconciled;
	}
	
	/**
	 * patch nodes
	 *  
	 * @param  {VNode}  newNode
	 * @param  {VNode}  oldNode
	 * @param  {number} newNodeType
	 * @param  {number} oldNodeType
	 */
	function patchNodes (newNode, oldNode, newNodeType, oldNodeType) {	
		// if newNode and oldNode, exit early
		if (newNode === oldNode) {
			return;
		}
	
		// extract node from possible component node
		var currentNode = newNodeType === 2 ? extractComponentNode(newNode) : newNode;
	
		// a component
		if (oldNodeType === 2) {
			// retrieve components
			var oldComponent = oldNode.instance;
			var newComponent = newNode.instance;
	
			// retrieve props
			var newProps = newComponent.props;
			var newState = newComponent.state;
	
			// component with shouldComponentUpdate
			if (oldComponent.shouldComponentUpdate !== void 0 && 
				componentUpdateBoundary(oldComponent, 'shouldComponentUpdate', newProps, newState) === false) {
				// exit early
				return;
			}
	
			// component with componentWillUpdate
			if (oldComponent.componentWillUpdate !== void 0) {
				componentUpdateBoundary(oldComponent, 'componentWillUpdate', newProps, newState);
			}
		}
	
		// children
		var newChildren = currentNode.children;
		var oldChildren = oldNode.children;
	
		// children length
		var newLength = newChildren.length;
		var oldLength = oldChildren.length;
	
		// no children
		if (newLength === 0) {
			// remove all children if old children is not already cleared
			if (oldLength !== 0) {
				oldNode.DOMNode.textContent = '';
				oldNode.children = newChildren;
			}
		}
		// has children
		else {
			// new node has children
			var parentNode = oldNode.DOMNode;
	
			// when keyed, the position that dirty keys begin
			var pos = 0;
	
			// non-keyed until the first dirty key is found
			var keyed = false;
	
			// un-initialized key hash maps
			var oldKeys;
			var newKeys;
	
			var newKey;
			var oldKey;
	
			// the highest point of interest
			var length = newLength > oldLength ? newLength : oldLength;
	
			// children nodes
			var newChild;
			var oldChild;
	
			// children types
			var newType;
			var oldType;
	
			// for loop, the end point being which ever is the 
			// greater value between new length and old length
			for (var i = 0; i < length; i++) {
				// avoid accessing out of bounds index and nodeType where unnecessary
				newType = i < newLength ? (newChild = newChildren[i]).nodeType : (newChild = nodeEmpty, 0);
				oldType = i < oldLength ? (oldChild = oldChildren[i]).nodeType : (oldChild = nodeEmpty, 0);
	
				if (keyed) {
					// push keys
					if (newType !== 0) {
						newKeys[newKey = newChild.props.key] = (
							newChild.index = i, 
							newChild.key = newKey, 
							newChild
						);
					}
	
					if (oldType !== 0) {
						oldKeys[oldKey = oldChild.props.key] = (
							oldChild.index = i, 
							oldChild.key = oldKey, 
							oldChild
						);
					}
				}
				// remove
				else if (newType === 0) {
					oldLength--;
	
					removeNode(oldType, oldChildren.pop(), parentNode);
				}
				// add
				else if (oldType === 0) {
					appendNode(
						newType, 
						oldChildren[oldLength++] = newChild, 
						parentNode, 
						createNode(newChild, null, null)
					);
				}
				// text
				else if (newType === 3 && oldType === 3) {
					if (newChild.children !== oldChild.children) {
						oldChild.DOMNode.nodeValue = oldChild.children = newChild.children;
					}
				}
				// key
				else if ((newKey = newChild.props.key) !== (oldKey = oldChild.props.key)) {
					keyed = true; 
					pos = i;
					oldKeys = {}; 
					newKeys = {};
	
					// push keys
					newKeys[newKey] = (newChild.index = i, newChild.key = newKey, newChild);
					oldKeys[oldKey] = (oldChild.index = i, oldChild.key = oldKey, oldChild);
				}
				// replace
				else if (newChild.type !== oldChild.type) {
					replaceNode(
						newType, 
						oldType, 
						oldChildren[i] = newChild, 
						oldChild, 
						parentNode, 
						createNode(newChild, null, null)
					);
				}
				// noop
				else {
					patchNodes(newChild, oldChild, newType, oldType);
				}
			}
	
			// reconcile keyed children
			if (keyed) {
				// new and old keys object are of differing shapes
				patchKeys([newKeys, oldKeys], parentNode, newNode, oldNode, newLength, oldLength, pos);
			}
		}
	
		// props objects of the two nodes are not equal, patch
		if (currentNode.props !== oldNode.props) {
			patchProps(currentNode, oldNode);
		}
	
		// component with componentDidUpdate
		if (oldNodeType === 2 && oldComponent.componentDidUpdate !== void 0) {
			componentUpdateBoundary(oldComponent, 'componentDidUpdate', newProps, newState);
		}
	}
	
	


	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * exports
	 * 
	 * ---------------------------------------------------------------------------------
	 */


	if (browser) {
		window.h = createElement;
	}

	return {
		// version
		version: version,

		// alias
		h: createElement,

		// elements
		createElement: createElement,
		isValidElement: isValidElement,
		cloneElement: cloneElement,
		createFactory: createFactory,
		DOM: DOM,

		// render
		render: render,
		shallow: shallow,

		// components
		Component: Component,
		createClass: createClass,

		// shapes
		text: createTextShape,
		element: createElementShape,
		svg: createSvgShape,
		fragment: createFragmentShape,
		component: createComponentShape,

		// stylesheet
		stylesheet: stylesheet
	};
}));