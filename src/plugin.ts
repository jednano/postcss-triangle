import * as postcss from 'postcss';

const plugin = 'postcss-triangle';
const errorContext = { plugin };

const oppositeDirectionMap: {
	[index: string]: string;
} = {
	up: 'bottom',
	right: 'left',
	down: 'top',
	left: 'right'
};

const PostCssTriangle = postcss.plugin<PostCssTriangle.Options>(plugin, (options = <any>{}) => {

	if (typeof options.unitPrecision === 'undefined') {
		options.unitPrecision = 5;
	}

	return root => {
		root.walkRules(rule => {
			let isTriangle = false;
			let width: Length;
			let height: Length;
			let direction: string;

			rule.walkDecls('triangle', decl => {
				isTriangle = true;

				rule.walkDecls('width', d => {
					width = parseLength(d.value);
					d.value = '0';
					d.moveBefore(decl);
				});

				if (!width) {
					decl.cloneBefore({ prop: 'width', value: '0' });
				}

				rule.walkDecls('height', d => {
					height = parseLength(d.value);
					d.value = '0';
					d.moveBefore(decl);
				});

				if (!height) {
					decl.cloneBefore({ prop: 'height', value: '0' });
				}

				decl.cloneBefore({
					prop: 'border-style',
					value: 'solid'
				});

				decl.cloneBefore({
					prop: 'border-color',
					value: 'transparent'
				});

				let type;
				[type, direction] = postcss.list.space(decl.value);
				if (!direction) {
					direction = type;
					if (!width) {
						throw rule.error(
							`Missing required width declaration`,
							errorContext
							);
					}
					if (!height) {
						throw rule.error(
							`Missing required height declaration`,
							errorContext
							);
					}
				} else if (!/^(right-iso|equilateral)$/.test(type)) {
					throw decl.error(
						`Unsupported type: ${type}`,
						errorContext
						);
				} else if (!width && !height) {
					throw rule.error(
						`Missing required width or height declaration`,
						errorContext
						);
				} else if (width && height) {
					throw rule.error(
						`${type} triangle cannot have both width and height`,
						errorContext
						);
				} else {
					const multiplier = type === 'right-iso' ? 0.5 : sinDegrees(60);
					if (/^(pointing-(up|down))$/.test(direction)) {
						width = width || {
							value: height.value / multiplier,
							unit: height.unit
						};
						height = height || {
							value: width.value * multiplier,
							unit: width.unit
						};
					} else {
						width = width || {
							value: height.value * multiplier,
							unit: height.unit
						};
						height = height || {
							value: width.value / multiplier,
							unit: width.unit
						};
					}
				}

				if (!/^(pointing-(up|down|left|right))$/.test(direction)) {
					throw decl.error(
						`Unsupported direction: ${direction}.`,
						errorContext
						);
				}

				decl.cloneBefore({
					prop: 'border-width',
					value: buildBorderWidth(width, height, direction)
				});

				decl.remove();
			});

			if (!isTriangle) {
				return;
			}

			let isColorDefined = false;
			rule.walkDecls('background-color', decl => {
				isColorDefined = true;
				const oppositeDirection = oppositeDirectionMap[
					direction.split('-')[1]
				];
				decl.prop = `border-${oppositeDirection}-color`;
			});

			if (!isColorDefined) {
				throw rule.error(
					`Missing required background-color declaration`,
					errorContext
				);
			}
		});
	};

	function sinDegrees(angle: number) {
		return Math.sin(angle / 180 * Math.PI);
	}

	interface Length {
		value: number;
		unit: string;
	}

	function parseLength(length: string): Length {
		const value = parseFloat(length);
		const [, unit] = length.match(/([a-z]+)$/);
		return { value, unit };
	}

	function stringifyLength(length: PostCssTriangle.Length) {
		const precision = Math.pow(10, options.unitPrecision);
		const rounded = Math.round(length.value * precision) / precision;
		return rounded + length.unit;
	}

	function buildBorderWidth(
		width: PostCssTriangle.Length,
		height: PostCssTriangle.Length,
		direction: string
	) {
		const hw = stringifyLength({
			value: width.value / 2,
			unit: width.unit
		});
		const hh = stringifyLength({
			value: height.value / 2,
			unit: height.unit
		});
		const w = stringifyLength(width);
		const h = stringifyLength(height);
		const resultMap: {
			[index: string]: string;
		} = {
			up: `0 ${hw} ${h}`,
			right: `${hh} 0 ${hh} ${w}`,
			down: `${h} ${hw} 0`,
			left: `${hh} ${w} ${hh} 0`
		};
		return resultMap[direction.split('-')[1]];
	}
});

namespace PostCssTriangle {
	export interface Options {
		/**
		 * Default: 5. When using `right-iso` or `equilateral` triangles,
		 * calculations will be performed that will most likely turn into
		 * fractions. This option allows you to control the number of
		 * significant digits after the decimal point (e.g., `1.2354`
		 * with a `unitPrecision` of `2` would yield `1.24`, rounding it
		 * off nicely).
		 */
		unitPrecision?: number;
	}
	export interface Length {
		value: number;
		unit: string;
	}
}

export = PostCssTriangle;
