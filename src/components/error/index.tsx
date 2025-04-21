import { useState, ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { RequestErrorModel } from './models/types';
import ErrorWidget from './components/error-widget';

interface ErrorProviderProps {
  children: ReactNode;
  errors?: RequestErrorModel[];
}

export default function ErrorProvider(props: ErrorProviderProps) {
  const [errors, setErrors] = useState<RequestErrorModel[]>(props.errors || []);

  const closeError = (errorId?: string): void => {
    setErrors((prevState) => prevState.filter((err) => err.errorId !== errorId));
  };

  return (
    <SWRConfig
      value={{
        shouldRetryOnError: false,
        onError: (error: RequestErrorModel) => {
          setErrors((prevState) => [...prevState, error]);
        },
      }}
    >
      {errors?.map((error, index) => (
        <ErrorWidget
          key={`${error?.errorId}-${index}`}
          error={error}
          onClose={() => closeError(error?.errorId)}
          index={index}
        />
      ))}

      {props.children}
    </SWRConfig>
  );
}
