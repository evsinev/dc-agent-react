import '@cloudscape-design/global-styles/index.css';
import { Global, css } from '@emotion/react';

export default function GlobalStyles() {
  return (
    <Global
      styles={css`
        a {
          color: rgb(83, 159, 229)
        }
      `}
    />
  );
}
