import test, { ContextualTestContext } from 'ava';
import * as postcss from 'postcss';

import * as plugin from './plugin';

test('throws when a triangle type of "bar" is defined', macro,
	`foo {
		triangle: bar pointing-up;
	}`,
	/Unsupported type: bar/
);

test('throws when a direction of "bar" is defined', macro,
	`foo {
		triangle: bar;
		width: 100px;
		height: 100px;
	}`,
	/Unsupported direction: bar/
);

['right-iso', 'equilateral'].forEach(triangleType => {
	test(`${triangleType} throws when a direction of "bar" is defined`, macro,
		`foo {
			triangle: ${triangleType} bar;
			width: 100px;
		}`,
		/Unsupported direction: bar/
	);
});

test('throws when a background-color declaration is not provided', macro,
	`foo {
		triangle: pointing-right;
		width: 100px;
		height: 100px;
	}`,
	/Missing required background-color declaration/
);

test(
	'passes through w/o modification when no triangle declaration is found',
	macro,
	`foo {
		width: 100px;
		height: 50px;
		background-color: red;
	}`,
	`foo {
		width: 100px;
		height: 50px;
		background-color: red;
	}`
);

[
	'foo', 'bar', 'baz',
	'em', 'ex', 'ch', 'rem',
	'vh', 'vw', 'vmin', 'vmax',
	'px', 'mm', 'cm', 'in', 'pt', 'pc', 'mozmm'
].forEach(unit => {
	test(
		`preserves ${unit} unit`,
		macro,
		`foo {
			triangle: pointing-up;
			width: 40.2469134${unit};
			height: 20${unit};
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 0 20.12346${unit} 20${unit};
			border-bottom-color: red;
		}`
	);
});

test('calculates with a precision of 5 by default', macro,
	`foo {
		triangle: pointing-up;
		width: 40.2469134px;
		height: 20px;
		background-color: red;
	}`,
	`foo {
		width: 0;
		height: 0;
		border-style: solid;
		border-color: transparent;
		border-width: 0 20.12346px 20px;
		border-bottom-color: red;
	}`
);

[
	20,
	20.1,
	20.12,
	20.123,
	20.1235,
	20.12346,
	20.123457,
	20.1234567
].forEach((expected, unitPrecision) => {
	const unit = 'px';
	test(
		`rounds unit at the last decimal point for precision ${unitPrecision}`,
		macro,
		`foo {
			triangle: pointing-up;
			width: 40.2469134px;
			height: 20px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 0 ${expected}px 20px;
			border-bottom-color: red;
		}`,
		{ unitPrecision }
	);
});

test('isosceles throws when a width declaration is not provided', macro,
	`foo {
		triangle: pointing-up;
		height: 100px;
	}`,
	/Missing required width declaration/
);

test('isosceles throws when a height declaration is not provided', macro,
	`foo {
		triangle: pointing-up;
		width: 100px;
	}`,
	/Missing required height declaration/
);

test('isosceles, pointing up: generates expected declarations', macro,
	`foo {
		triangle: pointing-up;
		width: 100px;
		height: 20px;
		background-color: red;
	}`,
	`foo {
		width: 0;
		height: 0;
		border-style: solid;
		border-color: transparent;
		border-width: 0 50px 20px;
		border-bottom-color: red;
	}`
);

test('isosceles, pointing down: generates expected declarations', macro,
	`foo {
		triangle: pointing-down;
		width: 100px;
		height: 20px;
		background-color: red;
	}`,
	`foo {
		width: 0;
		height: 0;
		border-style: solid;
		border-color: transparent;
		border-width: 20px 50px 0;
		border-top-color: red;
	}`
);

test('isosceles, pointing left: generates expected declarations', macro,
	`foo {
		triangle: pointing-left;
		width: 100px;
		height: 20px;
		background-color: red;
	}`,
	`foo {
		width: 0;
		height: 0;
		border-style: solid;
		border-color: transparent;
		border-width: 10px 100px 10px 0;
		border-right-color: red;
	}`
);

test('isosceles: pointing right: generates expected declarations', macro,
	`foo {
		triangle: pointing-right;
		width: 100px;
		height: 20px;
		background-color: red;
	}`,
	`foo {
		width: 0;
		height: 0;
		border-style: solid;
		border-color: transparent;
		border-width: 10px 0 10px 100px;
		border-left-color: red;
	}`
);

test('right-iso throws when width and height are both not provided', macro,
	`foo {
		triangle: right-iso pointing-up;
	}`,
	/Missing required width or height declaration/
);

test('right-iso throws when both width and height are provided', macro,
	`foo {
		triangle: right-iso pointing-up;
		width: 100px;
		height: 20px;
	}`,
	/right-iso triangle cannot have both width and height/
);

test('right-iso, pointing up: generates expected declarations', t => {
	macro(t,
		`foo {
			triangle: right-iso pointing-up;
			width: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 0 50px 50px;
			border-bottom-color: red;
		}`
	);
	macro(t,
		`foo {
			triangle: right-iso pointing-up;
			height: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 0 100px 100px;
			border-bottom-color: red;
		}`
	);
});

test('right-iso, pointing down: generates expected declarations', t => {
	macro(t,
		`foo {
			triangle: right-iso pointing-down;
			width: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 50px 50px 0;
			border-top-color: red;
		}`
	);
	macro(t,
		`foo {
			triangle: right-iso pointing-down;
			height: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 100px 100px 0;
			border-top-color: red;
		}`
	);
});

test('right-iso, pointing left: generates expected declarations', t => {
	macro(t,
		`foo {
			triangle: right-iso pointing-left;
			width: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 100px 100px 100px 0;
			border-right-color: red;
		}`
	);
	macro(t,
		`foo {
			triangle: right-iso pointing-left;
			height: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 50px 50px 50px 0;
			border-right-color: red;
		}`
	);
});

test('right-iso, pointing right: generates expected declarations', t => {
	macro(t,
		`foo {
			triangle: right-iso pointing-right;
			width: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 100px 0 100px 100px;
			border-left-color: red;
		}`
	);
	macro(t,
		`foo {
			triangle: right-iso pointing-right;
			height: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 50px 0 50px 50px;
			border-left-color: red;
		}`
	);
});

test('equilateral throws when width and height are both not provided', macro,
	`foo {
		triangle: equilateral pointing-up;
	}`,
	/Missing required width or height declaration/
);

test('equilateral throws when both width and height are provided', macro,
	`foo {
		triangle: equilateral pointing-up;
		width: 100px;
		height: 20px;
	}`,
	/equilateral triangle cannot have both width and height/
);

test('equilateral, pointing up: generates expected declarations', t => {
	macro(t,
		`foo {
			triangle: equilateral pointing-up;
			width: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 0 50px 86.60254px;
			border-bottom-color: red;
		}`
	);
	macro(t,
		`foo {
			triangle: equilateral pointing-up;
			height: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 0 57.73503px 100px;
			border-bottom-color: red;
		}`
	);
});

test('equilateral, pointing down: generates expected declarations', t => {
	macro(t,
		`foo {
			triangle: equilateral pointing-down;
			width: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 86.60254px 50px 0;
			border-top-color: red;
		}`
	);
	macro(t,
		`foo {
			triangle: equilateral pointing-down;
			height: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 100px 57.73503px 0;
			border-top-color: red;
		}`
	);
});

test('equilateral, pointing left: generates expected declarations', t => {
	macro(t,
		`foo {
			triangle: equilateral pointing-left;
			width: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 57.73503px 100px 57.73503px 0;
			border-right-color: red;
		}`
	);
	macro(t,
		`foo {
			triangle: equilateral pointing-left;
			height: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 50px 86.60254px 50px 0;
			border-right-color: red;
		}`
	);
});

test('equilateral, pointing right: generates expected declarations', t => {
	macro(t,
		`foo {
			triangle: equilateral pointing-right;
			width: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 57.73503px 0 57.73503px 100px;
			border-left-color: red;
		}`
	);
	macro(t,
		`foo {
			triangle: equilateral pointing-right;
			height: 100px;
			background-color: red;
		}`,
		`foo {
			width: 0;
			height: 0;
			border-style: solid;
			border-color: transparent;
			border-width: 50px 0 50px 86.60254px;
			border-left-color: red;
		}`
	);
});

function macro(
	t: ContextualTestContext,
	input: string,
	expected?: string|RegExp,
	options?: plugin.Options
) {
	const processor = postcss([ plugin(options) ]);
	if (expected instanceof RegExp) {
		t.throws(() => {
			return processor.process(stripTabs(input)).css;
		}, expected);
		return;
	}
	t.is(
		processor.process(stripTabs(input)).css,
		stripTabs(<string>expected)
	);
	function stripTabs(input: string) {
		return input.replace(/\t/g, '');
	}
}
