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
	triangle: pointing-<up|down|left|right>;
	width: <length>;
	height: <length>;
	background-color: <color>;
}

.right-isosceles-triangle {
	triangle: right-iso pointing-<up|down|left|right>;
	<width|height>: <length>;
	background-color: <color>;
}

.equilateral-triangle {
	triangle: equilateral pointing-<up|down|left|right>;
	<width|height>: <length>;
	background-color: <color>;
}
```

### Triangle types

All triangle types have the following rules/caveats:
- You must specify a direction (`pointing-up`, `pointing-down`, `pointing-left` or `pointing-right`).
- You must provide a separate `background-color` declaration. This will transpile into a `border-color` in the opposite direction in which your triangle points. The `background-color` helps you forget about all that nonsense and just specify what _appears_ to be the background color, visually.
- Unfortunately, there is no way to set a triangle's actual `border` at this time. I considered using the `::before` pseudo-class to achieve this; however, it had a defect that was cutting it in half and I gave up. Feel free to submit a pull request with this feature if you have a solution for it.

Now, on to the triangle types!

#### Isosceles

<img src="https://github.com/jedmao/postcss-triangle/blob/master/images/isosceles-triangle.png?raw=true" alt="Isosceles Triangle (Default)" width="234" height="146" align="right">

This is the default and the most standard triangle you will create. It has two angles the same and two sides the same. The triangle will fit snug inside the `width` and `height` box that you define. Here's how you create one:

```css
.isosceles-triangle {
	triangle: pointing-right;
	width: 150px;
	height: 115px;
	background-color: red;
}
```

This transpiles into:

```css
.isosceles-triangle {
	width: 0;
	height: 0;
	border-style: solid;
	border-color: transparent;
	border-width: 57.5px 0 57.5px 150px;
	border-left-color: red;
}
```

[See it on CodePen!](http://codepen.io/jedmao/details/yNZJxE/)

This creates a triangle with `width: 150px; height: 115px;` and pointing right.

The isosceles triangle has the following rules/caveats:
- You must specify both a `width` and `height`.

#### [Right-Isosceles](http://mathworld.wolfram.com/IsoscelesRightTriangle.html)

<img src="https://github.com/jedmao/postcss-triangle/blob/master/images/right-isosceles-triangle.png?raw=true" alt="Right-Isosceles Triangle" width="300" height="125" align="right">

This triangle has two 45&deg; angles and one 90&deg; angle. The 90&deg; angle is the direction the triangle points. This is great if you want to render a triangle with the sharpest edge possible, because it follows the pixels on your screen exactly, without any additional anti-aliasing.

Iso is short for isosceles, because it's not the most fun word to spell/type; rather, it's only fun if you know how to spell it!

Here's how you create one:

```css
.right-isosceles-triangle {
	triangle: right-iso down;
	width: 250px;
	background-color: red;
}
```

This transpiles into:

```css
.right-isosceles-triangle {
	width: 0;
	height: 0;
	border-style: solid;
	border-color: transparent;
	border-width: 125px 125px 0;
	border-top-color: red;
}
```

[See it on CodePen!](http://codepen.io/jedmao/details/gpqMZg/)

This creates a triangle with `width: 250px; height: 125px;` and pointing down.

The right-isosceles triangle has the following rules/caveats:
- You must specify either a `width` or a `height`.
- You may not specify both a `width` and `height`, because it will calculate the missing dimension for you.

#### [Equilateral](https://en.wikipedia.org/wiki/Equilateral_triangle)

<img src="https://github.com/jedmao/postcss-triangle/blob/master/images/equilateral-triangle.png?raw=true" alt="Equilateral Triangle" width="250" height="181" align="right">

This triangle's angles are all the same (60&deg;). This means all sides are the same length as well. Here's how you create one:

```css
.equilateral-triangle {
	triangle: equilateral up;
	height: 100px;
	background-color: red;
}
```

This transpiles into:

```css
.equilateral-triangle {
	width: 0;
	height: 0;
	border-style: solid;
	border-color: transparent;
	border-width: 0 57.73503px 100px;
	border-bottom-color: red;
}
```

[See it on CodePen!](http://codepen.io/jedmao/details/waNWRq/)

This creates a triangle with `width: 115.47006px; height: 100px;` and pointing up.

The equilateral triangle has the following rules/caveats:
- You must specify either a `width` or a `height`.
- You may not specify both a `width` and `height`, because it will calculate the missing dimension for you.

That's about it!

## Installation

```
$ npm install postcss-triangle
```

## Usage

### JavaScript

```js
postcss([
	require('postcss-triangle')(/* options */),
	// more plugins...
])
```

### TypeScript

```ts
///<reference path="node_modules/postcss-triangle/.d.ts" />
import postcssTriangle = require('postcss-triangle');

postcss([
	postcssTriangle(/* options */),
	// more plugins...
])
```

## Options

### unitPrecision

Type: `number`<br>
Required: `false`<br>
Default: `5`

When using `right-iso` or `equilateral` triangles, calculations will be performed that will most likely turn into fractions. This option allows you to control the number of significant digits after the decimal point (e.g., `1.2354` with a `unitPrecision` of `2` would yield `1.24`, rounding it off nicely).

## Testing

Run the following command:

```
$ npm test
```

This will build scripts, run tests and generate a code coverage report. Anything less than 100% coverage will throw an error.

### Watching

For much faster development cycles, run the following command:

```
$ npm run watch
```

This will build scripts, run tests and watch for changes.
