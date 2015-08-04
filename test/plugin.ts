///<reference path="../../typings/tsd.d.ts" />
import { expect } from 'chai';
import postcss from 'postcss';
import plugin from '../lib/plugin';

// ReSharper disable WrongExpressionStatement
describe('postcss-triangle plugin', () => {

	it('does foo', () => {
		check(
			`foo{}`,
			`foo{}`
		);
	});

	function check(actual: string, expected?: string|RegExp) {
		const processor = postcss().use(plugin);
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
