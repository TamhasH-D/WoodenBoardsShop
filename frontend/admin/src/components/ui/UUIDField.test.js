import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UUIDField from './UUIDField';
import { isValidUUID } from '../../utils/uuid';

// Mock the uuid utility
jest.mock('../../utils/uuid', () => ({
  generateUUID: jest.fn(() => '12345678-1234-4567-8901-123456789012'),
  isValidUUID: jest.fn()
}));

// Import the mocked functions
import { generateUUID } from '../../utils/uuid';

describe('UUIDField', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    isValidUUID.mockReturnValue(true);
    generateUUID.mockReturnValue('12345678-1234-4567-8901-123456789012');
  });

  it('renders in display mode by default', () => {
    render(<UUIDField value="" onChange={mockOnChange} />);

    expect(screen.getByText(/Идентификатор:/)).toBeInTheDocument();
    expect(screen.getByText('будет сгенерирован автоматически')).toBeInTheDocument();
    expect(screen.getByText('✏️')).toBeInTheDocument();
  });

  it('shows existing UUID value in display mode', () => {
    const testUUID = '12345678-1234-4567-8901-123456789012';
    render(<UUIDField value={testUUID} onChange={mockOnChange} />);

    expect(screen.getByText(/Идентификатор:/)).toBeInTheDocument();
    expect(screen.getByText(testUUID)).toBeInTheDocument();
  });

  it('switches to edit mode when clicked', () => {
    render(<UUIDField value="" onChange={mockOnChange} />);
    
    const displayElement = screen.getByText('будет сгенерирован автоматически').closest('div');
    fireEvent.click(displayElement);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByTitle('Сгенерировать новый')).toBeInTheDocument();
    expect(screen.getByTitle('Подтвердить')).toBeInTheDocument();
    expect(screen.getByTitle('Отменить')).toBeInTheDocument();
  });

  it('generates new UUID when dice button is clicked', async () => {
    render(<UUIDField value="" onChange={mockOnChange} />);

    // Switch to edit mode
    const displayElement = screen.getByText('будет сгенерирован автоматически').closest('div');
    fireEvent.click(displayElement);

    // Click generate button
    const generateButton = screen.getByTitle('Сгенерировать новый');
    fireEvent.click(generateButton);

    // Should call onChange with generated UUID and exit edit mode
    expect(mockOnChange).toHaveBeenCalledWith('12345678-1234-4567-8901-123456789012');

    // Should be back in display mode
    await waitFor(() => {
      expect(screen.getByText(/Идентификатор:/)).toBeInTheDocument();
    });
  });

  it('validates UUID input in real time', async () => {
    isValidUUID.mockReturnValue(false);
    
    render(<UUIDField value="" onChange={mockOnChange} />);
    
    // Switch to edit mode
    const displayElement = screen.getByText('будет сгенерирован автоматически').closest('div');
    fireEvent.click(displayElement);
    
    // Enter invalid UUID
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'invalid-uuid' } });
    
    await waitFor(() => {
      expect(screen.getByText('Неверный формат UUID')).toBeInTheDocument();
    });
  });

  it('confirms valid UUID input', async () => {
    const validUUID = '12345678-1234-4567-8901-123456789012';
    isValidUUID.mockReturnValue(true);
    
    render(<UUIDField value="" onChange={mockOnChange} />);
    
    // Switch to edit mode
    const displayElement = screen.getByText('будет сгенерирован автоматически').closest('div');
    fireEvent.click(displayElement);
    
    // Enter valid UUID
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: validUUID } });
    
    // Click confirm button
    const confirmButton = screen.getByTitle('Подтвердить');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(validUUID);
    });
  });

  it('cancels editing and reverts to original value', () => {
    const originalValue = '12345678-1234-4567-8901-123456789012';
    render(<UUIDField value={originalValue} onChange={mockOnChange} />);

    // Switch to edit mode
    const displayElement = screen.getByText(originalValue).closest('div');
    fireEvent.click(displayElement);

    // Change input
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'changed-value' } });

    // Cancel
    const cancelButton = screen.getByTitle('Отменить');
    fireEvent.click(cancelButton);

    // Should be back in display mode with original value
    expect(screen.getByText(/Идентификатор:/)).toBeInTheDocument();
    expect(screen.getByText(originalValue)).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('handles keyboard shortcuts', async () => {
    const validUUID = '12345678-1234-4567-8901-123456789012';
    isValidUUID.mockReturnValue(true);
    
    render(<UUIDField value="" onChange={mockOnChange} />);
    
    // Switch to edit mode
    const displayElement = screen.getByText('будет сгенерирован автоматически').closest('div');
    fireEvent.click(displayElement);
    
    // Enter valid UUID
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: validUUID } });
    
    // Press Enter to confirm
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(validUUID);
    });
  });

  it('handles Escape key to cancel', () => {
    render(<UUIDField value="" onChange={mockOnChange} />);
    
    // Switch to edit mode
    const displayElement = screen.getByText('будет сгенерирован автоматически').closest('div');
    fireEvent.click(displayElement);
    
    // Press Escape to cancel
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });
    
    // Should be back in display mode
    expect(screen.getByText('будет сгенерирован автоматически')).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<UUIDField value="" onChange={mockOnChange} disabled={true} />);
    
    const displayElement = screen.getByText('будет сгенерирован автоматически').closest('div');
    expect(displayElement).toHaveClass('disabled');
    
    // Should not switch to edit mode when clicked
    fireEvent.click(displayElement);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
