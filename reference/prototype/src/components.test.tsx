import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StudioProvider } from './store';
import { Articles, Newsletter } from './public-pages';
import { AuthGate } from './components';
describe('reader interactions', () => {
  it('filters categories and recovers from an empty search', () => {
    render(
      <StudioProvider>
        <Articles />
      </StudioProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: '.NET' }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'impossible-query' } });
    expect(screen.getByText('No matching articles')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getAllByRole('article')).toHaveLength(4);
  });
  it('gates learning content for a guest', () => {
    render(
      <StudioProvider>
        <AuthGate>
          <div>Secret lesson editor</div>
        </AuthGate>
      </StudioProvider>,
    );
    expect(screen.queryByText('Secret lesson editor')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });
  it('requires subscription confirmation and does not persist the email', async () => {
    render(
      <StudioProvider>
        <Newsletter />
      </StudioProvider>,
    );
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'demo@example.com' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /I agree/ }));
    fireEvent.submit(
      screen.getByRole('button', { name: 'Subscribe to the letter' }).closest('form')!,
    );
    await screen.findByText('Awaiting email confirmation');
    expect(localStorage.getItem('ar-studio-demo-v1')).not.toContain('demo@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Simulate email confirmation' }));
    await waitFor(() => expect(screen.getByText('Subscribed & confirmed')).toBeVisible());
  });
});
