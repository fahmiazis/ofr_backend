// const { docuser, ikk } = require('../models')
const response = require('../helpers/response')
const AdmZip = require('adm-zip')

module.exports = {
  createZip: async (req, res) => {
    try {
      const zip = new AdmZip()
      const path = 'assets/zip'
      const outputFile = 'test.zip'
      zip.addLocalFolder(path)
      zip.writeZip(outputFile)
      console.log(`Created ${outputFile} successfully`)
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
