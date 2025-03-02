// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../src/app'

describe('references service', () => {
  it('registered the service', () => {
    const service = app.service('references')
    assert.ok(service, 'Registered the service')
  })

  it('should find references', async () => {
    const references = await app.service('references').find({
      query: {
        seqAcc: 'A0A103YDS2.1',
      },
    })
    // console.log(references)
    // {
    //   total: 16,
    //   data: [
    //     {
    //       _id: new ObjectId('67c48570271270f15f5eb1ef'),
    //       seqAcc: 'A0A103YDS2.1',
    //       refName: 'pfam31',
    //       pfamAcc: 'PF04863',
    //       start: 52,
    //       end: 107,
    //       pfamId: 'EGF_alliinase',
    //       pfamDesc: 'Alliinase EGF-like domain',
    //       clanAcc: 'CL0001',
    //       clanId: 'EGF'
    //     },
    //     {
    //       _id: new ObjectId('67c48570271270f15f5eb1f1'),
    //       seqAcc: 'A0A103YDS2.1',
    //       refName: 'pfam31',
    //       pfamAcc: 'PF04863',
    //       start: 433,
    //       end: 488,
    //       pfamId: 'EGF_alliinase',
    //       pfamDesc: 'Alliinase EGF-like domain',
    //       clanAcc: 'CL0001',
    //       clanId: 'EGF'
    //     },
    //     {
    //       _id: new ObjectId('67c48570271270f15f5eb1f2'),
    //       seqAcc: 'A0A103YDS2.1',
    //       refName: 'pfam31',
    //       pfamAcc: 'PF04863',
    //       start: 870,
    //       end: 925,
    //       pfamId: 'EGF_alliinase',
    //       pfamDesc: 'Alliinase EGF-like domain',
    //       clanAcc: 'CL0001',
    //       clanId: 'EGF'
    //     },
    //     {
    //       _id: new ObjectId('67c485ce271270f15f53b6ad'),
    //       seqAcc: 'A0A103YDS2.1',
    //       refName: 'pfam31',
    //       pfamAcc: 'PF04864',
    //       start: 109,
    //       end: 305,
    //       pfamId: 'Alliinase_C',
    //       pfamDesc: 'Allinase',
    //       clanAcc: 'CL0061',
    //       clanId: 'PLP_aminotran'
    //     },
    //     {
    //       _id: new ObjectId('67c485ce271270f15f53b6ae'),
    //       seqAcc: 'A0A103YDS2.1',
    //       refName: 'pfam31',
    //       pfamAcc: 'PF04864',
    //       start: 300,
    //       end: 355,
    //       pfamId: 'Alliinase_C',
    //       pfamDesc: 'Allinase',
    //       clanAcc: 'CL0061',
    //       clanId: 'PLP_aminotran'
    //     },
    //     {
    //       _id: new ObjectId('67c485ce271270f15f53b6b1'),
    //       seqAcc: 'A0A103YDS2.1',
    //       refName: 'pfam31',
    //       pfamAcc: 'PF04864',
    //       start: 490,
    //       end: 746,
    //       pfamId: 'Alliinase_C',
    //       pfamDesc: 'Allinase',
    //       clanAcc: 'CL0061',
    //       clanId: 'PLP_aminotran'
    //     },
    //     {
    //       _id: new ObjectId('67c485ce271270f15f53b6b2'),
    //       seqAcc: 'A0A103YDS2.1',
    //       refName: 'pfam31',
    //       pfamAcc: 'PF04864',
    //       start: 744,
    //       end: 804,
    //       pfamId: 'Alliinase_C',
    //       pfamDesc: 'Allinase',
    //       clanAcc: 'CL0061',
    //       clanId: 'PLP_aminotran'
    //     },
    //     {
    //       _id: new ObjectId('67c485ce271270f15f53b6b4'),
    //       seqAcc: 'A0A103YDS2.1',
    //       refName: 'pfam31',
    //       pfamAcc: 'PF04864',
    //       start: 925,
    //       end: 1261,
    //       pfamId: 'Alliinase_C',
    //       pfamDesc: 'Allinase',
    //       clanAcc: 'CL0061',
    //       clanId: 'PLP_aminotran'
    //     },
    //     {
    //       _id: new ObjectId('67c487b9271270f15fa91a48'),
    //       seqAcc: 'A0A103YDS2.1',
    //       refName: 'pfam32',
    //       pfamAcc: 'PF04863',
    //       start: 52,
    //       end: 107,
    //       pfamId: 'EGF_alliinase',
    //       pfamDesc: 'Alliinase EGF-like domain',
    //       clanAcc: 'CL0001',
    //       clanId: 'EGF'
    //     },
    //     {
    //       _id: new ObjectId('67c487b9271270f15fa91a96'),
    //       seqAcc: 'A0A103YDS2.1',
    //       refName: 'pfam32',
    //       pfamAcc: 'PF04863',
    //       start: 433,
    //       end: 488,
    //       pfamId: 'EGF_alliinase',
    //       pfamDesc: 'Alliinase EGF-like domain',
    //       clanAcc: 'CL0001',
    //       clanId: 'EGF'
    //     }
    //   ],
    //   limit: 10,
    //   skip: 0
    // }
    // check the above data
    assert.ok(references, 'References were found')
    assert.ok(references.data[0]._id, 'References have an _id')
    assert.ok(references.data[0].seqAcc, 'References have a seqAcc')
    assert.ok(references.data[0].refName, 'References have a refName')
    assert.ok(references.data[0].pfamAcc, 'References have a pfamAcc')
    assert.ok(references.data[0].pfamId, 'References have a pfamId')
    assert.ok(references.data[0].pfamDesc, 'References have a pfamDesc')
    assert.ok(references.data[0].clanAcc, 'References have a clanAcc')
    assert.ok(references.data[0].clanId, 'References have a clanId')
    assert.ok(references.data[0].start, 'References have a start')
    assert.ok(references.data[0].end, 'References have an end')
    // check references.total is 16
    assert.ok(references.total === 16, 'References.total is 16')
  })
})
