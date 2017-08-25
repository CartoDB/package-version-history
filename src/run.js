'use strict'

const Bluebird = require('bluebird')
const fs = require('fs')
const { executeCommand, sortByKey, sortByProperty, sortVersions } = require('./utils');
const getDependencies = require('./getDependencies')

module.exports = function (repoPath, packageName) {
    // git tag
    executeCommand(`cd ${repoPath} && git tag`)
    .then(tagsString => {
        const tags = tagsString.split('\n').sort(sortVersions)

        // check versions of the package in each tag
        Bluebird.map(tags, function (tag) {
            return checkVersionsByTag(tag, repoPath, packageName)
        }, { concurrency: 1 })
        .then(function (packageDependenciesByTag) {
            // get all versions used and
            // get tags used by version
            let allVersions = []
            let tagsByVersion = {}
            packageDependenciesByTag.map(dependecyByTag => {
                if (dependecyByTag) {
                    dependecyByTag.dependencies.map(version => {
                        if (allVersions.indexOf(version) === -1) {
                            allVersions.push(version)
                            tagsByVersion[version] = []
                        }

                        if (tagsByVersion[version].indexOf(dependecyByTag.tag) === -1)
                            tagsByVersion[version].push(dependecyByTag.tag)
                    })
                }
            })

            // prepare final JSON
            const now = new Date()
            let result = {
                package: packageName,
                repoPath: repoPath,
                createdAt: now,
                versions: allVersions.sort(sortVersions),
                tagsByVersion: sortByKey(tagsByVersion),
                versionsByTag: packageDependenciesByTag
            }

            // write file
            const repoName = repoPath.split('/').slice(-1).pop()
            const resultFilename = `./output/${repoName}_${packageName}_${now.getTime()}.json`
            fs.writeFile(resultFilename, JSON.stringify(result, null, 4), (err) => {
                if (err) throw err;

                console.log(`
                    Done! Show the file: ${resultFilename}
                `)
            })
        })

    }).catch(err => {
        throw new Error(`General: ${err}`)
    })
}



function checkVersionsByTag(tag, repoPath, packageName) {
    console.log(`tag ${tag}`)
    return executeCommand(`cd ${repoPath} && git checkout ${tag}`)
    .then(() => {
        return getDependencies(repoPath)
        .then(allDependencies => {
            if (allDependencies && allDependencies[packageName]) {
                return {
                    tag: tag,
                    dependencies: allDependencies[packageName]
                }
            }
        })
    }).catch(err => {
        throw new Error(`checkVersionsByTag: ${err}`)
    })
}
