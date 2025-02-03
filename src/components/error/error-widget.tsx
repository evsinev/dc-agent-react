import { Flashbar } from '@cloudscape-design/components';
import Error from './interface';

interface ErrorMessageProps {
  error: Error;
  onClose: () => void;
  index: number;
}

export default function ErrorWidget(props: ErrorMessageProps) {
  const { error, onClose } = props;

  return (
    <Flashbar
      stackItems
      items={[
        {
          type: 'error',
          header: 'Error',
          dismissible: true,
          onDismiss: onClose,
          statusIconAriaLabel: 'error',
          content: (
            <div>
              {Object.keys(error).map((fieldName) => (
                <div key={fieldName} data-field={fieldName}>
                  <strong>{fieldName}:</strong> <span>{JSON.stringify(error[fieldName as keyof typeof error])}</span>
                </div>
              ))}
            </div>
          ),
        },
      ]}
    />
  );
}
