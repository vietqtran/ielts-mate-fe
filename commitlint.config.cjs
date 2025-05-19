module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'improve',
        'refactor',
        'docs',
        'chore',
        'style',
        'test',
        'revert',
        'ci',
        'build',
      ],
    ],
  },
};
