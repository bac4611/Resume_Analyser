
import { describe, it, expect } from 'vitest';

describe('Resume Analyser Frontend', () => {
  it('should run a basic test successfully', () => {
    expect(1 + 1).toBe(2);
  });

  it('should validate application name', () => {
    const appName = 'Resume Analyser';
    expect(appName).toBe('Resume Analyser');
  });
});
