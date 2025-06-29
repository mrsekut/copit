import { describe, it, expect } from 'vitest';
import { fetchUserRepositories } from './api';

describe('GitHub API', () => {
  it('should fetch user repositories', async () => {
    const repos = await fetchUserRepositories('mrsekut');
    expect(Array.isArray(repos)).toBe(true);
    expect(repos.length).toBeGreaterThan(0);
    if (repos.length > 0) {
      expect(repos[0]).toHaveProperty('name');
      expect(repos[0]).toHaveProperty('fullName');
    }
  });
});
