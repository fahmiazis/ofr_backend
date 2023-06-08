// const { docuser, ikk } = require('../models')
const response = require('../helpers/response')
const { klaim } = require('../models')
const AdmZip = require('adm-zip')
const excelJS = require('exceljs')

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
  },
  exportMcm: async (req, res) => {
    try {
      const { no } = req.body
      const workbook = new excelJS.Workbook()
      const worksheet = workbook.addWorksheet('My Users')
      const path = 'assets/zip' //eslint-disable-line
      const findKlaim = await klaim.findAll({
        where: {
          no_transaksi: no
        }
      })
      if (findKlaim.length > 0) {
        worksheet.columns = [
          { header: 'First Name', key: 'fname', width: 10 },
          { header: 'Last Name', key: 'lname', width: 10 },
          { header: 'Email Id', key: 'email', width: 10 },
          { header: 'Gender', key: 'gender', width: 10 }
        ]
        let counter = 1
        findKlaim.forEach((item) => {
          item.s_no = counter
          worksheet.addRow(item)
          counter++
        })
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true }
        })
        try {
          res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          )
          res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx')
          return workbook.xlsx.write(res).then(() => {
            response(res, 'success generate file')
          })
          // await workbook.xlsx.writeFile(`${path}/users.xlsx`).then(() => {
          //   res.send({
          //     status: "success",
          //     message: "file successfully downloaded",
          //     path: `${path}/users.xlsx`,
          //   });
          // });
        } catch (err) {
          return response(res, 'failed generate mcm files', {}, 400, false)
        }
      } else {
        return response(res, 'failed generate mcm files', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
