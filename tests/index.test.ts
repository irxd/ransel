import { expect, test, vi } from 'vitest'
import { prettierCommand } from '../src/commands/prettier'
import { existsSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

vi.mock('node:fs')
vi.mock('node:child_process', () => ({
  spawn: vi.fn(() => {
    const mockProcess = {
      on: vi.fn((event, callback) => {
        if (event === 'close') {
          // Simulate successful process completion
          callback(0)
        }
        return mockProcess
      })
    }
    return mockProcess
  })
}))

test('prettierCommand configures prettier in a project', async () => {
  const mockCwd = '/test/project'
  const mockArgs: string[] = []
  
  // Mock filesystem checks and writes
  vi.mocked(existsSync).mockReturnValue(false)
  vi.mocked(readFileSync).mockReturnValue('{"scripts":{}}')
  vi.mocked(writeFileSync).mockImplementation(() => undefined)

  await prettierCommand({ cwd: mockCwd, args: mockArgs })

  // Verify .prettierrc was created
  expect(writeFileSync).toHaveBeenCalledWith(
    join(mockCwd, '.prettierrc'),
    expect.stringContaining('"semi": true'),
    'utf8'
  )

  // Verify .prettierignore was created
  expect(writeFileSync).toHaveBeenCalledWith(
    join(mockCwd, '.prettierignore'),
    expect.stringContaining('node_modules'),
    'utf8'
  )

  // Verify package.json scripts were added
  expect(writeFileSync).toHaveBeenCalledWith(
    join(mockCwd, 'package.json'),
    expect.stringContaining('"format": "prettier . -w"'),
    'utf8'
  )
})
