const path = require('path');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro configuration (pnpm 모노레포)
 * https://reactnative.dev/docs/metro
 *
 * node-linker=hoisted 라 의존성은 루트 node_modules 로 호이스팅된다.
 * 따라서 metro 가 루트를 watch 하고, 프로젝트/루트 node_modules 를 모두 해석하도록 한다.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = {
  watchFolders: [monorepoRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
  },
};

// NativeWind v4 는 Metro 트랜스포머로 CSS 를 컴파일한다 — 이걸 감싸지 않으면 className 이 동작하지 않는다.
module.exports = withNativeWind(mergeConfig(getDefaultConfig(projectRoot), config), { input: './global.css' });
