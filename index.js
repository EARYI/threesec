var express = require('express')
var fs = require('fs')
var mkdirp = require('mkdirp')
var bodyParser = require('body-parser')
var rimraf = require('rimraf')
var multiparty = require('multiparty')
var path = require('path')
var rootFolder = __dirname + '/videos/'
var index = 0;
var app = express()

app.use(bodyParser.json())

app.post('/upload', function (req, res, next) {
var form = new multiparty.Form()
form.parse(req, function(err, fields, files) {
    index++;
    var fileName = rootFolder + index

    mkdirp(fileName, function (err) {
      if (err) return res.status(500).send(err)
      fs.readFile(files.video[0].path, function (err, data) {
        if (err) return res.status(500).send(err)
        fs.writeFile(fileName + '/1.mp4', data, function (err) {
          if (err) return res.status(500).send(err)
          return res.send(200)
        })
      })
    })
  })
})

app.get('/download', function (req, res, next) {
  fs.readdir(rootFolder, function (err, files) {
    if (err) return res.status(500).send(err)
    if (files.length === 0) {
      return res.status(404).send({
        message: 'No files left in directory'
      })
    } else {
      var rand = Math.floor(Math.random() * files.length)
      var videoFolder = path.join(rootFolder, files[rand])
      fs.readdir(videoFolder, function (err, files) {
        if (err) return res.status(500).send(err)
        var file = files[0]
        var number = parseInt(file.split('.')[0], 10)
        number += 1
        if (number > 3) {
          rimraf(videoFolder, function (err) {
            if (err) return res.send(500)
            return res.redirect('/download')
          })
        } else {
          fs.rename(path.join(videoFolder, file), path.join(videoFolder, number + '.mp4'), function (err) {
            if (err) return res.send(500)
            fs.readFile(path.join(videoFolder, number + '.mp4'), function (err, data) {
              if (err) return res.send(500)
              return res.send(new Buffer(data, 'binary'))
            })
          })  
        }
      })
    }
  })
})

 //app.listen(8080, function(err) {
 //  if (err) throw err
 //  console.log('listening on 8080')
 //})

app.listen(process.env.PORT || 8080, function(err) {
  if (err) throw err
  console.log('listening on 8080')
})
