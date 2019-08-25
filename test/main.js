import { promisify } from 'util'
import { execFile } from 'child_process'

import test from 'ava'
import pathExists from 'path-exists'
import { each } from 'test-each'

import getNode from '../src/main.js'

import {
  TEST_VERSION,
  getOutput,
  removeOutput,
  getNodeCli,
} from './helpers/main.js'

const pExecFile = promisify(execFile)
const pSetTimeout = promisify(setTimeout)

each([getNode, getNodeCli], ({ title }, getNodeFunc) => {
  test(`Downloads node | ${title}`, async t => {
    const output = getOutput()
    const { path, version } = await getNodeFunc(TEST_VERSION, {
      output,
      progress: false,
    })

    const { stdout } = await pExecFile(path, ['--version'])
    t.is(stdout.trim(), `v${version}`)

    await pSetTimeout(REMOVE_TIMEOUT)

    await removeOutput(path)
  })
})

// We need to wait a little for Windows to release the lock on the `node`
// executable before cleaning it
const REMOVE_TIMEOUT = 1e3

test('Returns filepath and version', async t => {
  const output = getOutput()
  const { path } = await getNode(TEST_VERSION, { output, progress: false })

  t.true(await pathExists(path))

  await removeOutput(path)
})

test('Can use version range', async t => {
  const output = getOutput()
  const { path } = await getNode('6', { output, progress: false })

  t.true(await pathExists(path))

  await removeOutput(path)
})
