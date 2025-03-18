import path from 'path'
import fs from 'fs'

// Shared type for Pfam domain information
export interface PfamInfo {
  pfamId: string
  pfamDesc: string
  clanAcc: string
  clanId: string
}

// Load domain list from the meta file
export let domainList: string[] = []
export let pfamAClansMap: Map<string, PfamInfo> = new Map()

// Function to load the domain list and Pfam clans data
export const loadDomainData = () => {
  try {
    // Load domain_list from pfam-regions-d0-s20-meta.json
    const metaPath = path.join(__dirname, '../assets/pfam-regions-d0-s20-meta.json')
    const metaData = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
    domainList = metaData.domain_list

    // Load Pfam-A.clans.tsv data
    const pfamAClansTsvPath = path.join(__dirname, '../assets/Pfam-A.clans.tsv')
    pfamAClansMap = fs
      .readFileSync(pfamAClansTsvPath, 'utf8')
      .trim()
      .split('\n')
      .reduce((map, row) => {
        const columns = row.split('\t').map((value) => value.trim())
        map.set(columns[0], {
          clanAcc: columns[1],
          clanId: columns[2],
          pfamId: columns[3],
          pfamDesc: columns[4],
        })
        return map
      }, pfamAClansMap)

    // Add the special classes to the map
    // "PAD",
    // "NO_DOMAIN",
    // "UNKNOWN_DOMAIN",
    pfamAClansMap.set('PAD', {
      clanAcc: '',
      clanId: '',
      pfamId: 'PAD',
      pfamDesc: 'Sequence Padding',
    })
    pfamAClansMap.set('NO_DOMAIN', {
      clanAcc: '',
      clanId: '',
      pfamId: 'NO_DOMAIN',
      pfamDesc: 'No Domain',
    })
    pfamAClansMap.set('UNKNOWN_DOMAIN', {
      clanAcc: '',
      clanId: '',
      pfamId: 'UNKNOWN_DOMAIN',
      pfamDesc: 'Unknown Domain',
    })
    // Note: 'PF05906' does not exist in domainList
    console.log(`Loaded ${domainList.length} domains and ${pfamAClansMap.size} Pfam entries`)
  } catch (error) {
    console.error('Error loading domain data:', error)
  }
}

// Ensure the domain data is loaded
export const ensureDomainDataLoaded = () => {
  if (domainList.length === 0 || pfamAClansMap.size === 0) {
    loadDomainData()
  }
}

// Initialize the data when this module is first loaded
ensureDomainDataLoaded()

// Helper to get Pfam info with fallback to empty values
export const getPfamInfo = (pfamAcc: string): PfamInfo => {
  return (
    pfamAClansMap.get(pfamAcc) || {
      clanAcc: '',
      clanId: '',
      pfamId: '',
      pfamDesc: '',
    }
  )
}
