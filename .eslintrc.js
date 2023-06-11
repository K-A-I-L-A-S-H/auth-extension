module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
	},
	ignorePatterns: ['.eslintrc.js'],
	settings: {
		'import/resolver': {
			typescript: {
				project: '.',
			},
		},
	},
	rules: {
		'@typescript-eslint/no-extraneous-class': 0,
		'@typescript-eslint/no-magic-numbers': 0,
		'@typescript-eslint/no-unsafe-enum-comparison': 0,
	},
};
