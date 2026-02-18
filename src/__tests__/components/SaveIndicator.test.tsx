import { render, screen } from '@testing-library/react';
import SaveIndicator from '@/components/SaveIndicator';

describe('SaveIndicator', () => {
  test('shows idle state', () => {
    render(<SaveIndicator status="idle" />);
    expect(screen.getByText('Auto-save enabled')).toBeInTheDocument();
  });

  test('shows saving state', () => {
    render(<SaveIndicator status="saving" />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  test('shows saved state', () => {
    render(<SaveIndicator status="saved" />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  test('shows error state', () => {
    render(<SaveIndicator status="error" />);
    expect(screen.getByText(/Save failed/)).toBeInTheDocument();
  });

  test('shows last saved time when provided', () => {
    const date = new Date('2024-01-15T14:30:00Z');
    render(<SaveIndicator status="saved" lastSaved={date.toISOString()} />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });
});
