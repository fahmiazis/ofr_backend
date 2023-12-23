const arr = ['KODE_OUTLET', 'NAMA_OUTLET', 'KODE_SALES', 'NAMA_SALES', 'TGL_FAKTUR', 'NO_FAKTUR', 'GROSS_SALES', 'RP_DISCPC', 'DISC1', 'DISC2', 'PRO_AMOUNT', 'CASH_DISCT', 'PPN', 'TOTAL', 'TYPE', 'PCODE', 'NAMA_PRODUK', 'QTY_PCS', 'KODE_RETUR', 'NAMA_RETUR', 'TGL_RETUR', 'INVORT', 'REMARK', 'KETERANGAN']

const temp = []
// const temp = [kode_outlet,nama_outlet,kode_sales,nama_sales,tgl_faktur,no_faktur,gross_sales,rp_discpc,disc1,disc2,pro_amount,cash_disct,ppn,total,type,pcode,nama_produk,qty_pcs,kode_retur,nama_retur,tgl_retur,invort,remark,keterangan]

arr.map(x => { return temp.push(x.toLocaleLowerCase()) })

console.log(0 % 2)
