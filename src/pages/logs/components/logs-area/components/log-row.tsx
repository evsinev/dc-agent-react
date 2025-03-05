import styled from '@emotion/styled';
import { memo } from 'react';

interface LogRowProps {
  index: number;
  log: string;
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: min-content 1fr;
  grid-gap: 12px;
  margin-bottom: 4px;
`;

const Number = styled.div`
  user-select: none;
`;

const areEqual = (prevProps: LogRowProps, nextProps: LogRowProps) => (
  prevProps.index === nextProps.index
  && prevProps.log === nextProps.log
);

export default memo(({ log, index }: LogRowProps) => (
  <Wrapper>
    <Number>{index}</Number>
    <div>{log}</div>
  </Wrapper>
), areEqual);
