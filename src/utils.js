'use strict'

const { exec } = require('child_process')

const utils = module.exports = {
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

    sortVersions: sortVersions,

    getPackageName(name) {
        let atIndex = name.indexOf('@') || name.indexOf('#')
        if(atIndex > 0)  
            return name.substring(0, atIndex)
    
        return name
    },
    
    /**
     * Check if 2 arrays are equals
     * Very limited function, created adhoc for this use case
     * 
     * @param {array} array1 
     * @param {array} array2 
     * 
     * @returns {boolean}
     */
    arraysEquals(array1, array2) {
        if(!array1 || !array2)
            return false
    
        if(array1.length !== array2.length)
            return false
    
        for (let key in array1) {
            if (JSON.stringify(array1[key]) !== JSON.stringify(array2[key]) )
                return false
        }
    
        return true
    },
    
    /**
     * Check if the child array exists in the parent array of arrays
     * Very limited function, created adhoc for this use case
     * 
     * @param {array} child 
     * @param {array of arrays} parent 
     * 
     * @returns the array indexes that exists in the parent. Returns false if no exists
     */
    existsArrayInArray(child, parent) {
        if(!parent || !child)
            return false
        
        let filteredArrayIndex = parent.map( (array, index) => {
            if(utils.arraysEquals(array, child))
                return index
        })
    
        return !filteredArrayIndex.length ? false : filteredArrayIndex
    }
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