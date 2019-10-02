const fs = require('fs')

const pfamAClansTsvPath = './src/assets/Pfam-A.clans.tsv'
const pfamAClans = fs
  .readFileSync(pfamAClansTsvPath, 'utf8')
  .trim()
  .split('\n')
  .reduce((a, v) => {
    v = v.split('\t').map((vv) => vv.trim())
    a[v[0]] = {
      clanAcc: v[1],
      clanId: v[2],
      pfamId: v[3],
      pfamDesc: v[4]
    }
    return a
  }, {})

// "PAD",
// "NO_DOMAIN",
// "UNKNOWN_DOMAIN",
pfamAClans.PAD = {
  clanAcc: '',
  clanId: '',
  pfamId: 'PAD',
  pfamDesc: 'Sequence Padding'
}
pfamAClans.NO_DOMAIN = {
  clanAcc: '',
  clanId: '',
  pfamId: 'NO_DOMAIN',
  pfamDesc: 'No Domain'
}
pfamAClans.UNKNOWN_DOMAIN = {
  clanAcc: '',
  clanId: '',
  pfamId: 'UNKNOWN_DOMAIN',
  pfamDesc: 'Unknown Domain'
}
// > Object.keys(pfamAClans).length
// 16712
// Object.values(pfamAClans).reduce((a, v) => {
//   for (let [k, vv] of Object.entries(v)) {
//     if (vv) {
//       a[k] = a[k] ? a[k] + 1 : 1
//     }
//   }
//   return a
// }, {})
// { clanAcc: 5996, clanId: 5996, pfamId: 16712, pfamDesc: 16712 }

module.exports = pfamAClans
