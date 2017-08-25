'use strict'

const repoPath = process.argv[2]
const packageName = process.argv[3]

// params validation
if(process.argv.length != 4 || !repoPath || !packageName) {
    console.error(`
        Bad parameters. Use: 
        node index.js {PATH TO REPO} {PACKAGE NAME}
    `)
    process.exit()
}

require('./src/run')(repoPath, packageName)
