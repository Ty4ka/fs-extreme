import path from 'path'
import fs from 'fs'
import { Writer } from 'steno'
import { reTryCatch } from 'esm-requirer'

export function saveBuffer(filePath: string, buffer: Buffer) {
  if (!filePath?.length || !buffer?.length) {
    return
  }

  ensureDirectoryExistence(filePath)

  reTryCatch({
    fn: () => {
      fs.writeFileSync(filePath, buffer, 'utf8')
    },
    title: 'saveBuffer'
  })
}

export async function saveText(filePath: string, text: string) {
  if (!text?.length || !filePath?.length) {
    return
  }

  ensureDirectoryExistence(filePath)

  await reTryCatch({
    fn: async () => {
      const file = new Writer(filePath)
      await file.write(text)
    },
    title: 'saveText'
  })
}

export function ensureDirectoryExistence(selectedPath: string, isDir = false, tryIndex = 0) {
  const tryLimit = 2

  if (tryIndex >= tryLimit) {
    return { result: false }
  }
  try {
    const dirname = isDir ? selectedPath : path.dirname(selectedPath)
    if (fs.existsSync(dirname)) {
      return { result: true }
    }

    ensureDirectoryExistence(dirname, false, ++tryIndex)

    return {
      result: fs.mkdirSync(dirname, {
        recursive: true
      })
    }
  } catch (e: any) {
    return {
      result: fs.existsSync(selectedPath),
      error: `ensureDirectoryExistence: ${e}`
    }
  }
}

export function url2filename(url?: string, replaceValue: string = '-') {
  if (!url?.length) {
    return ''
  }

  return (
    url
      ?.replaceAll('http:', '')
      .replaceAll('https:', '')
      .replaceAll('//', '')
      .replaceAll('(', '')
      .replaceAll(')', '')
      .replaceAll(' ', replaceValue)
      .replaceAll(`${replaceValue.repeat(2)}`, replaceValue)
      .replace(/[/\\?%*:|"'~=<>!@{};:,.#$^&+]/g, replaceValue) || ''
  )
}
