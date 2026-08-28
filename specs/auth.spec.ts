/**
 * Feature: Authentication
 *
 * Spec: Admin login protects the platform and issues a JWT token.
 * Public form pages must remain accessible without authentication.
 */

import bcrypt from 'bcryptjs';

const mockFindUnique = jest.fn();

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    user: { findUnique: mockFindUnique },
  },
}));

import { loginUser } from '../src/services/authService';

describe('Feature: Authentication', () => {
  const mockUser = {
    id: 1,
    email: 'admin@leadplatform.com',
    name: 'Admin',
    password: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    mockUser.password = await bcrypt.hash('Admin@123', 12);
    process.env.JWT_SECRET = 'test-secret-32-chars-minimum-here';
  });

  beforeEach(() => mockFindUnique.mockClear());

  describe('Spec: loginUser()', () => {
    it('should return a JWT token and user object for valid credentials', async () => {
      mockFindUnique.mockResolvedValue(mockUser);

      const result = await loginUser('admin@leadplatform.com', 'Admin@123');

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('admin@leadplatform.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw "Invalid credentials" for a non-existent email', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(loginUser('unknown@example.com', 'Admin@123')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw "Invalid credentials" for a wrong password', async () => {
      mockFindUnique.mockResolvedValue(mockUser);

      await expect(loginUser('admin@leadplatform.com', 'WrongPassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should not expose the hashed password in the returned user object', async () => {
      mockFindUnique.mockResolvedValue(mockUser);

      const result = await loginUser('admin@leadplatform.com', 'Admin@123');
      expect(result.user).not.toHaveProperty('password');
    });
  });
});
