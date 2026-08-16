/**
 * apps/web 의 디자인 토큰을 그대로 재사용한다.
 * 이 재사용이 성립하는지가 Phase 1.5 스파이크의 첫 검증 항목이다.
 *
 * web config 는 `export default` 인 .ts 라 CJS 로 읽으면 `.default` 에 들어간다.
 * 어느 쪽으로 오든 받도록 둔다.
 */
const webConfig = require('../web/tailwind.config.ts');

module.exports = {
  presets: [require('nativewind/preset'), webConfig.default ?? webConfig],
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
};
