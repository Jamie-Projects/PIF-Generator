import { render, screen, fireEvent } from '@testing-library/react';
import QuestionField from '@/components/QuestionField';
import { FormField } from '@/lib/baspiSchema';

describe('QuestionField', () => {
  const mockOnChange = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders text input field', () => {
    const field: FormField = {
      key: 'test_field',
      label: 'Test Label',
      type: 'text',
      placeholder: 'Enter text',
    };

    render(
      <QuestionField field={field} value="" onChange={mockOnChange} allValues={{}} />
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  test('renders required indicator', () => {
    const field: FormField = {
      key: 'required_field',
      label: 'Required Field',
      type: 'text',
      required: true,
    };

    render(
      <QuestionField field={field} value="" onChange={mockOnChange} allValues={{}} />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  test('renders boolean field with Yes/No buttons', () => {
    const field: FormField = {
      key: 'bool_field',
      label: 'Is this true?',
      type: 'boolean',
    };

    render(
      <QuestionField field={field} value={null} onChange={mockOnChange} allValues={{}} />
    );

    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  test('calls onChange when boolean Yes is clicked', () => {
    const field: FormField = {
      key: 'bool_field',
      label: 'Question?',
      type: 'boolean',
    };

    render(
      <QuestionField field={field} value={null} onChange={mockOnChange} allValues={{}} />
    );

    fireEvent.click(screen.getByText('Yes'));
    expect(mockOnChange).toHaveBeenCalledWith('bool_field', true);
  });

  test('calls onChange when text input changes', () => {
    const field: FormField = {
      key: 'text_field',
      label: 'Name',
      type: 'text',
    };

    render(
      <QuestionField field={field} value="" onChange={mockOnChange} allValues={{}} />
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John' } });
    expect(mockOnChange).toHaveBeenCalledWith('text_field', 'John');
  });

  test('renders select field with options', () => {
    const field: FormField = {
      key: 'select_field',
      label: 'Pick one',
      type: 'select',
      options: [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
      ],
    };

    render(
      <QuestionField field={field} value="" onChange={mockOnChange} allValues={{}} />
    );

    // Select fields render as button list (not dropdown)
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  test('renders textarea field', () => {
    const field: FormField = {
      key: 'details',
      label: 'Details',
      type: 'textarea',
    };

    render(
      <QuestionField field={field} value="some text" onChange={mockOnChange} allValues={{}} />
    );

    const textarea = screen.getByLabelText('Details') as HTMLTextAreaElement;
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea.value).toBe('some text');
  });

  test('renders help text when provided', () => {
    const field: FormField = {
      key: 'help_field',
      label: 'Field',
      type: 'text',
      helpText: 'This is helpful information',
    };

    render(
      <QuestionField field={field} value="" onChange={mockOnChange} allValues={{}} />
    );

    // Help text is behind a toggle — click to reveal
    expect(screen.getByText('What does this mean?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('What does this mean?'));
    expect(screen.getByText('This is helpful information')).toBeInTheDocument();
  });

  test('hides field when showWhen condition is not met', () => {
    const field: FormField = {
      key: 'conditional_field',
      label: 'Conditional',
      type: 'text',
      showWhen: { field: 'toggle', value: true },
    };

    const { container } = render(
      <QuestionField
        field={field}
        value=""
        onChange={mockOnChange}
        allValues={{ toggle: false }}
      />
    );

    expect(container.innerHTML).toBe('');
  });

  test('shows field when showWhen condition is met', () => {
    const field: FormField = {
      key: 'conditional_field',
      label: 'Conditional',
      type: 'text',
      showWhen: { field: 'toggle', value: true },
    };

    render(
      <QuestionField
        field={field}
        value=""
        onChange={mockOnChange}
        allValues={{ toggle: true }}
      />
    );

    expect(screen.getByLabelText('Conditional')).toBeInTheDocument();
  });

  test('renders date input field', () => {
    const field: FormField = {
      key: 'date_field',
      label: 'Date',
      type: 'date',
    };

    render(
      <QuestionField field={field} value="2024-01-15" onChange={mockOnChange} allValues={{}} />
    );

    const input = screen.getByLabelText('Date') as HTMLInputElement;
    expect(input.type).toBe('date');
    expect(input.value).toBe('2024-01-15');
  });

  test('renders number input field', () => {
    const field: FormField = {
      key: 'num_field',
      label: 'Count',
      type: 'number',
    };

    render(
      <QuestionField field={field} value={3} onChange={mockOnChange} allValues={{}} />
    );

    const input = screen.getByLabelText('Count') as HTMLInputElement;
    expect(input.type).toBe('number');
  });
});
