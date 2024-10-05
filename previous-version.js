import _ from 'lodash'

///////////////////////////////////////////////////////////////////////////////
// PRIVATE
///////////////////////////////////////////////////////////////////////////////

const escapeHtml = (html) => {
	// Late we cn use https://github.com/component/escape-html
	return _.escape(html)
}

///////////////////////////////////////////////////////////////////////////////
// TAG TEMPLATES
///////////////////////////////////////////////////////////////////////////////

/**
 * Tagged Template literal
 * 
 * Automatically calls function and concat arrays in expressions.
 * 
 * @returns {string}
 */
export const html = (strings, ...vars) => {
	return strings.reduce((accumulator, part, i) => {
		let variable = vars[i - 1]

		if (Array.isArray(variable)) {
			variable = variable.join(' ')
		} else if (typeof variable === 'function') {
			variable = variable()
		}

		return accumulator + variable + part
	})
}

/**
 * Escape html. Can be used as 'Tagged Template literal' or 'Function'
 * 
 * @returns {string}
 */
export const safeHtml = (strings, ...vars) => {
	if (!strings) {
		return ''
	}

	// Позвояет вызывать как обычную функцию
	if (typeof strings === 'string' || _.isNumber(strings)) {
		return escapeHtml(strings)
	}

	// В tagged templates первый аргумент массив и он имеет свойства ".raw".
	if (Array.isArray(strings.raw)) {
		const escapedVars = vars.map(escapeHtml)
		return html(strings, ...escapedVars)
	}
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

/**
 * Convinient tteratation through Array or Object (values)
 *
 * @param {array|object|number} collection
 * @param {function} calllback
 * 
 * @returns {string}
 */
export const $each = (collection, calllback) => {
	const iterable = typeof collection === 'number' ? _.range(collection) : collection

	let html = ''

	_.forEach(iterable, (value, key) => {
		const returnedFromCallback = calllback(value, key)
		if (returnedFromCallback) {
			html += returnedFromCallback
		}
	})
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
	if (typeof condition === 'function') {
		try {
			condition = condition()
		} catch (error) {
			return ''
		}
	}

	if (_.isObject(condition) && _.isEmpty(condition)) {
		return ''
	}
	if (!condition) {
		return ''
	}
	return result(condition)
}