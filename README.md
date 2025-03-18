# Annotate API

A FeathersJS API for protein function prediction using TensorFlow Serving.

## Features

- Protein function prediction using the Pfam model
- RESTful API for submitting protein sequences
- MongoDB storage for prediction results
- WebSocket support for real-time updates
- Efficient caching of predictions using sequence hashing
- Domain annotations with Pfam family information via `domainMap`

# Pfam Service

The Pfam service is a FeathersJS service that provides protein family (Pfam) domain prediction functionality. It allows users to submit protein sequences and receive predictions about which protein domains are present in the sequence.

## Workflow

When a user submits a protein sequence:

1. The service validates the input format
2. It checks if this sequence has been processed before (using the hash)
3. If not cached, it sends the sequence to TensorFlow Serving for prediction
4. It processes the predictions to identify protein domains
5. It enriches the results with human-readable domain information
6. It returns the complete results and caches them for future use

# Setup

## Prerequisites

- Node.js (v22 or higher)
- MongoDB
- TensorFlow Serving with GPU support (for model serving)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/annotate-api.git
cd annotate-api
```

2. Install dependencies:

```bash
npm install
```

3. Configure the database connection in `config/default.json`.

4. Start the dev server:

```bash
npm run dev
```

4.1 Start the production server:

```bash
npm run compile
npm run start
```

## CORS Configuration

The API supports Cross-Origin Resource Sharing (CORS), allowing the API to be accessed from web applications hosted on different domains. CORS settings are configured in the `config/default.json` file:

```json
"origins": ["http://localhost:9000"]
```

### Configuration Options

1. **Single Origin**: The default configuration allows access only from `http://localhost:9000`

2. **Multiple Origins**: To allow multiple specific origins:

   ```json
   "origins": ["http://localhost:9000", "https://example.com", "https://app.yourdomain.com"]
   ```

3. **Allow All Origins** (not recommended for production):

   ```json
   "origins": "*"
   ```

4. **Environment-Specific Configuration**:
   - Create separate configuration files (e.g., `config/production.json`, `config/development.json`)
   - Configure different CORS settings for each environment

### Security Best Practices

- Always restrict origins to specific trusted domains in production
- Never use wildcard (`*`) origins in production environments
- Consider using HTTPS-only origins for production

## Reference Data Setup

1. Create the reference directory structure (if not already present):

```bash
mkdir -p reference-regions/Pfam31.0
mkdir -p reference-regions/Pfam32.0
```

2. Download the Pfam reference files:

   For Pfam31.0:

   ```bash
   # Download from the European Bioinformatics Institute (EBI)
   wget ftp://ftp.ebi.ac.uk/pub/databases/Pfam/releases/Pfam31.0/Pfam-A.regions.uniprot.tsv.gz -P reference-regions/Pfam31.0/

   # Decompress the file
   gunzip reference-regions/Pfam31.0/Pfam-A.regions.uniprot.tsv.gz
   ```

   For Pfam32.0:

   ```bash
   # Download from the European Bioinformatics Institute (EBI)
   wget ftp://ftp.ebi.ac.uk/pub/databases/Pfam/releases/Pfam32.0/Pfam-A.regions.uniprot.tsv.gz -P reference-regions/Pfam32.0/

   # Decompress the file
   gunzip reference-regions/Pfam32.0/Pfam-A.regions.uniprot.tsv.gz
   ```

   Note: These files are large (6-10GB) and may take some time to download and decompress.

3. Load the reference data into the MongoDB database:

```bash
# Make sure MongoDB is running
npm run db:load-references
npm run db:index-references
```

This process will parse the Pfam reference files and populate the database with domain information, which will be displayed alongside prediction results in the frontend user interface.

## TensorFlow Serving Setup

Before using the API, you need to have TensorFlow Serving running with the Pfam model. Use one of the following commands based on your environment:

```bash
docker run --runtime=nvidia -e NVIDIA_VISIBLE_DEVICES=0 -p 8601:8501 --name serving-pfam-cuda --mount type=bind,source=/mnt/h/Projects/ANNotate2025/annotate-serving/models,target=/models -t tensorflow/serving:2.12.1-gpu --model_config_file=/models/models_config_pfam.proto --file_system_poll_wait_seconds=60
```

For Windows WSL2 with Docker Desktop, use:

```bash
docker run --runtime=nvidia -e NVIDIA_VISIBLE_DEVICES=0 -p 8601:8501 --name serving-pfam-cuda --mount type=bind,source=/mnt/h/Projects/ANNotate2025/annotate-serving/models,target=/models -t tensorflow/serving:2.12.1-gpu --model_config_file=/models/models_config_pfam.proto --file_system_poll_wait_seconds=60
```

## Mounting a ext4 Physical HDD in WSL

```powershell
wsl --mount \\.\PHYSICALDRIVE1 --partition 1
```

```bash
lsblk
ll /mnt/wsl/PHYSICALDRIVE1p1
```

## API Usage

### Predict Protein Function

**Endpoint:** `POST /pfam`

**Request Body:**

```json
{
  "sequence": "MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN"
}
```

**Response:**

```json
{
  "_id": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
  "sequence": "MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN",
  "createdAt": 1626456531000,
  "predictions": {
    "classes": [1, 1, 1, 4877, 4877, ...],
    "top_classes": [[1, 4085, 14772], [1, 14772, 4085], ...],
    "top_probs": [[0.999651432, 3.57837489e-5, 3.53951364e-5], ...]
  },
  "domainMap": {
    "1": {
      "pfamAcc": "NO_DOMAIN",
      "pfamId": "NO_DOMAIN",
      "pfamDesc": "No Domain",
      "clanAcc": "",
      "clanId": ""
    },
    "4877": {
      "pfamAcc": "PF00049",
      "pfamId": "Insulin",
      "pfamDesc": "Insulin/IGF/Relaxin family",
      "clanAcc": "CL0239",
      "clanId": "Insulin"
    },
    "4085": {
      "pfamAcc": "PF16981",
      "pfamId": "Chi-conotoxin",
      "pfamDesc": "chi-Conotoxin or t superfamily",
      "clanAcc": "CL0083",
      "clanId": "Omega_toxin"
    },
    "14772": {
      "pfamAcc": "PF05324",
      "pfamId": "Sperm_Ag_HE2",
      "pfamDesc": "Sperm antigen HE2",
      "clanAcc": "",
      "clanId": ""
    }
    // Additional domain entries...
  }
}
```

### Get Prediction by ID

**Endpoint:** `GET /pfam/:id`

**Response:** Same as above

### Get All Predictions

**Endpoint:** `GET /pfam`

**Response:**

```json
{
  "total": 1,
  "limit": 10,
  "skip": 0,
  "data": [
    {
      "_id": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      "sequence": "MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN",
      "createdAt": 1626456531000,
      "predictions": {
        "classes": [1, 1, 1, 4877, 4877, ...],
        "top_classes": [[1, 4085, 14772], [1, 14772, 4085], ...],
        "top_probs": [[0.999651432, 3.57837489e-5, 3.53951364e-5], ...]
      },
      "domainMap": {
        "1": { "pfamAcc": "NO_DOMAIN", "pfamId": "NO_DOMAIN", "pfamDesc": "No Domain", "clanAcc": "", "clanId": "" },
        "4877": { "pfamAcc": "PF00049", "pfamId": "Insulin", "pfamDesc": "Insulin/IGF/Relaxin family", "clanAcc": "CL0239", "clanId": "Insulin" }
        // Additional domain entries...
      }
    }
  ]
}
```

## Caching Functionality

The API implements efficient caching of protein function predictions:

1. When a protein sequence is submitted, a SHA-256 hash of the sequence is generated
2. This hash is used as the MongoDB document `_id`
3. Before calling the TensorFlow Serving API, the service checks if a prediction with this hash already exists
4. If found, the existing prediction is returned immediately without calling the TensorFlow Serving API
5. If not found, the TensorFlow Serving API is called, and the result is stored with the hash as its ID

This approach provides several benefits:

- Significantly faster responses for previously analyzed sequences
- Reduced load on the TensorFlow Serving API
- Consistent results for identical sequences
- Automatic deduplication of protein sequence data

## Domain Mapping

The API enriches prediction results with domain information:

1. For each class ID in the `top_classes` array, it retrieves the corresponding Pfam family information
2. The domain information is provided in the `domainMap` field of the response
3. Each entry includes:
   - `pfamAcc`: Pfam accession (e.g., "PF00049")
   - `pfamId`: Pfam ID (e.g., "Insulin")
   - `pfamDesc`: Description of the domain
   - `clanAcc`: Clan accession if available
   - `clanId`: Clan ID if available
4. The `domainMap` is only included in the API response and is not stored in the database

The domain mapping provides valuable context about protein function predictions, making it easier to interpret the results without needing to look up Pfam family information separately.

## Example Client

See `examples/pfam-client.js` for a simple example of how to use the API from a Node.js client. The example demonstrates both the initial API call and the cached response for repeated requests.

## Testing

Run the automated tests:

```bash
npm test
```

## License

MIT

## Expected v5

```json
{
  "_id": "a5fba210ef8110b168fa42fa75fc425ed4da1dfcf1fb1c228bddb69b985f417c",
  "sequence": "MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN",
  "createdAt": 1740881300407,
  "predictions": {
    "top_classes": [
      [1, 4085, 14772],
      [1, 14772, 4085],
      [1, 14772, 4085],
      [1, 14772, 4085],
      [1, 14772, 4085],
      [1, 14772, 4085],
      [1, 14772, 4085],
      [1, 14772, 4085],
      [1, 14772, 4085],
      [1, 14772, 4085],
      [1, 14772, 6021],
      [1, 14772, 4085],
      [1, 14772, 6021],
      [1, 14772, 6021],
      [1, 14772, 6021],
      [1, 14772, 6021],
      [1, 6021, 14772],
      [1, 14772, 3133],
      [1, 14772, 6021],
      [1, 14772, 3133],
      [1, 14772, 3133],
      [1, 14772, 3834],
      [1, 14772, 3834],
      [1, 14772, 11155],
      [1, 4877, 3834],
      [1, 4877, 3834],
      [1, 4877, 3834],
      [1, 4877, 3834],
      [1, 4877, 3834],
      [1, 4877, 3834],
      [4877, 1, 1262],
      [4877, 1, 1262],
      [4877, 1, 1262],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 5065],
      [4877, 1, 5065],
      [4877, 1, 5065],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 7604],
      [4877, 1, 2806],
      [4877, 1, 2806],
      [4877, 1, 2806],
      [4877, 1, 2806],
      [4877, 1, 2806],
      [4877, 1, 13811],
      [4877, 1, 2806],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [4877, 1, 13811],
      [1, 4877, 13811],
      [1, 4877, 13811],
      [1, 4877, 13811],
      [1, 4877, 13811],
      [1, 4877, 13811],
      [1, 4877, 1689],
      [1, 3834, 13223]
    ],
    "classes": [
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877,
      4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877,
      4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877,
      4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877,
      4877, 1, 1, 1, 1, 1, 1, 1
    ],
    "top_probs": [
      [0.999652386, 0.0000356784549, 0.0000353255964],
      [0.999199927, 0.000104689083, 0.000101340091],
      [0.999015927, 0.000164782294, 0.0000929347807],
      [0.998711228, 0.000222118324, 0.000147473431],
      [0.998654366, 0.000288304844, 0.000132819026],
      [0.998264492, 0.000373270916, 0.000204331649],
      [0.998114944, 0.000458062626, 0.000197700443],
      [0.998042703, 0.000521370792, 0.00021436128],
      [0.998077273, 0.00049062795, 0.000296495098],
      [0.998046398, 0.000589154311, 0.000238464971],
      [0.997713685, 0.000732578628, 0.000350975897],
      [0.997515798, 0.000940249651, 0.000238918743],
      [0.997918546, 0.000775893, 0.00029448478],
      [0.997750223, 0.000692101778, 0.00056582049],
      [0.997079253, 0.001163312, 0.00029512457],
      [0.997954726, 0.00068031135, 0.000389707653],
      [0.996983111, 0.000914820761, 0.000720785756],
      [0.996090591, 0.00131220953, 0.00043745013],
      [0.995531261, 0.00134976, 0.000530495192],
      [0.995341778, 0.00142824685, 0.00068057212],
      [0.99696821, 0.000829611614, 0.000282168825],
      [0.997666359, 0.000460536394, 0.000370416092],
      [0.997497618, 0.000431899971, 0.000395758078],
      [0.996225, 0.000672229042, 0.000371715898],
      [0.994834304, 0.00102847663, 0.000569332391],
      [0.990975916, 0.00379614928, 0.000889555],
      [0.980313599, 0.013945628, 0.00117011659],
      [0.942369521, 0.0510803796, 0.0011965856],
      [0.816244066, 0.177069426, 0.000729356136],
      [0.586904287, 0.407053471, 0.000811304315],
      [0.803937674, 0.192721054, 0.00058718049],
      [0.88690871, 0.110856876, 0.000334812212],
      [0.934036314, 0.0647847205, 0.00013381544],
      [0.941035628, 0.057873074, 0.000136696763],
      [0.960208595, 0.0391271263, 0.0000804959709],
      [0.953769505, 0.0453915782, 0.0000738301824],
      [0.972157359, 0.027218556, 0.0000765740624],
      [0.97596097, 0.0234066602, 0.0000776627057],
      [0.968429744, 0.0306925382, 0.0000794155421],
      [0.968030334, 0.0309947282, 0.0000842166846],
      [0.981394529, 0.0179217029, 0.0000587788272],
      [0.986348271, 0.0130728623, 0.0000585992],
      [0.98543328, 0.013889404, 0.0000777021196],
      [0.988490105, 0.0109428288, 0.0000834203893],
      [0.989730239, 0.00974305067, 0.0000984926082],
      [0.989791334, 0.00964110624, 0.000120404919],
      [0.991525, 0.0079426, 0.000125732331],
      [0.991149545, 0.0082388334, 0.000142534802],
      [0.991179287, 0.00817345176, 0.000160020631],
      [0.990734816, 0.00854036584, 0.000190017527],
      [0.991354406, 0.00797188841, 0.000163701261],
      [0.991618574, 0.00772419851, 0.000167906386],
      [0.992474139, 0.00693901395, 0.00015199928],
      [0.992628813, 0.00681565655, 0.000146229722],
      [0.992927492, 0.0065564625, 0.000133685127],
      [0.993231177, 0.00629031332, 0.000125081468],
      [0.993796468, 0.00576881925, 0.000112894239],
      [0.994203627, 0.00540542696, 0.0000978334429],
      [0.994204819, 0.00541558815, 0.0000907269859],
      [0.994505465, 0.00514398469, 0.0000823468],
      [0.994532704, 0.00514391949, 0.0000716819486],
      [0.994199038, 0.00546748145, 0.0000686671774],
      [0.994271398, 0.00540666096, 0.0000642599043],
      [0.994404197, 0.00529108616, 0.0000597524777],
      [0.994242966, 0.00545709627, 0.0000563704925],
      [0.994219661, 0.00547915185, 0.0000517781482],
      [0.994207, 0.00549632125, 0.0000487861362],
      [0.993888736, 0.0058087185, 0.0000470442465],
      [0.993565619, 0.00611128146, 0.0000544069808],
      [0.993108749, 0.00655355817, 0.0000569517142],
      [0.99269, 0.00693871, 0.0000708713123],
      [0.992786944, 0.00685192458, 0.0000661812373],
      [0.992835224, 0.00680352561, 0.0000634206081],
      [0.992171049, 0.00744113699, 0.000065115084],
      [0.99077493, 0.0087459, 0.0000883108805],
      [0.990283132, 0.00919856317, 0.000101944432],
      [0.989837766, 0.00962089188, 0.000110567053],
      [0.988955438, 0.0104364995, 0.000129874548],
      [0.988508284, 0.0108837895, 0.000131261157],
      [0.985786796, 0.0134223578, 0.000168179322],
      [0.984055221, 0.0149661042, 0.000230807113],
      [0.983527899, 0.0154554723, 0.000267302647],
      [0.982955694, 0.0160040613, 0.000292374141],
      [0.977015, 0.0215706266, 0.000420742406],
      [0.966712058, 0.0313154645, 0.000630996],
      [0.959094405, 0.0386735909, 0.000764413446],
      [0.947390139, 0.0501537509, 0.000867502647],
      [0.919061422, 0.0772981271, 0.00135626609],
      [0.86802578, 0.127136827, 0.00175983028],
      [0.800646603, 0.194145665, 0.0019187663],
      [0.639450252, 0.351986706, 0.00304362131],
      [0.550329, 0.436927468, 0.00432993],
      [0.680097, 0.307146549, 0.00394072291],
      [0.874085, 0.112778023, 0.00347869727],
      [0.928072691, 0.0612977371, 0.00243374286],
      [0.926581562, 0.0619967505, 0.00230825483],
      [0.985916436, 0.0042764158, 0.00408875709],
      [0.999850392, 0.000020866999, 0.00000900388932]
    ]
  },
  "domainMap": {
    "1": {
      "pfamAcc": "NO_DOMAIN",
      "pfamId": "NO_DOMAIN",
      "pfamDesc": "No Domain",
      "clanAcc": "",
      "clanId": ""
    },
    "1262": {
      "pfamAcc": "PF01607",
      "pfamId": "CBM_14",
      "pfamDesc": "Chitin binding Peritrophin-A domain",
      "clanAcc": "CL0155",
      "clanId": "CBM_14_19"
    },
    "1689": {
      "pfamAcc": "PF00014",
      "pfamId": "Kunitz_BPTI",
      "pfamDesc": "Kunitz/Bovine pancreatic trypsin inhibitor domain",
      "clanAcc": "",
      "clanId": ""
    },
    "2806": {
      "pfamAcc": "PF01822",
      "pfamId": "WSC",
      "pfamDesc": "WSC domain",
      "clanAcc": "",
      "clanId": ""
    },
    "3133": {
      "pfamAcc": "PF05305",
      "pfamId": "DUF732",
      "pfamDesc": "Protein of unknown function (DUF732)",
      "clanAcc": "",
      "clanId": ""
    },
    "3834": {
      "pfamAcc": "PF00050",
      "pfamId": "Kazal_1",
      "pfamDesc": "Kazal-type serine protease inhibitor domain",
      "clanAcc": "CL0005",
      "clanId": "Kazal"
    },
    "4085": {
      "pfamAcc": "PF16981",
      "pfamId": "Chi-conotoxin",
      "pfamDesc": "chi-Conotoxin or t superfamily",
      "clanAcc": "CL0083",
      "clanId": "Omega_toxin"
    },
    "4877": {
      "pfamAcc": "PF00049",
      "pfamId": "Insulin",
      "pfamDesc": "Insulin/IGF/Relaxin family",
      "clanAcc": "CL0239",
      "clanId": "Insulin"
    },
    "5065": {
      "pfamAcc": "PF00193",
      "pfamId": "Xlink",
      "pfamDesc": "Extracellular link domain",
      "clanAcc": "CL0056",
      "clanId": "C_Lectin"
    },
    "6021": {
      "pfamAcc": "PF13308",
      "pfamId": "YARHG",
      "pfamDesc": "YARHG domain",
      "clanAcc": "",
      "clanId": ""
    },
    "7604": {
      "pfamAcc": "PF09691",
      "pfamId": "T2SS_PulS_OutS",
      "pfamDesc": "Type II secretion system pilotin lipoprotein (PulS_OutS)",
      "clanAcc": "",
      "clanId": ""
    },
    "11155": {
      "pfamAcc": "PF00446",
      "pfamId": "GnRH",
      "pfamDesc": "Gonadotropin-releasing hormone",
      "clanAcc": "",
      "clanId": ""
    },
    "13223": {
      "pfamAcc": "PF02083",
      "pfamId": "Urotensin_II",
      "pfamDesc": "Urotensin II",
      "clanAcc": "",
      "clanId": ""
    },
    "13811": {
      "pfamAcc": "PF03488",
      "pfamId": "Ins_beta",
      "pfamDesc": "Nematode insulin-related peptide beta type",
      "clanAcc": "CL0239",
      "clanId": "Insulin"
    },
    "14772": {
      "pfamAcc": "PF05324",
      "pfamId": "Sperm_Ag_HE2",
      "pfamDesc": "Sperm antigen HE2",
      "clanAcc": "",
      "clanId": ""
    }
  }
}
```

## Expected v4

```json
{
  "_id": "5e2d489758c74821b5e1508c2e2b56e2",
  "seq": "MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN",
  "predictions": [
    {
      "top_classes": [
        [1, 4085, 14772],
        [1, 14772, 4085],
        [1, 14772, 4085],
        [1, 14772, 4085],
        [1, 14772, 4085],
        [1, 14772, 4085],
        [1, 14772, 4085],
        [1, 14772, 4085],
        [1, 14772, 4085],
        [1, 14772, 4085],
        [1, 14772, 6021],
        [1, 14772, 4085],
        [1, 14772, 6021],
        [1, 14772, 6021],
        [1, 14772, 6021],
        [1, 14772, 6021],
        [1, 6021, 14772],
        [1, 14772, 3133],
        [1, 14772, 6021],
        [1, 14772, 3133],
        [1, 14772, 3133],
        [1, 14772, 3834],
        [1, 14772, 3834],
        [1, 14772, 11155],
        [1, 4877, 3834],
        [1, 4877, 3834],
        [1, 4877, 3834],
        [1, 4877, 3834],
        [1, 4877, 3834],
        [1, 4877, 3834],
        [4877, 1, 1262],
        [4877, 1, 1262],
        [4877, 1, 1262],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 3834],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 5065],
        [4877, 1, 5065],
        [4877, 1, 5065],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 7604],
        [4877, 1, 2806],
        [4877, 1, 2806],
        [4877, 1, 2806],
        [4877, 1, 2806],
        [4877, 1, 2806],
        [4877, 1, 13811],
        [4877, 1, 2806],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [4877, 1, 13811],
        [1, 4877, 13811],
        [1, 4877, 13811],
        [1, 4877, 13811],
        [1, 4877, 13811],
        [1, 4877, 13811],
        [1, 4877, 1689],
        [1, 3834, 13223]
      ],
      "top_probs": [
        [0.999652386, 0.0000356852579, 0.0000353277537],
        [0.999199808, 0.000104698149, 0.000101355348],
        [0.99901557, 0.000164791971, 0.0000929546],
        [0.998711109, 0.000222139046, 0.000147500279],
        [0.998654127, 0.000288347161, 0.00013284749],
        [0.998264134, 0.00037335197, 0.000204366472],
        [0.998114705, 0.000458148133, 0.000197741698],
        [0.998042345, 0.000521494, 0.000214408225],
        [0.998076797, 0.000490739127, 0.000296558603],
        [0.99804616, 0.000589268806, 0.000238533161],
        [0.997713327, 0.000732729328, 0.000351052091],
        [0.997515202, 0.0009405163, 0.000238985813],
        [0.997918069, 0.000776095316, 0.000294578145],
        [0.997749627, 0.00069224264, 0.000565965893],
        [0.997079134, 0.00116335857, 0.000295160891],
        [0.997954726, 0.000680272409, 0.000389751891],
        [0.996983111, 0.000914827629, 0.000720829761],
        [0.996089935, 0.00131240394, 0.00043747024],
        [0.995530665, 0.00134999352, 0.000530500954],
        [0.995341659, 0.001428421, 0.000680508441],
        [0.996967733, 0.000829796365, 0.000282237597],
        [0.997666121, 0.00046066806, 0.00037032523],
        [0.997497, 0.000432049652, 0.000395754061],
        [0.996223927, 0.000672464201, 0.000371733215],
        [0.994832754, 0.00102878513, 0.000569574768],
        [0.990973532, 0.00379714672, 0.000890013704],
        [0.980309665, 0.0139485514, 0.00117035292],
        [0.942359567, 0.0510896817, 0.00119679212],
        [0.816222847, 0.177090168, 0.000729454739],
        [0.586814404, 0.407143325, 0.000811421371],
        [0.803944707, 0.192713901, 0.000587144168],
        [0.886912823, 0.110852741, 0.000334777375],
        [0.934041262, 0.0647798702, 0.00013379853],
        [0.941038251, 0.0578701496, 0.000136694274],
        [0.960209131, 0.0391264036, 0.0000804931769],
        [0.953774631, 0.045386456, 0.0000738515664],
        [0.972162, 0.0272139106, 0.0000765668301],
        [0.975966275, 0.0234014317, 0.000077651719],
        [0.968434393, 0.0306880604, 0.0000794082],
        [0.968035758, 0.0309894662, 0.0000842066365],
        [0.981398404, 0.01791781, 0.0000587716604],
        [0.986350477, 0.0130707724, 0.0000586016722],
        [0.985435665, 0.013886895, 0.0000777096429],
        [0.98849237, 0.0109408498, 0.0000834254315],
        [0.989732683, 0.0097409, 0.000098494922],
        [0.98979342, 0.00963903, 0.000120410681],
        [0.991526425, 0.007941355, 0.000125741266],
        [0.991151035, 0.00823733769, 0.000142549703],
        [0.991180718, 0.0081720138, 0.000160018695],
        [0.990736306, 0.00853884872, 0.00019002326],
        [0.991355836, 0.00797059294, 0.00016370244],
        [0.991619825, 0.00772301527, 0.000167914608],
        [0.992475212, 0.00693792291, 0.000152006702],
        [0.992630124, 0.00681439182, 0.000146232982],
        [0.992928565, 0.00655529369, 0.00013368731],
        [0.99323225, 0.0062892884, 0.000125086852],
        [0.993797481, 0.00576781295, 0.000112896734],
        [0.9942047, 0.00540435035, 0.0000978333555],
        [0.994205773, 0.00541455, 0.0000907246504],
        [0.994506657, 0.00514292158, 0.0000823443916],
        [0.994533777, 0.00514288479, 0.0000716808572],
        [0.99420023, 0.00546642486, 0.0000686656786],
        [0.99427247, 0.00540569844, 0.0000642584419],
        [0.99440515, 0.00529011246, 0.000059750877],
        [0.994243801, 0.00545624783, 0.0000563706453],
        [0.994220734, 0.00547809247, 0.0000517768203],
        [0.994208217, 0.00549514359, 0.0000487839607],
        [0.993889928, 0.00580759533, 0.000047042824],
        [0.99356693, 0.00611000741, 0.0000543947535],
        [0.993109941, 0.00655234093, 0.0000569401],
        [0.992691338, 0.0069374349, 0.0000708545122],
        [0.992788, 0.00685082097, 0.0000661659142],
        [0.992836297, 0.00680235215, 0.0000634062817],
        [0.99217248, 0.00743989926, 0.0000651079754],
        [0.990776479, 0.00874436274, 0.0000882852473],
        [0.99028486, 0.00919686, 0.000101932164],
        [0.989839315, 0.00961942, 0.000110555207],
        [0.988957584, 0.0104344115, 0.000129857479],
        [0.988510489, 0.0108816754, 0.000131244407],
        [0.985789359, 0.0134199094, 0.000168157931],
        [0.984058321, 0.0149628986, 0.000230778809],
        [0.983531058, 0.0154524855, 0.000267275958],
        [0.982958615, 0.0160012711, 0.000292348821],
        [0.977018654, 0.0215670876, 0.000420719909],
        [0.966717839, 0.0313097388, 0.00063094811],
        [0.959100425, 0.0386675633, 0.000764370197],
        [0.9474, 0.0501441322, 0.000867466966],
        [0.919074118, 0.0772853419, 0.00135622767],
        [0.868044436, 0.12711823, 0.0017597574],
        [0.800677299, 0.194115341, 0.00191863149],
        [0.639502764, 0.351934403, 0.00304352585],
        [0.550257266, 0.436998874, 0.00433004322],
        [0.680032909, 0.307209611, 0.00394102046],
        [0.874046504, 0.112814575, 0.00347928074],
        [0.928054035, 0.061314743, 0.00243411143],
        [0.926555097, 0.0620202906, 0.0023087787],
        [0.985912621, 0.0042780959, 0.0040890458],
        [0.999850392, 0.0000208740839, 0.0000090066369]
      ],
      "classes": [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877,
        4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877,
        4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877,
        4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877, 4877,
        4877, 1, 1, 1, 1, 1, 1, 1
      ]
    }
  ],
  "domainMap": {
    "1": {
      "pfamAcc": "NO_DOMAIN",
      "pfamId": "NO_DOMAIN",
      "pfamDesc": "No Domain",
      "clanAcc": "",
      "clanId": ""
    },
    "1262": {
      "pfamAcc": "PF01607",
      "pfamId": "CBM_14",
      "pfamDesc": "Chitin binding Peritrophin-A domain",
      "clanAcc": "CL0155",
      "clanId": "CBM_14_19"
    },
    "1689": {
      "pfamAcc": "PF00014",
      "pfamId": "Kunitz_BPTI",
      "pfamDesc": "Kunitz/Bovine pancreatic trypsin inhibitor domain",
      "clanAcc": "",
      "clanId": ""
    },
    "2806": {
      "pfamAcc": "PF01822",
      "pfamId": "WSC",
      "pfamDesc": "WSC domain",
      "clanAcc": "",
      "clanId": ""
    },
    "3133": {
      "pfamAcc": "PF05305",
      "pfamId": "DUF732",
      "pfamDesc": "Protein of unknown function (DUF732)",
      "clanAcc": "",
      "clanId": ""
    },
    "3834": {
      "pfamAcc": "PF00050",
      "pfamId": "Kazal_1",
      "pfamDesc": "Kazal-type serine protease inhibitor domain",
      "clanAcc": "CL0005",
      "clanId": "Kazal"
    },
    "4085": {
      "pfamAcc": "PF16981",
      "pfamId": "Chi-conotoxin",
      "pfamDesc": "chi-Conotoxin or t superfamily",
      "clanAcc": "CL0083",
      "clanId": "Omega_toxin"
    },
    "4877": {
      "pfamAcc": "PF00049",
      "pfamId": "Insulin",
      "pfamDesc": "Insulin/IGF/Relaxin family",
      "clanAcc": "CL0239",
      "clanId": "Insulin"
    },
    "5065": {
      "pfamAcc": "PF00193",
      "pfamId": "Xlink",
      "pfamDesc": "Extracellular link domain",
      "clanAcc": "CL0056",
      "clanId": "C_Lectin"
    },
    "6021": {
      "pfamAcc": "PF13308",
      "pfamId": "YARHG",
      "pfamDesc": "YARHG domain",
      "clanAcc": "",
      "clanId": ""
    },
    "7604": {
      "pfamAcc": "PF09691",
      "pfamId": "T2SS_PulS_OutS",
      "pfamDesc": "Type II secretion system pilotin lipoprotein (PulS_OutS)",
      "clanAcc": "",
      "clanId": ""
    },
    "11155": {
      "pfamAcc": "PF00446",
      "pfamId": "GnRH",
      "pfamDesc": "Gonadotropin-releasing hormone",
      "clanAcc": "",
      "clanId": ""
    },
    "13223": {
      "pfamAcc": "PF02083",
      "pfamId": "Urotensin_II",
      "pfamDesc": "Urotensin II",
      "clanAcc": "",
      "clanId": ""
    },
    "13811": {
      "pfamAcc": "PF03488",
      "pfamId": "Ins_beta",
      "pfamDesc": "Nematode insulin-related peptide beta type",
      "clanAcc": "CL0239",
      "clanId": "Insulin"
    },
    "14772": {
      "pfamAcc": "PF05324",
      "pfamId": "Sperm_Ag_HE2",
      "pfamDesc": "Sperm antigen HE2",
      "clanAcc": "",
      "clanId": ""
    }
  }
}
```
