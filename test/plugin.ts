///<reference path="../typings/tsd.d.ts" />
import { expect } from 'chai';
import postcss from 'postcss';
import { PostCssTriangle, default as plugin } from '../lib/plugin';

// ReSharper disable WrongExpressionStatement
describe('postcss-triangle plugin', () => {

	it('throws when a triangle type of "bar" is defined', () => {
		check(
			`foo {
				triangle: bar pointing-up;
			}`,
			/Unsupported type: bar/
		);
	});

	it('throws when a direction of "bar" is defined', () => {
		check(
			`foo {
				triangle: bar;
				width: 100px;
				height: 100px;
			}`,
			/Unsupported direction: bar/
		);
		['right-iso', 'equilateral'].forEach(type => {
			check(
				`foo {
					triangle: ${type} bar;
					width: 100px;
				}`,
				/Unsupported direction: bar/
			);
		});
	});

	it('throws when a background-color declaration is not provided', () => {
		check(
			`foo {
				triangle: pointing-right;
				width: 100px;
				height: 100px;
			}`,
			/Missing required background-color declaration/
		);
	});

	it('passes through w/o modification when no triangle declaration is found', () => {
		const input = `foo {
			width: 100px;
			height: 50px;
			background-color: red;
		}`;
		check(input, input);
	});

	describe('units', () => {
		function input(settings) {
			return `foo {
				triangle: pointing-up;
				width: 40.2469134${settings.unit};
				height: 20${settings.unit};
				background-color: red;
			}`;
		}

		function output(settings) {
			return `foo {
				width: 0;
				height: 0;
				border-style: solid;
				border-color: transparent;
				border-width: 0 ${settings.expected}${settings.unit} 20${settings.unit};
				border-bottom-color: red;
			}`;
		}

		it('preserves units', () => {
			[
				'foo', 'bar', 'baz',
				'em', 'ex', 'ch', 'rem',
				'vh', 'vw', 'vmin', 'vmax',
				'px', 'mm', 'cm', 'in', 'pt', 'pc', 'mozmm'
			].forEach(unit => {
				check(
					input({ unit }),
					output({ expected: 20.12346, unit })
				);
			});
		});

		it('calculates with a precision of 5 by default', () => {
			it('generates expected declarations', () => {
				const unit = 'px';
				check(
					input({ unit }),
					output({ expected: 20.12346, unit })
				);
			});
		});

		it('rounds unit precision at the last decimal point for each precision', () => {
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
				check(
					input({ unit }),
					output({ expected, unit }),
					{ unitPrecision }
				);
			});
		});
	});

	describe('an isosceles triangle', () => {
		it('throws when a width declaration is not provided', () => {
			check(
				`foo {
					triangle: pointing-up;
					height: 100px;
				}`,
				/Missing required width declaration/
			);
		});

		it('throws when a height declaration is not provided', () => {
			check(
				`foo {
					triangle: pointing-up;
					width: 100px;
				}`,
				/Missing required height declaration/
			);
		});

		function input(settings) {
			return `foo {
				triangle: pointing-${settings.direction};
				width: 100px;
				height: 20px;
				background-color: red;
			}`;
		}

		function output(settings) {
			return `foo {
				width: 0;
				height: 0;
				border-style: solid;
				border-color: transparent;
				border-width: ${settings.borderWidth};
				border-${settings.borderSide}-color: red;
			}`;
		}

		it('generates expected declarations for a triangle pointing up', () => {
			const direction = 'up';
			const borderSide = 'bottom';
			check(
				input({ direction }),
				output({ borderWidth: '0 50px 20px', borderSide })
			);
		});

		it('generates expected declarations for a triangle pointing down', () => {
			const direction = 'down';
			const borderSide = 'top';
			check(
				input({ direction }),
				output({ borderWidth: '20px 50px 0', borderSide })
			);
		});

		it('generates expected declarations for a triangle pointing left', () => {
			const direction = 'left';
			const borderSide = 'right';
			check(
				input({ direction }),
				output({ borderWidth: '10px 100px 10px 0', borderSide })
			);
		});

		it('generates expected declarations for a triangle pointing right', () => {
			const direction = 'right';
			const borderSide = 'left';
			check(
				input({ direction }),
				output({ borderWidth: '10px 0 10px 100px', borderSide })
			);
		});
	});

	describe('a right-isosceles triangle', () => {
		it('throws when width and height are both not provided', () => {
			check(
				`foo {
					triangle: right-iso pointing-up;
				}`,
				/Missing required width or height declaration/
			);
		});

		it('throws when both width and height are provided', () => {
			check(
				`foo {
					triangle: right-iso pointing-up;
					width: 100px;
					height: 20px;
				}`,
				/right-iso triangle cannot have both width and height/
			);
		});

		function input(settings) {
			return `foo {
				triangle: right-iso pointing-${settings.direction};
				${settings.dimension}: 100px;
				background-color: red;
			}`;
		}

		function output(settings) {
			return `foo {
				width: 0;
				height: 0;
				border-style: solid;
				border-color: transparent;
				border-width: ${settings.borderWidth};
				border-${settings.borderSide}-color: red;
			}`;
		}

		it('generates expected declarations for a triangle pointing up', () => {
			const direction = 'up';
			const borderSide = 'bottom';
			check(
				input({ direction, dimension: 'width' }),
				output({ borderWidth: '0 50px 50px', borderSide })
			);
			check(
				input({ direction, dimension: 'height' }),
				output({ borderWidth: '0 100px 100px', borderSide })
			);
		});

		it('generates expected declarations for a triangle pointing down', () => {
			const direction = 'down';
			const borderSide = 'top';
			check(
				input({ direction, dimension: 'width' }),
				output({ borderWidth: '50px 50px 0', borderSide })
			);
			check(
				input({ direction, dimension: 'height' }),
				output({ borderWidth: '100px 100px 0', borderSide })
			);
		});

		it('generates expected declarations for a triangle pointing left', () => {
			const direction = 'left';
			const borderSide = 'right';
			check(
				input({ direction, dimension: 'width' }),
				output({ borderWidth: '100px 100px 100px 0', borderSide })
			);
			check(
				input({ direction, dimension: 'height' }),
				output({ borderWidth: '50px 50px 50px 0', borderSide })
			);
		});

		it('generates expected declarations for a triangle pointing right', () => {
			const direction = 'right';
			const borderSide = 'left';
			check(
				input({ direction, dimension: 'width' }),
				output({ borderWidth: '100px 0 100px 100px', borderSide })
			);
			check(
				input({ direction, dimension: 'height' }),
				output({ borderWidth: '50px 0 50px 50px', borderSide })
			);
		});
	});

	describe('an equilateral triangle', () => {
		it('throws when width and height are both not provided', () => {
			check(
				`foo {
					triangle: equilateral pointing-up;
				}`,
				/Missing required width or height declaration/
			);
		});

		it('throws when both width and height are provided', () => {
			check(
				`foo {
					triangle: equilateral pointing-up;
					width: 100px;
					height: 20px;
				}`,
				/equilateral triangle cannot have both width and height/
			);
		});

		function input(settings) {
			return `foo {
				triangle: equilateral pointing-${settings.direction};
				${settings.dimension}: 100px;
				background-color: red;
			}`;
		}

		function output(settings) {
			return `foo {
				width: 0;
				height: 0;
				border-style: solid;
				border-color: transparent;
				border-width: ${settings.borderWidth};
				border-${settings.borderSide}-color: red;
			}`;
		}

		it('generates expected declarations for a triangle pointing up', () => {
			const direction = 'up';
			const borderSide = 'bottom';
			check(
				input({ direction, dimension: 'width' }),
				output({ borderWidth: '0 50px 86.60254px', borderSide })
			);
			check(
				input({ direction, dimension: 'height' }),
				output({ borderWidth: '0 57.73503px 100px', borderSide })
			);
		});

		it('generates expected declarations for a triangle pointing down', () => {
			const direction = 'down';
			const borderSide = 'top';
			check(
				input({ direction, dimension: 'width' }),
				output({ borderWidth: '86.60254px 50px 0', borderSide })
			);
			check(
				input({ direction, dimension: 'height' }),
				output({ borderWidth: '100px 57.73503px 0', borderSide })
			);
		});

		it('generates expected declarations for a triangle pointing left', () => {
			const direction = 'left';
			const borderSide = 'right';
			check(
				input({ direction, dimension: 'width' }),
				output({ borderWidth: '57.73503px 100px 57.73503px 0', borderSide })
			);
			check(
				input({ direction, dimension: 'height' }),
				output({ borderWidth: '50px 86.60254px 50px 0', borderSide })
			);
		});

		it('generates expected declarations for a triangle pointing right', () => {
			const direction = 'right';
			const borderSide = 'left';
			check(
				input({ direction, dimension: 'width' }),
				output({ borderWidth: '57.73503px 0 57.73503px 100px', borderSide })
			);
			check(
				input({ direction, dimension: 'height' }),
				output({ borderWidth: '50px 0 50px 86.60254px', borderSide })
			);
		});
	});

	function check(
		actual: string,
		expected?: string|RegExp,
		options?: PostCssTriangle.Options
	) {
		const processor = postcss().use(plugin(options));
		if (expected instanceof RegExp) {
			expect(() => {
				return processor.process(stripTabs(actual)).css;
			}).to.throw(expected);
			return;
		}
		expect(
			processor.process(stripTabs(actual)).css
		).to.equal(
			stripTabs(<string>expected)
		);
	}

	function stripTabs(input: string) {
		return input.replace(/\t/g, '');
	}
});
