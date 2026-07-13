import { API_KEY_LENGTH, generateApiKey } from '@/libs/generate-api-key';
import type { ApiKeyOps } from '@/pages/command-list/api/command-mutations';
import {
  COMMAND_TYPES,
  COMMAND_TYPE_ORDER,
  type CommandTypeKey,
  type FieldDef,
  commandTypeLabel,
} from '@/pages/command-list/api/command-types';
import {
  Alert,
  AttributeEditor,
  Badge,
  Button,
  Checkbox,
  ColumnLayout,
  Container,
  Form,
  FormField,
  Header,
  Input,
  Select,
  SpaceBetween,
  Tiles,
} from '@cloudscape-design/components';
import type { SelectProps } from '@cloudscape-design/components/select';
import { useMemo, useRef, useState } from 'react';
import { validateApiKeySecret, validateField, validateName, validateOwner } from './validation';

export type ApiKeyRow = {
  rowId: string;
  owner: string;
  /** Set for a key already stored on the server (edit); the plaintext is never available. */
  maskedId?: string;
  /** Set for a newly-generated key (create, or a key added while editing). */
  secret?: string;
};

export type CommandFormInitial = {
  host: string;
  type: CommandTypeKey;
  name: string;
  values: Record<string, string>;
  booleans: Record<string, boolean>;
  apiKeys: ApiKeyRow[];
};

export type CommandFormSubmit = {
  host: string;
  name: string;
  type: CommandTypeKey;
  config: Record<string, string | boolean>;
  apiKeys: ApiKeyOps;
};

type Props = {
  mode: 'create' | 'edit';
  agents: string[];
  initial: CommandFormInitial;
  submitting: boolean;
  /** Server error mapped to the Name field (e.g. a 409 conflict). */
  nameServerError?: string;
  /** Server error shown at the form level (e.g. agent unreachable / 5xx). */
  formError?: string;
  onSubmit: (submit: CommandFormSubmit) => void;
  onCancel: () => void;
};

let rowSeq = 0;
function nextRowId(): string {
  rowSeq += 1;
  return `k${rowSeq}`;
}

/** A fresh key row with a generated 48-char secret. */
export function newApiKeyRow(owner = 'gitlab-ci'): ApiKeyRow {
  return { rowId: nextRowId(), owner, secret: generateApiKey() };
}

/** A row representing a key already stored on the server. */
export function existingApiKeyRow(maskedId: string, owner: string): ApiKeyRow {
  return { rowId: nextRowId(), owner, maskedId };
}

export default function CommandForm(props: Props) {
  const { mode, initial } = props;

  const [host, setHost] = useState(initial.host);
  const [type, setType] = useState<CommandTypeKey>(initial.type);
  const [name, setName] = useState(initial.name);
  const [values, setValues] = useState<Record<string, string>>(initial.values);
  const [booleans, setBooleans] = useState<Record<string, boolean>>(initial.booleans);
  const [keys, setKeys] = useState<ApiKeyRow[]>(initial.apiKeys);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitAttempted, setSubmitAttempted] = useState(false);
  // Auto-fill serviceName from Name until the user edits it (or when editing an existing command).
  const [serviceNameEdited, setServiceNameEdited] = useState(mode === 'edit' || Boolean(initial.values.serviceName));

  const refs = useRef<Record<string, { focus: () => void } | null>>({});

  const typeDef = COMMAND_TYPES[type];
  const fixedName = typeDef.fixedName;
  const nameDisabled = mode === 'edit' || Boolean(fixedName);
  const effectiveName = fixedName ?? name;

  // ── Validation ──────────────────────────────────────────────────────────
  const errors = useMemo(() => {
    const map: Record<string, string> = {};
    if (!fixedName) {
      const nameError = validateName(name);
      if (nameError) {
        map.name = nameError;
      }
    }
    for (const field of typeDef.fields) {
      const error = validateField(field, field.kind === 'boolean' ? booleans[field.key] : values[field.key]);
      if (error) {
        map[`field-${field.key}`] = error;
      }
    }
    for (const row of keys) {
      const ownerError = validateOwner(row.owner);
      if (ownerError) {
        map[`owner-${row.rowId}`] = ownerError;
      }
      if (row.secret !== undefined) {
        const secretError = validateApiKeySecret(row.secret);
        if (secretError) {
          map[`secret-${row.rowId}`] = secretError;
        }
      }
    }
    return map;
  }, [fixedName, name, typeDef, values, booleans, keys]);

  const nameError = props.nameServerError ?? errors.name;

  function shown(id: string): boolean {
    return submitAttempted || touched.has(id);
  }

  function markTouched(id: string): void {
    setTouched((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }

  // ── Field handlers ────────────────────────────────────────────────────────
  function onNameChange(value: string): void {
    setName(value);
    if (!serviceNameEdited && typeDef.fields.some((f) => f.key === 'serviceName')) {
      setValues((prev) => ({ ...prev, serviceName: value }));
    }
  }

  function onFieldChange(field: FieldDef, value: string): void {
    if (field.key === 'serviceName') {
      setServiceNameEdited(true);
    }
    setValues((prev) => ({ ...prev, [field.key]: value }));
  }

  function onTypeChange(next: CommandTypeKey): void {
    setType(next);
    // Keep values for fields shared with the new type; auto-fill serviceName if still untouched.
    if (!serviceNameEdited && COMMAND_TYPES[next].fields.some((f) => f.key === 'serviceName')) {
      setValues((prev) => ({ ...prev, serviceName: name }));
    }
  }

  function addKey(): void {
    setKeys((prev) => [...prev, newApiKeyRow()]);
  }

  function removeKey(index: number): void {
    setKeys((prev) => prev.filter((_, i) => i !== index));
  }

  function updateKey(index: number, patch: Partial<ApiKeyRow>): void {
    setKeys((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  function focusOrder(): string[] {
    const order = ['name', ...typeDef.fields.filter((f) => f.kind !== 'boolean').map((f) => `field-${f.key}`)];
    for (const row of keys) {
      order.push(`secret-${row.rowId}`, `owner-${row.rowId}`);
    }
    return order;
  }

  function handleSubmit(): void {
    setSubmitAttempted(true);
    const invalidCount = Object.keys(errors).length;
    if (invalidCount > 0) {
      const firstInvalid = focusOrder().find((id) => errors[id]);
      if (firstInvalid) {
        refs.current[firstInvalid]?.focus();
      }
      return;
    }

    const config: Record<string, string | boolean> = {};
    for (const field of typeDef.fields) {
      if (field.kind === 'boolean') {
        config[field.key] = booleans[field.key] ?? false;
      } else {
        const value = (values[field.key] ?? '').trim();
        if (value) {
          config[field.key] = value;
        }
      }
    }

    const apiKeys: ApiKeyOps = {
      keep: keys.filter((row) => row.maskedId && row.secret === undefined).map((row) => row.maskedId as string),
      add: keys
        .filter((row) => row.secret !== undefined)
        .map((row) => ({ key: row.secret as string, owner: row.owner.trim() })),
    };

    props.onSubmit({ host, name: effectiveName, type, config, apiKeys });
  }

  const submitInvalid = submitAttempted && Object.keys(errors).length > 0;
  const formErrorText = submitInvalid
    ? `The command can't be ${mode === 'create' ? 'created' : 'saved'}. Fix the ${Object.keys(errors).length} error${Object.keys(errors).length === 1 ? '' : 's'} above, then try again.`
    : props.formError;

  const agentOptions: SelectProps.Option[] = props.agents.map((agent) => ({ label: agent, value: agent }));
  const primaryLabel = mode === 'create' ? 'Create command' : 'Save changes';

  return (
    <Form
      errorText={formErrorText}
      actions={
        <SpaceBetween
          direction="horizontal"
          size="xs"
        >
          <Button
            variant="link"
            onClick={props.onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={props.submitting}
            onClick={handleSubmit}
          >
            {primaryLabel}
          </Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween size="l">
        {mode === 'create' && (
          <Container
            header={
              <Header description="The type defines the agent endpoint and which configuration fields apply.">
                Command type
              </Header>
            }
          >
            <Tiles
              columns={4}
              value={type}
              onChange={({ detail }) => onTypeChange(detail.value as CommandTypeKey)}
              items={COMMAND_TYPE_ORDER.map((key) => ({
                value: key,
                label: COMMAND_TYPES[key].label,
                description: COMMAND_TYPES[key].description,
              }))}
            />
          </Container>
        )}

        <Container header={<Header>Details</Header>}>
          {mode === 'edit' ? (
            <ColumnLayout columns={3}>
              <FormField
                label="Agent"
                description="The agent host that stores this config file."
              >
                <Input
                  value={host}
                  disabled
                  readOnly
                />
              </FormField>
              <FormField
                label="Type"
                description="Defines the endpoint and its configuration fields."
              >
                <Input
                  value={commandTypeLabel(type)}
                  disabled
                  readOnly
                />
              </FormField>
              <FormField
                label="Name"
                description="Used in the endpoint URL and as the config file name."
              >
                <Input
                  value={name}
                  disabled
                  readOnly
                />
              </FormField>
            </ColumnLayout>
          ) : (
            <SpaceBetween size="l">
              <FormField
                label="Agent"
                description="The agent host where this command's config file is created."
              >
                <Select
                  ref={(el) => {
                    refs.current.host = el;
                  }}
                  selectedOption={host ? { label: host, value: host } : null}
                  options={agentOptions}
                  placeholder="Choose an agent"
                  onChange={({ detail }) => setHost(detail.selectedOption.value ?? '')}
                />
              </FormField>
              <FormField
                label="Name"
                description="Used in the endpoint URL and as the config file name."
                constraintText="Config file: config/<name>.json · Allowed characters: a–z A–Z 0–9 . _ -"
                errorText={shown('name') ? nameError : undefined}
              >
                <Input
                  ref={(el) => {
                    refs.current.name = el;
                  }}
                  value={effectiveName}
                  disabled={nameDisabled}
                  onChange={({ detail }) => onNameChange(detail.value)}
                  onBlur={() => markTouched('name')}
                />
              </FormField>
            </SpaceBetween>
          )}
        </Container>

        <Container header={<Header actions={<Badge color="blue">{typeDef.endpoint}</Badge>}>Configuration</Header>}>
          {typeDef.fields.length === 0 ? (
            <Alert type="info">No configurable fields — this command type only carries API keys.</Alert>
          ) : (
            <SpaceBetween size="l">
              {typeDef.fields.map((field) => {
                const id = `field-${field.key}`;
                if (field.kind === 'boolean') {
                  return (
                    <SpaceBetween
                      key={field.key}
                      size="xs"
                    >
                      <Checkbox
                        checked={booleans[field.key] ?? false}
                        onChange={({ detail }) => setBooleans((prev) => ({ ...prev, [field.key]: detail.checked }))}
                        description={field.description}
                      >
                        {field.label}
                      </Checkbox>
                      {field.constraintText && <Alert type="warning">{field.constraintText}</Alert>}
                    </SpaceBetween>
                  );
                }
                return (
                  <FormField
                    key={field.key}
                    label={field.required ? field.label : `${field.label} - optional`}
                    description={field.description}
                    constraintText={field.constraintText}
                    errorText={shown(id) ? errors[id] : undefined}
                  >
                    <Input
                      ref={(el) => {
                        refs.current[id] = el;
                      }}
                      value={values[field.key] ?? ''}
                      placeholder={field.placeholder}
                      onChange={({ detail }) => onFieldChange(field, detail.value)}
                      onBlur={() => markTouched(id)}
                    />
                  </FormField>
                );
              })}
            </SpaceBetween>
          )}
        </Container>

        <Container
          header={
            <Header
              counter={`(${keys.length})`}
              description="Secrets accepted in the api-key header, each mapped to an owner label. Without keys the command is open."
            >
              API keys
            </Header>
          }
        >
          <AttributeEditor
            items={keys}
            addButtonText="Add API key"
            removeButtonText="Remove"
            empty="No API keys — this command will be open to any caller."
            onAddButtonClick={addKey}
            onRemoveButtonClick={({ detail }) => removeKey(detail.itemIndex)}
            definition={[
              {
                label: 'API key',
                control: (row: ApiKeyRow, index) =>
                  row.maskedId && row.secret === undefined ? (
                    <Input
                      value={row.maskedId}
                      disabled
                      readOnly
                    />
                  ) : (
                    <Input
                      ref={(el) => {
                        refs.current[`secret-${row.rowId}`] = el;
                      }}
                      value={row.secret ?? ''}
                      onChange={({ detail }) => updateKey(index, { secret: detail.value })}
                      onBlur={() => markTouched(`secret-${row.rowId}`)}
                    />
                  ),
                errorText: (row: ApiKeyRow) =>
                  shown(`secret-${row.rowId}`) ? errors[`secret-${row.rowId}`] : undefined,
                constraintText: (row: ApiKeyRow) =>
                  row.maskedId && row.secret === undefined
                    ? 'Existing key — cannot be revealed.'
                    : `Generated automatically: ${API_KEY_LENGTH} characters A–Z a–z 0–9 _. Unique per command.`,
              },
              {
                label: 'Owner label',
                control: (row: ApiKeyRow, index) => (
                  <Input
                    ref={(el) => {
                      refs.current[`owner-${row.rowId}`] = el;
                    }}
                    value={row.owner}
                    onChange={({ detail }) => updateKey(index, { owner: detail.value })}
                    onBlur={() => markTouched(`owner-${row.rowId}`)}
                  />
                ),
                errorText: (row: ApiKeyRow) => (shown(`owner-${row.rowId}`) ? errors[`owner-${row.rowId}`] : undefined),
                constraintText: () => 'Who this key belongs to; shown in logs. Default: gitlab-ci.',
              },
            ]}
          />
        </Container>
      </SpaceBetween>
    </Form>
  );
}
