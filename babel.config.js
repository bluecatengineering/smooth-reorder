module.exports = {
	env: {
		test: {
			presets: ['@babel/env'],
		},
		es5: {
			comments: false,
			presets: [
				['@babel/env', {loose: true, modules: false, useBuiltIns: 'usage', corejs: 3, targets: {ie: '11'}}],
				['minify'],
			],
		},
		es6: {
			comments: false,
			presets: [
				['@babel/env', {loose: true, modules: false, useBuiltIns: false, targets: {chrome: '69', firefox: '61'}}],
				['minify'],
			],
		},
	},
};
