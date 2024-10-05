// Helper function to check if an object is empty (including arrays)
const isEmpty = (obj) => {
	if (obj == null) return true
	if (Array.isArray(obj)) return obj.length === 0
	if (typeof obj === 'object') return Object.keys(obj).length === 0
	return false
}

///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

const noop = (strings, ...expressions) => {
	let result = strings[0]
	for (let i = 1, l = strings.length; i < l; i++) {
		result += expressions[i - 1]
		result += strings[i]
	}
	return result
}

export default noop
export const html = noop
export const css = noop

///////////////////////////////////////////////////////////////////////////////
// ESCAPE HTML
///////////////////////////////////////////////////////////////////////////////

const matchHtmlRegExp = /["'&<>]/

const htmlEscapes = {
	'"': '&quot;',
	'&': '&amp;',
	"'": '&#39;',
	'<': '&lt;',
	'>': '&gt;',
}

/**
 * Escape special characters in the given string of text.
 *
 * @param {string} string - The string to escape for inserting into HTML
 * @return {string}
 */
function escapeHtmlFunc(string) {
	const str = '' + string
	const match = matchHtmlRegExp.exec(str)

	if (!match) {
		return str
	}

	let html = ''
	let lastIndex = 0
	let index

	for (index = match.index; index < str.length; index++) {
		const escape = htmlEscapes[str[index]]
		if (escape) {
			if (lastIndex !== index) {
				html += str.substring(lastIndex, index)
			}
			html += escape
			lastIndex = index + 1
		}
	}

	return lastIndex !== index ? html + str.substring(lastIndex, index) : html
}

/**
 * Escape html. Can be used as 'Tagged Template literal' or 'Function'
 *
 * @returns {string}
 */
export const safeHtml = (strings, ...vars) => {
	// In tagged templates, the first argument is an array and it has the ".raw" property.
	if (Array.isArray(strings.raw)) {
		const escapedVars = vars.map(escapeHtmlFunc)
		return html(strings, ...escapedVars)
	}
	// If it's not an array, then it's a string.
	return escapeHtmlFunc(strings)
}

export const escapeHtml = escapeHtmlFunc

///////////////////////////////////////////////////////////////////////////////
// ITERATION & CONDITIONAL
///////////////////////////////////////////////////////////////////////////////

/**
 * Convinient tteratation through Array or Object (values)
 *
 * @param {array|object|number} collection
 * @param {function} callback
 *
 * @returns {string}
 */
export const $each = (collection, callback) => {
	let iterable

	if (typeof collection === 'number') {
		iterable = Array.from({ length: collection }, (_, i) => i)
	} else {
		iterable = collection
	}

	let html = ''

	if (Array.isArray(iterable)) {
		for (let i = 0; i < iterable.length; i++) {
			const returnedFromCallback = callback(iterable[i], i)
			if (returnedFromCallback) {
				html += returnedFromCallback
			}
		}
	} else if (typeof iterable === 'object' && iterable !== null) {
		for (const key in iterable) {
			if (Object.prototype.hasOwnProperty.call(iterable, key)) {
				const returnedFromCallback = callback(iterable[key], key)
				if (returnedFromCallback) {
					html += returnedFromCallback
				}
			}
		}
	}

	return html
}

/**
 * Don't render result if condition falsy or empty or throws an error.
 *
 * @param {*} condition
 * @param {function} result
 *
 * @returns {*}
 */
export const $if = (condition, result) => {
	let evaluatedCondition = condition

	if (typeof condition === 'function') {
		try {
			evaluatedCondition = condition()
		} catch {
			return ''
		}
	}

	if (
		evaluatedCondition === false ||
		evaluatedCondition == null ||
		evaluatedCondition === '' ||
		isEmpty(evaluatedCondition)
	) {
		return ''
	}

	return result(evaluatedCondition)
}

///////////////////////////////////////////////////////////////////////////////
// GENERIC HELPERS
///////////////////////////////////////////////////////////////////////////////

/**
 * Create HTML tag
 *
 * @param {string} tag
 * @param {string|object} attributesOrClass
 * @param {string|array} content
 *
 * @returns {string}
 */
export const tag = (tag, attributesOrClass, content) => {
	let attributesText = ''

	if (typeof attributesOrClass === 'string') {
		attributesText = ` class="${attributesOrClass}"`
	}

	if (typeof attributesOrClass === 'object') {
		attributesText += Object.entries(attributesOrClass)
			.map(([attribute, value]) => {
				return `${attribute}="${value}"`
			})
			.join(' ')

		attributesText = ' ' + attributesText
	}

	if (Array.isArray(content)) {
		content = content.join(' ')
	}

	return `<${tag}${attributesText}>${content}</${tag}>`
}

export const div = (attributes, content) => tag('div', attributes, content)
export const span = (attributes, content) => tag('span', attributes, content)
export const p = (attributes, content) => tag('p', attributes, content)

/**
 * Remove comments from HTML string.
 *
 * @param {string} str
 *
 * @returns {string}
 */
export const removeHtmlComments = (str) => {
	return str.replace(/(<!--.*?-->)|(<!--[\w\W\n\s]+?-->)/gm, '')
}
