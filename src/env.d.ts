/// <reference types="@rsbuild/core/types" />

// Side-effect / plain style imports. `@rsbuild/core/types` only declares the
// `*.module.css` CSS-modules pattern; bundler module resolution (TS 7) requires
// an ambient declaration for plain stylesheet imports as well.
declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.less';
