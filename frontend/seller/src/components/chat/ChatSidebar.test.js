import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatSidebar from './ChatSidebar';

// Mock dependencies
jest.mock('../../utils/dateUtils', () => ({
  formatChatDate: jest.fn((date) => new Date(date).toLocaleTimeString()),
}));

jest.mock('./StatusIndicators', () => ({
  UnreadBadge: jest.fn(({ count }) => (count > 0 ? <span>{count}</span> : null)),
  OnlineStatus: jest.fn(({ isOnline }) => (isOnline ? <span>Online</span> : <span>Offline</span>)),
}));

jest.mock('./VirtualizedMessageList', () => ({
  VirtualizedThreadList: jest.fn(() => <div>VirtualizedList</div>),
}));

jest.mock('../../hooks/useOptimization', () => ({
  useMemoizedThreads: jest.fn((threads) => threads),
}));

const mockThreads = [
  { id: '1', updated_at: '2024-01-01T10:00:00Z', created_at: '2024-01-01T09:00:00Z', last_message: 'Hello', buyer_id: 'buyer1', buyer_online: true, unread_count: 1 },
  { id: '2', updated_at: '2024-01-02T11:00:00Z', created_at: '2024-01-02T10:00:00Z', last_message: 'There', buyer_id: 'buyer2', buyer_online: false, unread_count: 0 },
];

const mockProps = {
  threads: mockThreads,
  selectedThread: null,
  onThreadSelect: jest.fn(),
  loading: false,
  onRefresh: jest.fn(),
  searchQuery: '',
  onSearchChange: jest.fn(),
  // onOpenSettings was removed, so it's not needed here
};

describe('ChatSidebar', () => {
  test('does not render chat settings button', () => {
    render(<ChatSidebar {...mockProps} />);

    // The button was identifiable by its title "Настройки чата" or the gear icon "⚙️"
    // We can try to query by title, as it's a good accessibility attribute
    const settingsButtonByTitle = screen.queryByTitle(/настройки чата/i);
    expect(settingsButtonByTitle).not.toBeInTheDocument();

    // Alternatively, check for a button that might contain the gear icon text
    const settingsButtonByIcon = screen.queryByRole('button', { name: /⚙️/i });
    expect(settingsButtonByIcon).not.toBeInTheDocument();

    // If there was a specific test-id, that would be the most robust
    // Example: const settingsButtonByTestId = screen.queryByTestId('chat-settings-button');
    // expect(settingsButtonByTestId).not.toBeInTheDocument();
  });

  test('renders basic structure and threads', () => {
    render(<ChatSidebar {...mockProps} />);
    expect(screen.getByPlaceholderText(/поиск чатов/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /обновить/i })).toBeInTheDocument();
    // Check if thread items are rendered (simplified check)
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
    expect(screen.getByText(/there/i)).toBeInTheDocument();
  });
});
