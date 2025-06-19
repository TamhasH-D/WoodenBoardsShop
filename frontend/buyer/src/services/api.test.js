import api, { apiService, updateApiToken } from './api'; // Adjust path as needed
import MockAdapter from 'axios-mock-adapter';

describe('apiService', () => {
  let mock;

  beforeAll(() => {
    // It's good practice to ensure a token is set for tests if your API typically requires it,
    // or ensure that the specific endpoint being tested doesn't require auth,
    // or mock the auth check itself if that's part of what you're testing.
    updateApiToken('test-token'); // Example token
  });

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.restore();
  });

  // Test for getChatThreadDetails
  describe('getChatThreadDetails', () => {
    it('should fetch chat thread details successfully', async () => {
      const threadId = 'thread-123';
      const mockThreadData = {
        id: threadId,
        participants: ['user1', 'user2'],
        last_message: 'Hello there!',
        // ... other thread details
      };

      mock.onGet(`/api/v1/chat-threads/${threadId}`).reply(200, mockThreadData);

      const result = await apiService.getChatThreadDetails(threadId);

      expect(result).toEqual(mockThreadData);
      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].url).toBe(`/api/v1/chat-threads/${threadId}`);
    });

    it('should throw an error if the API call fails for getChatThreadDetails', async () => {
      const threadId = 'thread-456';
      mock.onGet(`/api/v1/chat-threads/${threadId}`).reply(500, { message: 'Internal Server Error' });

      await expect(apiService.getChatThreadDetails(threadId)).rejects.toThrow();
    });

    it('should log an error message to console.error when API call fails', async () => {
      const threadId = 'thread-789';
      const errorMessage = 'Network Error';
      mock.onGet(`/api/v1/chat-threads/${threadId}`).networkError(); // Simulates a network error

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await apiService.getChatThreadDetails(threadId);
      } catch (error) {
        // Expected to throw
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
      // Example: Check for a specific part of the error message if necessary
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(`[apiService] Error fetching chat thread details for thread ${threadId}:`),
        // For network errors, error.response is undefined, so error.message (a string) is logged.
        // For other errors (like 500), error.response.data (an object) might be logged.
        // So we expect either a string or an object.
        expect.anything()
      );

      // A more specific check for the network error case:
      const relevantCall = consoleErrorSpy.mock.calls.find(call => call[0].includes(`[apiService] Error fetching chat thread details for thread ${threadId}:`));
      expect(relevantCall[1]).toBe(errorMessage); // In case of networkError(), it's the error message string

      consoleErrorSpy.mockRestore();
    });
  });
});
