///<reference path="../../typings/postcss/.d.ts" />
import postcss from 'postcss';

const errorContext = {
	plugin: 'postcss-triangle'
};

// ReSharper disable once UnusedLocals
const PostCssTriangle = postcss.plugin<any>('postcss-triangle',
	(options: PostCssTriangle.Options = {}) => {
		if (!options.hasOwnProperty('unitPrecision')) {
			options.unitPrecision = 5;
		}
		return root => {
			root.eachRule(rule => {
				let isTriangle = false, width, height, direction;

				rule.eachDecl('triangle', decl => {
					isTriangle = true;

					rule.eachDecl('width', d => {
						width = parseLength(d.value);
						d.value = '0';
						d.moveBefore(decl);
					});

					if (!width) {
						decl.cloneBefore({ prop: 'width', value: '0' });
					}

					rule.eachDecl('height', d => {
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

					decl.removeSelf();
				});

				if (!isTriangle) {
					return;
				}

				let isColorDefined = false;
				rule.eachDecl('background-color', decl => {
					isColorDefined = true;
					const oppositeDirection = {
						up: 'bottom',
						right: 'left',
						down: 'top',
						left: 'right'
					}[direction.split('-')[1]];
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

		function sinDegrees(angle) {
			return Math.sin(angle / 180 * Math.PI);
		}

		function parseLength(length: string) {
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
			return {
				up: `0 ${hw} ${h}`,
				right: `${hh} 0 ${hh} ${w}`,
				down: `${h} ${hw} 0`,
				left: `${hh} ${w} ${hh} 0`
			}[direction.split('-')[1]];
		}
	}
);

module PostCssTriangle {
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

export default PostCssTriangle;
