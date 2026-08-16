module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    // zod v4 는 `export * as ns from` 문법을 쓰는데 RN babel preset 이 기본으로 변환하지 않는다.
    // 없으면 zod 를 import 하는 순간 번들이 깨진다:
    //   "Export namespace should be first transformed by @babel/plugin-transform-export-namespace-from"
    '@babel/plugin-transform-export-namespace-from',
  ],
};
