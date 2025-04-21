import { Button, TextContent } from '@cloudscape-design/components';
import { ReactNode, UIEventHandler, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import useLogs from '@/pages/logs/hooks/use-logs';

const Container = styled.div`
  position: relative;
`;

const Wrapper = styled.div`
  box-sizing: border-box;
  overflow: auto;
  height: 600px;
  padding: 12px;
  border: 2px solid;
  border-radius: 4px;
  margin: 12px 0;
`;

const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 12px;
  right: 28px;
`;

export default function Area(props: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const logs = useLogs((state) => state.logs);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  const toBottom = () => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTo(0, wrapperRef.current.scrollHeight);
    }
  };

  const onScroll: UIEventHandler = (event) => {
    const element = wrapperRef.current;
    if (element) {
      const isBottom = element.scrollHeight - (event.currentTarget.scrollTop + element.offsetHeight) < 24;
      // устанавливаем автопрокрутку, только если курсор в нижнем положении
      setIsAutoScroll(isBottom);
    }
  };

  useEffect(() => {
    if (isAutoScroll) {
      toBottom();
    }
  }, [logs, wrapperRef]);

  return (
    <>
      <Container>
        <Wrapper
          ref={wrapperRef}
          onScroll={onScroll}
        >
          <TextContent>{props.children}</TextContent>
        </Wrapper>
        <ButtonWrapper>
          <Button
            iconName="angle-down"
            variant="icon"
            onClick={toBottom}
          />
        </ButtonWrapper>
      </Container>
      <Button onClick={() => setIsAutoScroll(!isAutoScroll)}>{isAutoScroll ? 'Stop autoscroll' : 'Start autoscroll'}</Button>
    </>
  );
}
