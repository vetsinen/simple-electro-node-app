const fs = require('fs')
const path =require('path')
const NodeID3 =  require('node-id3')
const Lame = require("node-lame").Lame;

const directory = '/home/jsdev/Music/bacha5/'

//iterateOnFiles(directory,encodeToRegularBitrate)

function iterateOnFiles(dir, operation=backup_filenameAndTags){
    const files = fs.readdirSync(dir);
    let c=1
    let shortNames = []
    for (let i in files){
        c++
        let shortFileName = files[i]
        if (shortFileName.slice(-4)!=='.mp3'){continue}
        //console.log(shortFileName)
        if (operation!==encodeToRegularBitrate){
            operation(dir, shortFileName)
        }
        else {
            shortNames.push(shortFileName)
        }
    }
    return shortNames
    if (operation===encodeToRegularBitrate){
        encodeToRegularBitrate(dir, shortNames)
        console.log('encoded')
    }
}

function backup_filenameAndTags(directory, file){
    let fullname =path.join(directory,file)
    let tags = NodeID3.read(fullname)
    tags.performerInfo = tags.title+'|'+tags.artist+'|' + tags.album + '|' + file
    if (tags.title.length<3){tags.title=file.toLowerCase()}
    tags.composer = tags.title
    const success = NodeID3.write(tags, fullname)
    return success
}

function renameAndReTitleTrack(directory, file){
    let fullname =path.join(directory,file)
    let tags = NodeID3.read(fullname)
    tags.title = (tags.album+'-'+tags.composer).toLowerCase()
    const success = NodeID3.write(tags, fullname)
    fs.renameSync(fullname,path.join(directory,tags.title+'.mp3'))
}

async function encodeToRegularBitrate(directory, files, bitrate = 128){
    const directoryOut = directory+'out/'
    fs.rmdirSync(directoryOut, { recursive: true })
    console.log(`${directoryOut} is deleted!`)
    fs.mkdirSync(directoryOut)

    console.log(files)
    let encoders = []
    for (let i in files){
        encoders.push(
            new Lame({
                output: directoryOut + files[i],
                bitrate: bitrate
            }).setFile(directory + files[i]).encode()
        )
    }

    Promise.all(encoders).then(rez=>console.log(encoders))
}

function filterComplexTags(tags) {
    let rez = {}
    for (var prop in tags) {
        if (typeof tags[prop] !== 'string') {
            continue
        }
        rez[prop] = tags[prop]
    }
    return rez
}