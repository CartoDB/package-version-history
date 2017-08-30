'use strict'

const Bluebird = require('bluebird')
const fs = require('fs')
const { executeCommand, sortByKey, sortVersions, arraysEquals } = require('./utils')
const getDependencies = require('./getDependencies')

module.exports = function (repoPath, packageName) {
    try {
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
            // parent references
            let allVersions = []
            let tagsByVersion = {}
            let parents = []
            packageDependenciesByTag.map(dependecyByTag => {
                if (dependecyByTag) {
                    // dependencies
                    dependecyByTag.dependencies.map(version => {
                        if (allVersions.indexOf(version) === -1) {
                            allVersions.push(version)
                            tagsByVersion[version] = []
                        }

                        if (tagsByVersion[version].indexOf(dependecyByTag.tag) === -1)
                            tagsByVersion[version].push(dependecyByTag.tag)
                    })

                    // parents
                    for(let version in dependecyByTag.parents) {
                        addParentReference(
                            parents, 
                            dependecyByTag.parents[version], 
                            version, 
                            packageName,
                            dependecyByTag.tag
                        )
                    }
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
                versionsByTag: packageDependenciesByTag,
                parents
            }

            // write file
            const repoName = repoPath.split('/').slice(-1).pop()
            const resultFilename = `./output/${repoName}_${packageName}_${now.getTime()}.json`
            fs.writeFile(resultFilename, JSON.stringify(result, null, 4), (err) => {
                if (err) throw err

                console.log(`
                    Done! Show the file: ${resultFilename}
                `)
            })
        })

    }).catch(err => {
        throw new Error(`General: ${err}`)
    })
    } catch(err) {
        console.log('---------')
        console.log(err)
    }
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
                    dependencies: allDependencies[packageName].dependencies,
                    parents: allDependencies[packageName].parents || null
                }
            }
        })
    }).catch(err => {
        throw new Error(`checkVersionsByTag: ${err}`)
    })
}

function addParentReference(parents, references, version, packageName, tag) {
    references.map(r => {
        let reference = r.slice(0)
        reference.push({[packageName]: version})

        let added = false
        for(let i in parents) {
            if(arraysEquals(reference, parents[i].reference)) {
                parents[i].tags.push(tag)
                added = true
                break
            }
        }

        if(!added) {
            let tags = [tag]
            
            parents.push({
                reference,
                tags
            })
        }
    })
}