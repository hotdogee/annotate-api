const logger = require('./logger')
const pfam = require('./pfam')

// async main
;(async () => {
  try {
    const id = 'c5179bf95c52872dd0be1207dd9898dc'
    const result = await pfam.create({
      seq: 'MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN'
    })
    // const result = await pfam.find({
    //   query: {
    //     _id: 'c5179bf95c52872dd0be1207dd9898dc'
    //   }
    // })
    logger.info(JSON.stringify(result, null, 0))
    // {"seq":"MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN","predictions":[{"classes":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,4877,1,1],"top_probs":[[0.997444,0.000282054,0.000102332],[0.997968,0.000131374,0.000126066],[0.99692,0.000428862,0.000278933],[0.997397,0.000422197,0.000207456],[0.996028,0.000993942,0.000317281],[0.996538,0.000910947,0.000240429],[0.996071,0.00131023,0.000227068],[0.99484,0.00200058,0.000421379],[0.995103,0.0020761,0.000330702],[0.995357,0.0020245,0.000306039],[0.99423,0.00268906,0.000394127],[0.993099,0.00345266,0.000355885],[0.992882,0.00371773,0.000337084],[0.992017,0.00440202,0.000355949],[0.991739,0.00443457,0.000482615],[0.99274,0.00403767,0.000377947],[0.992501,0.0044295,0.000329193],[0.99302,0.00408881,0.000354331],[0.994025,0.0031792,0.000422031],[0.994751,0.00261118,0.000333282],[0.995671,0.00158521,0.000345096],[0.996467,0.00127791,0.000288093],[0.99492,0.00139881,0.000805606],[0.991378,0.00303585,0.000911789],[0.978042,0.00730492,0.00387864],[0.960107,0.0138488,0.00975436],[0.948378,0.0311425,0.00395123],[0.659853,0.324351,0.00344731],[0.68776,0.304625,0.001501],[0.970663,0.0280448,0.000412624],[0.997507,0.00225827,0.0000865316],[0.999537,0.000402701,0.0000168713],[0.999798,0.000174823,0.00000863342],[0.999773,0.000202767,0.00000590885],[0.99978,0.000196326,0.00000414556],[0.999759,0.000213146,0.00000401884],[0.999772,0.00020071,0.00000244687],[0.999835,0.000147076,0.00000192983],[0.999865,0.000119442,0.00000198254],[0.999864,0.000120563,0.00000229362],[0.999895,0.0000925089,0.00000192953],[0.999893,0.0000952935,0.00000188756],[0.999912,0.0000765089,0.00000217755],[0.99991,0.0000800014,0.00000191189],[0.9999,0.0000889085,0.00000197527],[0.999853,0.00013101,0.00000246987],[0.999871,0.000114933,0.00000255711],[0.999877,0.000108144,0.00000294745],[0.999859,0.000123143,0.00000332724],[0.999846,0.000134107,0.00000369717],[0.999812,0.000164335,0.00000420849],[0.999815,0.00016115,0.0000042308],[0.999802,0.000171875,0.00000423831],[0.999816,0.000158958,0.00000400454],[0.999796,0.000176305,0.00000416675],[0.999799,0.000172951,0.0000040903],[0.999769,0.000199198,0.00000443062],[0.999767,0.00019967,0.00000439819],[0.999729,0.000232605,0.00000494708],[0.999704,0.000253811,0.00000503536],[0.999679,0.000273131,0.00000532655],[0.999625,0.000318704,0.00000608578],[0.999626,0.000315956,0.00000604396],[0.999599,0.00033961,0.00000635404],[0.999578,0.000352254,0.00000660969],[0.999502,0.000412708,0.000008597],[0.9995,0.000416731,0.00000846375],[0.999516,0.00039704,0.00000956106],[0.999473,0.000429295,0.0000113977],[0.999487,0.000411156,0.0000115492],[0.999422,0.000462199,0.0000141268],[0.999485,0.000408784,0.0000115004],[0.99945,0.000437312,0.0000117222],[0.999466,0.000418782,0.0000114582],[0.999328,0.000527513,0.0000152186],[0.999332,0.000521384,0.0000150177],[0.999295,0.000552041,0.0000153034],[0.999386,0.000481323,0.000013052],[0.999427,0.00044568,0.0000133118],[0.999408,0.000453166,0.0000165518],[0.99942,0.000441127,0.0000172696],[0.999596,0.000304658,0.000013504],[0.999681,0.00023538,0.0000114195],[0.999594,0.000299141,0.0000159264],[0.999481,0.000387182,0.0000212362],[0.999384,0.000470744,0.0000246363],[0.999296,0.000542875,0.0000279616],[0.99899,0.000799426,0.0000361453],[0.998401,0.0013181,0.0000468972],[0.99778,0.00187251,0.0000546126],[0.99604,0.00341757,0.0000816497],[0.992808,0.00634743,0.000133818],[0.988946,0.00991765,0.000175188],[0.970627,0.0271132,0.00035328],[0.936435,0.0601007,0.000502448],[0.837202,0.158748,0.000554726],[0.85475,0.142398,0.00036893],[0.999999,3.96291e-7,3.10402e-7]],"top_classes":[[1,7991,3496],[1,7991,5416],[1,5416,7991],[1,5416,3496],[1,5416,7991],[1,5416,3496],[1,5416,3496],[1,5416,972],[1,5416,972],[1,5416,972],[1,5416,972],[1,5416,972],[1,5416,972],[1,5416,15765],[1,5416,15765],[1,5416,15765],[1,5416,5428],[1,5416,5428],[1,5416,5428],[1,5416,5428],[1,5416,15765],[1,5416,15765],[1,5416,6021],[1,6021,15203],[1,6021,5416],[1,4877,6021],[1,4877,15203],[1,4877,5416],[4877,1,5416],[4877,1,5416],[4877,1,5416],[4877,1,5416],[4877,1,2807],[4877,1,2807],[4877,1,2807],[4877,1,5416],[4877,1,5416],[4877,1,15137],[4877,1,15137],[4877,1,15137],[4877,1,15137],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,7604],[4877,1,2758],[4877,1,2758],[4877,1,2758],[4877,1,2758],[4877,1,2758],[4877,1,2758],[4877,1,2758],[4877,1,2758],[4877,1,2758],[4877,1,2758],[4877,1,2758],[4877,1,2758],[4877,1,3695],[4877,1,3695],[4877,1,3695],[4877,1,3695],[4877,1,13811],[4877,1,13811],[4877,1,13811],[4877,1,13811],[4877,1,13811],[4877,1,13811],[4877,1,13811],[4877,1,13811],[4877,1,13811],[4877,1,13811],[4877,1,13811],[4877,1,13811],[4877,1,13811],[4877,1,13811],[4877,1,13811],[1,4877,3137],[1,295,371]]}],"_id":"c5179bf95c52872dd0be1207dd9898dc"}
  } catch (error) {
    logger.error(error)
  } finally {
    process.exit()
  }
})()
