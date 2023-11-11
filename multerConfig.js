const multer = require('multer');
const { google } = require('googleapis');
const videoFolder = '13GpXRx0KOVynwvcU4RdFm35fnyYt4MrL'; 
const imgFolder = '1ldv5248POuRX4O39RF7snLksx8Uj7snh';



const client = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Reemplaza los \\n por saltos de línea reales
  ['https://www.googleapis.com/auth/drive']
);

const drive = google.drive({ version: 'v3', auth: client });


// Multer config para almacenar archivos en memoria
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    if (file.mimetype === 'video/mp4' || file.mimetype === 'video/webm') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  } else {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Función para subir a Google Drive
const uploadToDrive = (file, folderId) => {
  const fileMetadata = {
    name: Date.now() + '-' + file.originalname,
    parents: folderId ? [folderId] : [] // Si quieres subirlo a una carpeta específica, de lo contrario será en la raíz
  };
  const media = {
    mimeType: file.mimetype,
    body: Buffer.from(file.buffer) // convierte el buffer en un stream
  };

  return drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id'
  });
};

// Ejemplo de cómo usarlo en una ruta de Express
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  // Aquí puedes definir el ID de la carpeta basado en el tipo de archivo que estás subiendo
  const folderId = req.file.fieldname === 'video' ? 'tu_folder_id_de_videos' : 'tu_folder_id_de_imágenes';

  uploadToDrive(req.file, folderId)
    .then((driveResponse) => {
      res.send(`File uploaded to Google Drive with ID: ${driveResponse.data.id}`);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error uploading to Google Drive');
    });
});

module.exports = {
  upload,
};


