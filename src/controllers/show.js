const { docuser } = require('../models')
const response = require('../helpers/response')
const fs = require('fs')

module.exports = {
  showDokumen: async (req, res) => {
    try {
      const id = req.params.id
      const result = await docuser.findByPk(id)
      if (result) {
        const url = result.path
        fs.readFile(url, function (err, data) {
          if (err) {
            console.log(err)
          }
          res.contentType('application/pdf')
          res.send(data)
        })
      } else {
        return response(res, 'failed to show dokumen', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
