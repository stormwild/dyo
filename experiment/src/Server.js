/**
 * Stringify Attributes
 *
 * @param  {Tree} newer
 * @return {String}
 */
function attributes (newer) {
	var attrs = newer.attrs;
	var body = '';

	if (attrs === object) {
		return body;
	}

	for (var name in attrs) {
		var value = attrs[name];

		switch (whitelist(name)) {
			case 10: case 21: case 30: case 31: {
				continue;
			}
			case 1: {
				value = ' class="'+sanitize(value)+'"';
				break;
			}
			case 5: {
				value = attrs.value === void 0 ? ' value="'+sanitize(value)+'"' : '';
				break;
			}
			case 20: {
				if (typeof value === 'object') {
					name = '';
					for (var key in value) {
						var val = value[key];

						if (key !== key.toLowerCase()) {
							key = dashcase(key);
						}

						name += key + ':' + val + ';';
					}
					value = name;
				}

				value = ' style="'+sanitize(value)+'"';
				break;
			}
			default: {
				switch (value) {
					case false: case null: case void 0: continue;
					case true: body += ' '+name; continue;
				}

				value = ' '+name+'="'+sanitize(value)+'"';
			}
		}

		body += value;
	}

	return body;
}

/**
 * Sanitize String
 *
 * @param  {String|Boolean|Number} value
 * @return {String}
 */
function sanitize (value) {
	return (value+'').replace(/[<>&"']/g, encode);
}

/**
 * Encode Unicode
 *
 * @param  {String} char
 * @return {String}
 */
function encode (char) {
	return unicodes[char] || char;
}

/**
 * camelCase to dash-case
 *
 * @param  {String} str
 * @return {String}
 */
function dashcase (str) {
	return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').replace(/^(ms|webkit|moz)/, '-$1').toLowerCase();
}

/**
 * Unicode Characters
 *
 * @type {Object}
 */
var unicodes = {'<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;'};

/**
 * readable
 *
 * @type {Readable}
 */
var readable = require('stream').Readable;

/**
 * Hollow
 *
 * @param {String}
 * @return {Boolean}
 */
function hollow (name) {
	switch (name) {
		case 'area':
		case 'base':
		case 'br':
		case '!doctype':
		case 'meta':
		case 'source':
		case 'keygen':
		case 'img':
		case 'col':
		case 'embed':
		case 'wbr':
		case 'track':
		case 'param':
		case 'link':
		case 'input':
		case 'hr': return true;
		default: return false;
	}
}

/**
 * To String [Prototype]
 *
 * @return {String}
 */
function toString () {
	var newer = this;
	var group = newer.group;

	if (group > 0) {
		return extract(newer, false).toString();
	}

	var type = newer.type;
	var flag = newer.flag;
	var tag = newer.tag;
	var children = newer.children;
	var body = '';
	var length = 0;

	switch (flag) {
		case 1: return sanitize(children);
		case 6: return '';
	}

	if (newer.attrs !== object && newer.attrs.innerHTML !== void 0) {
		body = newer.attrs.innerHTML;
	} else if ((length = children.length) > 0) {
		for (var i = 0; i < length; i++) {
			body += children[i].toString();
		}
	}

	return '<' + tag + attributes(newer) + '>' + (hollow(tag) === true ? '' : body + '</' + tag + '>');
};

/**
 * String Render
 *
 * @param {Any} newer
 * @return {String}
 */
function renderToString (newer) {
	return shape(newer, null, false).toString();
};

/**
 * Shallow Render
 *
 * @param  {Any} value
 * @return {Tree}
 */
function shallow (value) {
	var newer = shape(value, null, false);

	if (newer.group === 0) {
		return newer;
	}

	return extract(newer, false);
}

/**
 * Stream Render
 *
 * @param {Any} subject
 * @return {Stream}
 */
function renderToStream (subject) {
	return new Stream(shape(subject, null, true));
}

/**
 * Stream
 *
 * @param {Any} subject
 */
function Stream (newer) {
	this.stack = [this.root = newer];

	readable.call(this);
}

/**
 * Stream Prototype
 *
 * @type {Object}
 */
Stream.prototype = Object.create(readable.prototype, {
	_type: {
		value: 'text/html'
	},
	_read: {
		value: function read () {
			var stack = this.stack;
			var size = stack.length;

			if (size === 0) {
				// end
				this.push(null);
			} else {
				// pipe
				var newer = stack[size-1];

				if (newer.yield === true) {
					stack.pop();
					this.push(newer.node);
				} else {
					if (newer.group > 0) {
						while (newer.group > 0) {
							newer = extract(newer, false);
						}
					}

					switch (newer.flag) {
						case 1: {
							stack.pop();
							this.push(sanitize(newer.children));
							return;
						}
						case 6: {
							stack.pop();
							this.push('');
							return;
						}
					}

					if (newer.attrs !== object && newer.attrs.innerHTML !== void 0) {
						stack.pop();
						this.push(newer.attrs.innerHTML);
						return;
					}

					var type = newer.type;
					var tag = newer.tag;
					var children = newer.children;
					var length = children.length;
					var node = '<' + tag + attributes(newer) + '>';

					if (length === 0) {
						// no children
						stack.pop();
						this.push(hollow(tag) === true ? node : node + '</' + tag + '>');
					} else if (length === 1 && children[0].flag === 1) {
						// one text child
						stack.pop();
						this.push(node + sanitize(children[0].children) + '</' + tag + '>');
					} else {
						newer.yield = true;
						newer.node = '</' + tag + '>';

						// push children to the stack
						for (var i = length - 1; i >= 0; i--) {
							stack[size++] = children[i];
						}

						this.push(node);
					}
				}
			}
		}
	}
});

/**
 * Exports
 */
exports.shallow = shallow;
exports.renderToString = renderToString;
exports.renderToStream = renderToStream;

element.prototype.toString = toString;
