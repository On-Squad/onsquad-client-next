const fs = require('fs');
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
const webSrc = path.resolve(monorepoRoot, 'apps/web/src');

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

/**
 * apps/web 의 `@/` 별칭(tsconfig paths)을 Metro 가 알아듣게 한다.
 *
 * Metro 는 tsconfig 를 읽지 않는다 — 그건 Expo preset 의 기능이고 bare RN 에는 없다.
 * Phase 1.5 스파이크 전용 임시 배선이며, packages/core 를 정식 추출하면(Phase 4) 지운다.
 */
const resolveWebAlias = (subPath) => {
  const target = path.resolve(webSrc, subPath);
  const candidates = [
    ...SOURCE_EXTENSIONS.map((ext) => target + ext),
    ...SOURCE_EXTENSIONS.map((ext) => path.join(target, `index${ext}`)),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
};

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
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.startsWith('@/')) {
        const filePath = resolveWebAlias(moduleName.slice(2));

        if (filePath) {
          return { type: 'sourceFile', filePath };
        }
      }

      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

// NativeWind v4 는 Metro 트랜스포머로 CSS 를 컴파일한다 — 이걸 감싸지 않으면 className 이 동작하지 않는다.
module.exports = withNativeWind(mergeConfig(getDefaultConfig(projectRoot), config), { input: './global.css' });
