import fs from 'node:fs'
import { resolve } from 'node:path'
import os from 'node:os'
import consola from 'consola'

export function prepareSync() {
  consola.info('[Sync] Checking sync folder availability...')
  const syncPath = resolve(os.homedir(), 'Library/Mobile Documents/com~apple~CloudDocs/RaycastSync')
  if (!fs.existsSync(syncPath)) {
    consola.info('[Sync] Preparing sync folder...')
    fs.mkdirSync(syncPath)
    consola.success('[Sync] Sync folder created.')
  }
  consola.success(`[Sync] Sync folder is ready.`)
}