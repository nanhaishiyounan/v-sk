require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  env: {
    // 浏览器环境
    browser: true,
    // Node环境
    node: true,
    // 启用除了modules以外的所有 ECMAScript 6 特性
    es2021: true
  },

  root: true,
  extends: ['./.eslintrc-auto-import.json', 'plugin:vue/vue3-essential', 'eslint:recommended', '@vue/eslint-config-prettier/skip-formatting'],
  globals: {
    defineOptions: 'readonly',
    defineEmits: 'readonly',
    defineProps: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
    __APP_NAME__: 'readonly',
    __PACKAGE__: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    semi: ['warn', 'never'], // 禁止尾部使用分号
    'no-debugger': 'warn', // 禁止出现 debugger
    'vue/multi-word-component-names': 0,
    'no-self-assign': 0
  }
}
