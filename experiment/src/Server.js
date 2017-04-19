// hollow nodes
var hollow = {'area': 0, 'base': 0, 'br': 0, '!doctype': 0, 'col': 0, 'embed': 0, 'wbr': 0, 'track': 0,
'hr': 0, 'img': 0, 'input': 0, 'keygen': 0, 'link': 0, 'meta': 0, 'param': 0, 'source': 0};

// unicode characters
var unicodes = {'<': '&lt;', '>': '&gt;','"': '&quot;',"'": '&#39;','&': '&amp;'};

/**
 * Stringify Tree
 *
 * @return {String}
 */
TreePrototype.toString = function () {
	if (this.group > 0) {
		return extract(this).toString();
	}
	var newer = this;
	var group = newer.group;
	var type = newer.type;
	var flag = newer.flag;
	var tag = newer.tag;
	var children = newer.children;
	var body = '';
	var length = 0;
	var props;

	if (flag === 1) {
		return sanitize(children);
	}
	if (newer.props !== object && newer.props.innerHTML !== void 0) {
		body = newer.props.innerHTML;
	} else if ((length = children.length) > 0) {
		for (var i = 0; i < length; i++) {
			body += children[i].toString();
		}
	}
	return '<'+tag+attrs(newer)+'>'+ (hollow[tag] !== 0 ? body+'</'+tag+'>' : '');
}

/**
 * Stringify Attributes
 *
 * @param  {Tree} newer
 * @return {String}
 */
function attrs (newer) {
	var props = newer.props;
	var body = '';
	var value;
	var val;

	if (props === object) {
		return body;
	}

	for (var name in props) {
		if (evt(name) === true) {
			continue;
		}
		value = props[name];

		switch (name) {
			case 'key': case 'children': case 'ref': case 'innerHTML': {
				continue;
			}
			case 'style': {
				if (typeof value === 'object') {
					name = '';
					for (var key in value) {
						val = value[key];
						if (key !== key.toLowerCase()) {
							key = key.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').replace(/^(ms|webkit|moz)/, '-$1').toLowerCase();
						}
						name += key + ':' + val + ';';
					}
					value = name;
				}
				value = ' style="'+sanitize(value)+'"';
				break;
			}
			case 'defaultValue': {
				value = props.value === void 0 ? ' value="'+sanitize(value)+'"' : '';
				break;
			}
			case 'class': case 'className': {
				value = ' class="'+sanitize(value)+'"';
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
 * @param  {String} _char
 * @return {String}
 */
function encode (_char) {
	var char = unicodes[char];
	return char !== void 0 ? char : _char;
}