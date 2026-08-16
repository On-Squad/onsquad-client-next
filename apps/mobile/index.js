/**
 * @format
 */

// Phase 1.5 임시 — NEXT_PUBLIC_* 는 Next 빌드타임에 치환되는 값이라 Metro 에는 존재하지 않는다.
// shared/api/common.ts 가 모듈 로드 시점에 baseUrl 을 계산하므로 App 보다 먼저 넣어야 한다.
// ESM import 는 호이스팅되어 이 대입보다 먼저 실행되므로 require 로 순서를 강제한다.
// 정식 해법(빌드 설정 또는 별도 config)은 Phase 4 에서 정한다.
process.env.NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const { AppRegistry } = require('react-native');

const App = require('./App').default;
const { name: appName } = require('./app.json');

AppRegistry.registerComponent(appName, () => App);
