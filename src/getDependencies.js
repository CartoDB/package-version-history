'use strict'

const fs = require('fs')
const yarnLockfile = require('@yarnpkg/lockfile')
const { getPackageName, arraysEquals, existsArrayInArray } = require('./utils')

const YARN_LOCK  = { filename: '/yarn.lock',            type: 'yarnLock' }
const SHRINKWRAP = { filename: '/npm-shrinkwrap.json',  type: 'json' }
const NPM_LOCK   = { filename: '/package-lock.json',    type: 'json' }

module.exports = function(path) {
    return Promise.all([
        getFile(YARN_LOCK, path), 
        getFile(SHRINKWRAP, path),
        getFile(NPM_LOCK, path)
    ]).then(files => { 
        return getDependencies(files)
    }).catch(err => {
        return new Error(`Something was wrong: ${err}`)
    })
}

function getFile(fileConf, path) {
    const filepath = path + fileConf.filename

    return new Promise((resolve, reject) => {
        fs.access(filepath, fs.constants.F_OK, err => {
            if(err) {
                resolve()
            } else {
                fs.readFile(filepath, 'utf8', (err, file) => {
                    if(err) {
                        resolve()
                    } else {
                        if(fileConf.type === 'yarnLock') {
                            resolve(yarnLockfile.parse(file).object)
                        } else {
                            resolve(JSON.parse(file))
                        }
                    }
                })
            }
        })
    })    
}

function getDependencies(files) {
    const [yarn, shrinkwrap, npm] = files

    if(shrinkwrap)
        return dependenciesParser(shrinkwrap.dependencies)
    if(yarn)
        return dependenciesParser(yarn)
    if(npm)
        return dependenciesParser(npm.dependencies)
}

function dependenciesParser(mod, dependencies, parents) {
    dependencies = dependencies || {}
    parents = parents || []
    Object.keys(mod).forEach( (name) => {
        let realName = getPackageName(name)
        if (!dependencies.hasOwnProperty(realName)) {
            dependencies[realName] = {
                dependencies: []
            }
        }

        let version = mod[name].version || mod[name]
        if (dependencies[realName].dependencies.indexOf(version) === -1) {
            dependencies[realName].dependencies.push(version)
        }

        let parentsBeforeChilds = parents.slice(0)
        
        if (parents.length) {
            if(!dependencies[realName]['parents']) {
                dependencies[realName]['parents'] = {}
            }

            if(!dependencies[realName].parents[version]) {
                dependencies[realName].parents[version] = []
            }
    
            if(!existsArrayInArray(parents, dependencies[realName].parents[version])) {
                dependencies[realName].parents[version].push(parentsBeforeChilds)
            }
        }

        let childDependencies = mod[name].dependencies || mod[name].requires
        if (childDependencies) {
            parents.push({[realName]: version})
            dependenciesParser(childDependencies, dependencies, parents)
        }

        parents = parentsBeforeChilds
    })

    return dependencies

}

