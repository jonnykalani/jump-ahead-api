'use strict'

require('dotenv').config()

const fs = require('fs')
const crypto = require('crypto')

const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const path = require('path')

const promiseRandomBytes = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, buf) => {
      if (err) {
        reject(err)
      }
      resolve(buf.toString('hex'))
    })
  })
}

const promiseS3Upload = (params) => {
  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

const check = function () {
  console.log('check inside aws file is working')
}

const s3Upload = (file) => {
  console.log('s3Upload is being called')
  file.stream = fs.createReadStream(file.path)
  file.ext = path.extname(file.originalname)
  console.log('file.stream is', file.stream)

  return promiseRandomBytes()
    .then((randomString) => {
      return {
        ACL: 'public-read',
        ContentType: file.mimetype,
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: randomString + file.ext,
        Body: file.stream
      }
    })
    .then(promiseS3Upload)
}

module.exports = s3Upload
