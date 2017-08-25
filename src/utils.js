'use strict'

const { exec } = require('child_process')

module.exports = {
    executeCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (err, stdout, stderr) => {
                if (err) {
                    reject(`exec error: ${err}`)
                }  else {
                    resolve(stdout)
                }
            })
        })
    },

    sortByKey(unsortedObj) {
        let sortedObj = {}
        let keys = Object.keys(unsortedObj).sort(sortVersions).forEach( key => {
            sortedObj[key] = unsortedObj[key]
        })

        return sortedObj
    },

    sortByProperty(unsortedObj, property) {
        return unsortedObj.sort( (a, b) => {
            return sortVersions(a[property], b[property])
        })
    },

    sortVersions: sortVersions
}

function sortVersions(versionA, versionB) {
    versionA = versionA.split('.')
    versionB = versionB.split('.')

    for(let i = 0; i < Math.min(versionA.length, versionB.length); i++) {
        let a = isNaN(parseInt(versionA[i])) ? -1 : parseInt(versionA[i])
        let b = isNaN(parseInt(versionB[i])) ? -1 : parseInt(versionB[i])

        if(a == -1 && b == -1) {
            if(versionA[i] < versionB[i]) 
                return -1
            if(versionA[i] > versionB[i]) 
                return 1
        }
            
        if(a == -1)
            return -1
        if(b == -1)
            return 1

        if(a < b) 
            return -1
        if(a > b) 
            return 1
    }
        
    return 0
}