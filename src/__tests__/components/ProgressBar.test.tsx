import { render, screen, fireEvent } from '@testing-library/react';
import ProgressBar from '@/components/ProgressBar';
import { BASPI_SECTIONS } from '@/lib/baspiSchema';

describe('ProgressBar', () => {
  const mockOnStepClick = jest.fn();

  const allNotStarted = BASPI_SECTIONS.map(s => ({
    sectionKey: s.key,
    status: 'NOT_STARTED',
  }));

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders overall progress bar', () => {
    render(
      <ProgressBar
        currentStep={0}
        sections={allNotStarted}
        onStepClick={mockOnStepClick}
      />
    );

    expect(screen.getByText('Overall Progress')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  test('shows correct progress percentage', () => {
    const sections = BASPI_SECTIONS.map((s, i) => ({
      sectionKey: s.key,
      status: i < 10 ? 'COMPLETED' : 'NOT_STARTED',
    }));

    render(
      <ProgressBar
        currentStep={10}
        sections={sections}
        onStepClick={mockOnStepClick}
      />
    );

    // 10 of 21 sections = 48%
    expect(screen.getByText('48%')).toBeInTheDocument();
  });

  test('renders all section titles', () => {
    render(
      <ProgressBar
        currentStep={0}
        sections={allNotStarted}
        onStepClick={mockOnStepClick}
      />
    );

    expect(screen.getByText('Property Details')).toBeInTheDocument();
    expect(screen.getByText('Declaration')).toBeInTheDocument();
  });

  test('calls onStepClick when section is clicked', () => {
    render(
      <ProgressBar
        currentStep={0}
        sections={allNotStarted}
        onStepClick={mockOnStepClick}
      />
    );

    fireEvent.click(screen.getByText('Seller Details'));
    expect(mockOnStepClick).toHaveBeenCalledWith(1);
  });

  test('renders Part A and Part B headers', () => {
    render(
      <ProgressBar
        currentStep={0}
        sections={allNotStarted}
        onStepClick={mockOnStepClick}
      />
    );

    expect(screen.getByText(/Part A/)).toBeInTheDocument();
    expect(screen.getByText(/Part B/)).toBeInTheDocument();
  });

  test('shows completed count', () => {
    const sections = BASPI_SECTIONS.map((s, i) => ({
      sectionKey: s.key,
      status: i < 5 ? 'COMPLETED' : 'NOT_STARTED',
    }));

    render(
      <ProgressBar
        currentStep={5}
        sections={sections}
        onStepClick={mockOnStepClick}
      />
    );

    expect(screen.getByText(/5 of 21 sections complete/)).toBeInTheDocument();
  });
});
