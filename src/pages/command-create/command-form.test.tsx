import { describe, expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
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
