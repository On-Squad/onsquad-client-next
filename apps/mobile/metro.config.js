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


/**
 * SVG 를 컴포넌트로 import 한다 (`import Logo from './logo.svg'`).
 *
 * 웹은 `public/icons/*.svg` 를 경로로 참조하지만 RN 은 그 경로를 볼 수 없다.
 * 같은 파일을 번들해서 **같은 그림**을 쓰려면 이 트랜스포머가 필요하다.
 * 회색 도형으로 대체하지 않는 것이 원칙이다.
 */
const config = {
  watchFolders: [monorepoRoot],
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
    // svg 는 에셋이 아니라 소스로 다룬다 — 위 트랜스포머가 컴포넌트로 바꾼다.
    assetExts: getDefaultConfig(projectRoot).resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...getDefaultConfig(projectRoot).resolver.sourceExts, 'svg'],
  },
};

// NativeWind v4 는 Metro 트랜스포머로 CSS 를 컴파일한다 — 이걸 감싸지 않으면 className 이 동작하지 않는다.
module.exports = withNativeWind(mergeConfig(getDefaultConfig(projectRoot), config), { input: './global.css' });
