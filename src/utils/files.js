import fs from 'fs'
export function deleteDirectory(path) {
  fs.rmdirSync(path, { recursive: true, force: true }, (err) => {
    throw err
  })
}
