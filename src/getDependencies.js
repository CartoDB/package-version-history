'use strict'

const fs = require('fs')
const yarnLockfile = require('@yarnpkg/lockfile')

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

function dependenciesParser(mod, dependencies) {
    dependencies = dependencies || {}
    Object.keys(mod).forEach( (name) => {
        let realName = getPackageName(name)
        if (!dependencies.hasOwnProperty(realName)) {
            dependencies[realName] = [];
        }

        let version = mod[name].version || mod[name]
        if (dependencies[realName].indexOf(version) === -1) {
            dependencies[realName].push(version)
        }

        let childDependencies = mod[name].dependencies || mod[name].requires
        if (childDependencies) {
            dependenciesParser(childDependencies, dependencies);
        }
    })
    
    return dependencies
}

function getPackageName(name) {
    let atIndex = name.indexOf('@') || name.indexOf('#')
    if(atIndex > 0)  
        return name.substring(0, atIndex)

    return name
}
