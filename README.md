# postcss-triangle

<img align="right" width="135" height="95"
	title="Philosopher’s stone, logo of PostCSS"
	src="http://postcss.github.io/postcss/logo-leftp.png">

[![NPM version](http://img.shields.io/npm/v/postcss-triangle.svg?style=flat)](https://www.npmjs.org/package/postcss-triangle)
[![npm license](http://img.shields.io/npm/l/postcss-triangle.svg?style=flat-square)](https://www.npmjs.org/package/postcss-triangle)
[![Travis Build Status](https://img.shields.io/travis/jedmao/postcss-triangle.svg?label=unix)](https://travis-ci.org/jedmao/postcss-triangle)
[![AppVeyor Build Status](https://img.shields.io/appveyor/ci/jedmao/postcss-triangle.svg?label=windows)](https://ci.appveyor.com/project/jedmao/postcss-triangle)

[![npm](https://nodei.co/npm/postcss-triangle.svg?downloads=true)](https://nodei.co/npm/postcss-triangle/)

[PostCSS](https://github.com/postcss/postcss) plugin to create a direction-facing triangle.

## Introduction

Creating triangles in CSS [is entirely complicated](https://css-tricks.com/snippets/css/css-triangle/), but it doesn't have to be!

Using this plugin, you can create three different types of triangles:

```css
.isosceles-triangle {
	triangle: <width> <height> <direction>;
}
.right-isosceles-triangle {
	triangle: right-iso <hypotenuse-length> <direction>;
}
.equilateral-triangle {
	triangle: equilateral <side-length> <direction>;
}
```

### Triangle types

#### Isosceles

This is the default and the most standard triangle you will create. It has two angles the same and two sides the same. The triangle will fit snug inside the `width` and `height` that you define. Here's how you create one:

```css
.foo {
	triangle: 150px 115px right;
	background-color: red;
}
```

This transpiles into:

```css
.foo {
	width: 0;
	height: 0;
	border-left:
}
```

This will create a triangle with a `width: 150px; height: 115px;` and facing in the `right` direction.


#### Right-Isosceles

Has two 45&deg; angles and one 90&deg; angle. The 90&deg; angle is the direction of the triangle. This triangle is great if you want to render a sharp edge... Here's how you create one with this plugin:

```css
.foo {
	triangle: right-iso 250px down;
}
```

This transpiles into:

```css

```

#### Equilateral

All angles are the same (60&deg;). This means all sides are the same length as well. Here's how you create one:

```css
.foo {
	triangle: equilateral 200px up;
}
```

This transpiles into:

```css

```






The `type` is the only optional property and its value can be either [`equilateral`](https://en.wikipedia.org/wiki/Equilateral_triangle) or [`right-iso`](http://mathworld.wolfram.com/IsoscelesRightTriangle.html). Iso is short for isosceles, because it's not the most fun word to spell; rather, it's only fun if you know how to spell it!

If you don't prefer the shorthand property, you can declare the following triangle-namespaced properties:

```css
.foo {
	triangle-type: <equilateral|right-iso>;
	triangle-width: <length>;
	triangle-height: <length>;
	triangle-direction: <up|right|down|left>;
}
```

Using [`postcss-nested-props`](https://github.com/jedmao/postcss-nested-props), this could be simplified to:

```css
.foo {
	triangle: {
		type: <equilateral|right-iso>;
		width: <length>;
		height: <length>;
		direction: <up|right|down|left>;
	}
}
```

See [`<length>`](https://developer.mozilla.org/en-US/docs/Web/CSS/length) for possible units.



That's about it!

## Installation

```
$ npm install postcss-triangle
```

## Usage

### JavaScript

```js
postcss([
	require('postcss-triangle'),
	// more plugins...
])
```

### TypeScript

```ts
///<reference path="node_modules/postcss-triangle/.d.ts" />
import postcssTriangle = require('postcss-triangle');

postcss([
	postcssTriangle,
	// more plugins...
])
```

## Options

None at this time.

## Testing

Run the following command:

```
$ ./scripts/test
```

This will build scripts, run tests and generate a code coverage report. Anything less than 100% coverage will throw an error.

### Watching

For much faster development cycles, run the following command:

```
$ ./scripts/watch
```

This will build scripts, run tests and watch for changes.
