module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    /**
     * 모바일이 웹(`apps/web/src`)에서 가져다 쓸 수 있는 범위를 못박는다.
     *
     * `@/` 는 Metro 별칭으로 `apps/web/src` 를 가리킨다(metro.config.js).
     * 별칭이라 무엇이든 끌어올 수 있는데, 아래 경로들은 RN 에서 실제로 깨진다 —
     * DOM · next/* · Radix · 웹판 lucide-react 에 의존하기 때문이다.
     *
     * 여기 없는 것은 허용이다:
     *   @/shared/api/**  @/shared/lib/**  @/shared/config
     *   @/entities/*​/api/**  @/entities/*​/types/**  @/entities/*​/lib/**
     *   @/features/*​/model/**
     *
     * `packages/core` 를 정식 추출하면 이 규칙은 사라진다.
     * 왜 미뤘는지 → context/phase4a-navigation-spec.md §0.1
     */
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/shared/ui', '@/shared/ui/*'],
            message: 'RN 은 apps/mobile/src/shared/ui 를 쓴다. 웹 컴포넌트는 DOM 에 의존한다.',
          },
          {
            group: ['@/widgets', '@/widgets/*'],
            message: 'widgets 는 웹 UI 조합이다. RN 화면은 apps/mobile/src 에서 직접 조립한다.',
          },
          {
            group: ['@/pages', '@/pages/*'],
            message: 'pages 는 Next 화면 조립이다. RN 은 src/screens 를 쓴다.',
          },
          {
            group: ['@/app', '@/app/*'],
            message: 'app 레이어는 Next provider/layout 이다. RN 은 App.tsx 가 대응한다.',
          },
          {
            group: ['@/features/*/ui/*', '@/features/*/*/ui/*'],
            message: 'features 의 ui 는 웹 컴포넌트다. model/ 의 스키마·훅만 가져다 쓴다.',
          },
        ],
      },
    ],
  },
};
