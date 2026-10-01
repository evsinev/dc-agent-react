import { describe, expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { COMMAND_TYPES } from '@/pages/command-list/api/command-types';
import { buildInitial } from '../command-edit';
import CommandForm, { type CommandFormInitial, existingApiKeyRow } from './command-form';

const noop = () => {};
const VALID_KEY = 'a'.repeat(48);

function createInitial(overrides: Partial<CommandFormInitial> = {}): CommandFormInitial {
  return {
    host: 'sandbox-1',
    type: 'JAR',
    name: '',
    values: {},
    booleans: {},
    apiKeys: [{ rowId: 'r1', owner: 'gitlab-ci', secret: VALID_KEY }],
    ...overrides,
  };
}

describe('CommandForm (create)', () => {
  test('blocks submit and reports errors when required fields are empty', () => {
    const onSubmit = rstest.fn();
    render(
      <CommandForm
        mode="create"
        agents={['sandbox-1']}
        initial={createInitial()}
        submitting={false}
        onSubmit={onSubmit}
        onCancel={noop}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create command' }));

    expect(onSubmit).toHaveBeenCalledTimes(0);
    expect(screen.getByText('Name is required.')).toBeTruthy();
    // Cloudscape <Form> renders errorText in both a visible node and a hidden live-region.
    expect(screen.getAllByText(/can't be created/).length).toBeGreaterThan(0);
  });

  test('submits a valid JAR command with the built config and key ops', () => {
    const onSubmit = rstest.fn();
    render(
      <CommandForm
        mode="create"
        agents={['sandbox-1']}
        initial={createInitial({ name: 'billing', values: { jarFilename: '/srv/app.jar', serviceName: 'billing' } })}
        submitting={false}
        onSubmit={onSubmit}
        onCancel={noop}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create command' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toEqual({
      host: 'sandbox-1',
      name: 'billing',
      type: 'JAR',
      config: { jarFilename: '/srv/app.jar', serviceName: 'billing' },
      apiKeys: { keep: [], add: [{ key: VALID_KEY, owner: 'gitlab-ci' }] },
    });
  });

  test('switching type swaps the config fields and keeps shared values', () => {
    render(
      <CommandForm
        mode="create"
        agents={['sandbox-1']}
        initial={createInitial({ values: { serviceName: 'svc' } })}
        submitting={false}
        onSubmit={noop}
        onCancel={noop}
      />,
    );

    // JAR shows jarFilename; WAR shows warFilename.
    expect(screen.getByText('jarFilename')).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: /deploy war/i }));

    expect(screen.getByText('warFilename')).toBeTruthy();
    expect(screen.queryByText('jarFilename')).toBeNull();
    expect(screen.getByDisplayValue('svc')).toBeTruthy();
  });
});

describe('CommandForm (edit)', () => {
  test('disables identity fields, masks existing keys, and labels the primary action', () => {
    render(
      <CommandForm
        mode="edit"
        agents={['sandbox-1']}
        initial={{
          host: 'sandbox-1',
          type: 'JAR',
          name: 'billing',
          values: { jarFilename: 'billing.jar', serviceName: 'billing-svc' },
          booleans: {},
          apiKeys: [existingApiKeyRow('****abcd', 'gitlab-ci')],
        }}
        submitting={false}
        onSubmit={noop}
        onCancel={noop}
      />,
    );

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeTruthy();

    const nameInput = screen.getByDisplayValue('billing') as HTMLInputElement;
    expect(nameInput.disabled).toBe(true);

    const maskedInput = screen.getByDisplayValue('****abcd') as HTMLInputElement;
    expect(maskedInput.disabled).toBe(true);
  });
});

describe('CommandForm (zip-archive-version)', () => {
  const base = {
    dir: '/opt/app/bundles',
    versionFile: '/opt/app/bundles/current',
    reloadUrl: 'http://127.0.0.1:8080/reload?version=${version}',
  };

  function renderForm(
    initial: Partial<CommandFormInitial>,
    onSubmit = rstest.fn(),
    mode: 'create' | 'edit' = 'create',
  ) {
    const view = render(
      <CommandForm
        mode={mode}
        agents={['sandbox-1']}
        initial={createInitial({ type: 'ZIP_ARCHIVE_VERSION', name: 'bundle', ...initial })}
        submitting={false}
        onSubmit={onSubmit}
        onCancel={noop}
      />,
    );
    return { ...view, onSubmit };
  }

  function submit(mode: 'create' | 'edit' = 'create') {
    fireEvent.click(screen.getByRole('button', { name: mode === 'create' ? 'Create command' : 'Save changes' }));
  }

  test('submits headers as an object and raw text as typed', () => {
    const { onSubmit } = renderForm({
      values: { ...base, reloadBody: ' {"v":"${version}"}\n', waitTimeout: 'PT5M', maxBytes: '200mb' },
      headers: { reloadHeaders: [{ rowId: 'h1', name: 'Authorization', value: ' Bearer t ' }] },
    });

    submit();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].config).toEqual({
      ...base,
      reloadBody: ' {"v":"${version}"}\n',
      waitTimeout: 'PT5M',
      maxBytes: '200mb',
      reloadHeaders: { Authorization: ' Bearer t ' },
    });
  });

  test('no header rows: the field is not sent', () => {
    const { onSubmit } = renderForm({ values: base });

    submit();

    expect(onSubmit.mock.calls[0][0].config).toEqual(base);
  });

  test('a header value is a password input', () => {
    const { container } = renderForm({
      values: base,
      headers: { reloadHeaders: [{ rowId: 'h1', name: 'Authorization', value: 'Bearer SECRET' }] },
    });

    const inputs = Array.from(container.querySelectorAll('input')).filter((input) => input.value === 'Bearer SECRET');
    expect(inputs).toHaveLength(1);
    expect(inputs[0].type).toBe('password');
  });

  test('editing a multi-line body in the UI keeps its line breaks', () => {
    const { container, onSubmit } = renderForm({ values: { ...base, reloadBody: 'first\nsecond\n' } });
    const textarea = Array.from(container.querySelectorAll('textarea')).find(
      (area) => area.value === 'first\nsecond\n',
    ) as HTMLTextAreaElement;
    expect(textarea).toBeDefined();

    fireEvent.change(textarea, { target: { value: 'first\nsecond\nthird' } });
    submit();

    expect(onSubmit.mock.calls[0][0].config.reloadBody).toBe('first\nsecond\nthird');
  });

  test('editing a multi-line versionPattern keeps its line breaks', () => {
    const pattern = '(?x)^v # prefix\n[0-9]+$';
    const { container, onSubmit } = renderForm({ values: { ...base, versionPattern: pattern } });
    const textarea = Array.from(container.querySelectorAll('textarea')).find((area) => area.value === pattern);
    expect(textarea).toBeDefined();

    fireEvent.change(textarea as HTMLTextAreaElement, { target: { value: `${pattern}\n# end` } });
    submit();

    expect(onSubmit.mock.calls[0][0].config.versionPattern).toBe(`${pattern}\n# end`);
  });

  test('a versionFile outside dir and a restricted header block the submit', () => {
    const { onSubmit } = renderForm({
      values: { ...base, versionFile: '/opt/app/current' },
      headers: { reloadHeaders: [{ rowId: 'h1', name: 'Host', value: 'x' }] },
    });

    submit();

    expect(onSubmit).toHaveBeenCalledTimes(0);
    expect(screen.getByText('versionFile must lie directly in dir.')).toBeTruthy();
    expect(screen.getByText('Host is set by the agent and cannot be configured.')).toBeTruthy();
  });

  test('a stored config survives an edit without changes, field by field', () => {
    // parameters as the agent's command/get returns them: strings, the headers object as JSON text
    const stored = {
      ...base,
      versionPattern: '^v[0-9]+\\.[0-9]+$ ',
      maxUploadBytes: '50mb',
      maxBytes: '200mb',
      maxEntries: '10k',
      waitTimeout: '6m',
      reloadBody: ' {"version":"${version}"}\n\n',
    };
    const detail = {
      host: 'sandbox-1',
      name: 'bundle',
      type: 'ZIP_ARCHIVE_VERSION',
      parameters: { ...stored, reloadHeaders: '{"Authorization":"Bearer t","X-Tag":" a "}' },
      apiKeys: [{ maskedId: '****abcd', owner: 'ci' }],
    };
    const onSubmit = rstest.fn();
    render(
      <CommandForm
        mode="edit"
        agents={['sandbox-1']}
        initial={buildInitial(detail, 'ZIP_ARCHIVE_VERSION')}
        submitting={false}
        onSubmit={onSubmit}
        onCancel={noop}
      />,
    );

    submit('edit');

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].config).toEqual({
      ...stored,
      reloadHeaders: { Authorization: 'Bearer t', 'X-Tag': ' a ' },
    });
    // every field of the type is in the registry, or an edit would drop it
    expect(Object.keys(onSubmit.mock.calls[0][0].config).sort()).toEqual(
      COMMAND_TYPES.ZIP_ARCHIVE_VERSION.fields.map((field) => field.key).sort(),
    );
  });

  test('stored headers that cannot be read are reported, not silently kept', () => {
    const initial = buildInitial(
      {
        host: 'sandbox-1',
        name: 'bundle',
        type: 'ZIP_ARCHIVE_VERSION',
        parameters: { ...base, reloadHeaders: 'Authorization' },
        apiKeys: [],
      },
      'ZIP_ARCHIVE_VERSION',
    );

    expect(initial.headers?.reloadHeaders).toEqual([]);
    expect(initial.headerWarnings?.reloadHeaders).toMatch(/could not be read/);
  });
});
