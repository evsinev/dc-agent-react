import { errorMessage } from '@/components/error/components/load-error';
import { RequestError } from '@/components/error/models/error-model';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useNotifications } from '@/hooks/use-notifications';
import {
  type CommandWritePayload,
  useCommandCreate,
  useRevalidateCommands,
} from '@/pages/command-list/api/command-mutations';
import { COMMAND_TYPES } from '@/pages/command-list/api/command-types';
import { useAgentList } from '@/pages/dc-agent-list/api/agent-list';
import { Box, Header, SpaceBetween } from '@cloudscape-design/components';
import routing from '@routing';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import CommandForm, { type CommandFormInitial, type CommandFormSubmit, newApiKeyRow } from './command-form';

export default function CommandCreate() {
  useDocumentTitle('Create command');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAgent = searchParams.get('agent') ?? '';

  const { data: agentData } = useAgentList();
  const agents = (agentData?.agents ?? []).map((agent) => agent.name);

  const { trigger, isMutating } = useCommandCreate();
  const revalidate = useRevalidateCommands();
  const notify = useNotifications((state) => state.add);

  const [nameServerError, setNameServerError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();

  const initial: CommandFormInitial = {
    host: preselectedAgent,
    type: 'JAR',
    name: '',
    values: {},
    booleans: {},
    apiKeys: [newApiKeyRow()],
  };

  async function onSubmit(submit: CommandFormSubmit): Promise<void> {
    setNameServerError(undefined);
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
        content: `Command ${submit.name} created`,
        statusIconAriaLabel: 'success',
        autoDismissMs: 3000,
      });
      navigate(routing.command.replace(':host', submit.host).replace(':name', submit.name));
    } catch (error) {
      if (error instanceof RequestError && error.status === 409) {
        setNameServerError(`A command named "${submit.name}" already exists on ${submit.host}.`);
      } else {
        setFormError(errorMessage(error));
      }
    }
  }

  return (
    <SpaceBetween size="m">
      <Header
        variant="h1"
        description="A command is a config file in the agent's config/ directory plus the endpoint that uses it."
      >
        Create command
      </Header>
      <Box>
        <CommandForm
          mode="create"
          agents={agents}
          initial={initial}
          submitting={isMutating}
          nameServerError={nameServerError}
          formError={formError}
          onSubmit={onSubmit}
          onCancel={() => navigate(routing.commands)}
        />
      </Box>
    </SpaceBetween>
  );
}
