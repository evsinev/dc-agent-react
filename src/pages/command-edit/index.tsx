import LoadError from '@/components/error/components/load-error';
import { errorMessage } from '@/components/error/components/load-error';
import { RequestError } from '@/components/error/models/error-model';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useNotifications } from '@/hooks/use-notifications';
import {
  type CommandDetail,
  type CommandWritePayload,
  useCommandGet,
  useCommandUpdate,
  useRevalidateCommands,
} from '@/pages/command-list/api/command-mutations';
import { COMMAND_TYPES, type CommandTypeKey, isCommandType } from '@/pages/command-list/api/command-types';
import { Alert, Box, Header, SpaceBetween, StatusIndicator } from '@cloudscape-design/components';
import routing from '@routing';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import CommandForm, {
  type CommandFormInitial,
  type CommandFormSubmit,
  existingApiKeyRow,
} from '../command-create/command-form';

// Split a command's stored parameters into text values + boolean values, per the type's field defs.
function buildInitial(detail: CommandDetail, type: CommandTypeKey): CommandFormInitial {
  const values: Record<string, string> = {};
  const booleans: Record<string, boolean> = {};
  for (const field of COMMAND_TYPES[type].fields) {
    const raw = detail.parameters[field.key];
    if (field.kind === 'boolean') {
      booleans[field.key] = raw === 'true';
    } else if (raw !== undefined) {
      values[field.key] = raw;
    }
  }
  return {
    host: detail.host,
    type,
    name: detail.name,
    values,
    booleans,
    apiKeys: detail.apiKeys.map((key) => existingApiKeyRow(key.maskedId, key.owner)),
  };
}

export default function CommandEdit() {
  const { host, name } = useParams();
  useDocumentTitle(name ? `Edit ${name}` : 'Edit command');
  const navigate = useNavigate();

  const { data: detail, isLoading, error, mutate } = useCommandGet(host, name);
  const { trigger, isMutating } = useCommandUpdate();
  const revalidate = useRevalidateCommands();
  const notify = useNotifications((state) => state.add);

  const [formError, setFormError] = useState<string | undefined>();

  async function onSubmit(submit: CommandFormSubmit): Promise<void> {
    setFormError(undefined);
    const payload: CommandWritePayload = {
      host: submit.host,
      name: submit.name,
      typePath: COMMAND_TYPES[submit.type].path,
      config: submit.config,
      apiKeys: submit.apiKeys,
    };
    try {
      await trigger(payload);
      await revalidate();
      notify({
        id: 'command-write',
        type: 'success',
        content: `Command ${submit.name} updated`,
        statusIconAriaLabel: 'success',
        autoDismissMs: 3000,
      });
      navigate(routing.command.replace(':host', submit.host).replace(':name', submit.name));
    } catch (err) {
      if (err instanceof RequestError && err.status === 404) {
        setFormError(`Command ${submit.name} no longer exists on ${submit.host}.`);
      } else {
        setFormError(errorMessage(err));
      }
    }
  }

  return (
    <SpaceBetween size="m">
      <Header variant="h1">
        {name ? `Edit ${name}` : 'Edit command'}
        {isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
      </Header>

      {error && (
        <LoadError
          error={error}
          onRetry={() => mutate()}
          resource="command"
        />
      )}

      {detail &&
        (isCommandType(detail.type) ? (
          <SpaceBetween size="l">
            <Alert type="info">
              Command type and name can't be changed after creation — they define the endpoint URL. Create a new command
              instead.
            </Alert>
            <Box>
              <CommandForm
                mode="edit"
                agents={[detail.host]}
                initial={buildInitial(detail, detail.type)}
                submitting={isMutating}
                formError={formError}
                onSubmit={onSubmit}
                onCancel={() => navigate(routing.command.replace(':host', detail.host).replace(':name', detail.name))}
              />
            </Box>
          </SpaceBetween>
        ) : (
          <Alert type="error">This command has an unsupported type ({detail.type}) and can't be edited here.</Alert>
        ))}

      {!error && !detail && !isLoading && <Box variant="p">Command not found</Box>}
    </SpaceBetween>
  );
}
