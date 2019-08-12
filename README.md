# Heplers for generating HTML via Tagged Templates

Set of convinient pure functions for generating HTML on server-side via tagged template literals without any template langueges.

It's sort of lit-html (https://github.com/polymer/lit-html) but for Node.js.

## Why

I like to write small self-contained components (like in React). But I don't need SPA and I mostly generate HTML on a server. Server-side rendering in React is slow, expensive and it's overhead just for generating HTML.

I tried a few popular template language, like EJS, Nunjucs, Edge.js. They all great but I have a few problems with that:
- You need to learn new API and language syntax. 
- Most of them create AST that becomes slow when you use many little components (partials) and had complex control flow.
- Most of them (besides EJS) has very basic possibilities.
- In most of them, you have to use a separate file for every component. If you have many tiny components it becomes hard to manage all these files.

With es6 we can use tagged templates and solve all these problems. It also very fast, because V8 really good at optimizing string manipulations. Moving from Edge.js to pure functions reduce template generation from 20-25 ms to less than 1 ms (caching in Edge.js edge.js was enabled).

These helpers make working with HTML in JS strings a bit easier. 

## Usage

### 1. html

Useful for syntax highlighting via this plugin https://github.com/mjbvz/vscode-lit-html.

Keep in mind that it doesn't escape HTML in interpolated values deliberately, because if you'll use many small components it's easier when this is default behaviour. In you need escape HTML use 'safeHtml' function.

```js
import { html } from 'html-fns'

html`
  <div class="some-class">
    <h1>${title}</h1>
  </div>
	`
```


### 2. safeHtml

Works like 'html' function but escape all html in interpolated values. Can be used as normal function call and as tagged template.

```js
import { safeHtml } from 'html-fns'

safeHtml`
  <div class="some-class">
    <h1>${inputUserData}</h1>
  </div>
  `
  // OR

  safeHtml(inputUserData)
```


### 3. $each

Iterate through Array or Object and return string (concatenaed results).

```js
import { $each } from 'html-fns'

const data = { a: 1, b: 2 }

html`
	<div class="some-class">
		<h1>${$each(data, (item) => `hello ${item}`)}</h1>
	</div>
`
```


### 4. $if

Takes 2 arguments, both functions.

If function from 1 argument returns falsy-value or throws error - second function will not be executed.

If function from 1 argument returns truthy-value - second function will execute with argument that was returned from first function.

```js
import { $if } from 'html-fns'

html`
  ${$if(() => obj.some.data, (data) => {
    return 'you'
  })}
`
```


### 5. tag

Declarative way for creating HTML tags.

```js
import { tag } from 'html-fns'

tag('div', 'super-abstract-class', tag('p', false, 'hello'))
// -> <div class="super-abstract-class"><p>hello</p></div>

tag('div', { id: 'super-abstract-id' }, tag('div', 'list', [1, 2, 3, 4]))
// -> <div id="super-abstract-id"><div class="list">1 2 3 4</div></div>
```


### 6. removeHtmlComments

Just remove HTML-comments (<!-- like this -->) from string.


## Link and articles
 - https://github.com/vlucas/echotag
 - https://github.com/declandewet/common-tags
 - https://2ality.com/2015/01/template-strings-html.html
 - https://hackernoon.com/how-i-converted-my-react-app-to-vanillajs-and-whether-or-not-it-was-a-terrible-idea-4b14b1b2faff

