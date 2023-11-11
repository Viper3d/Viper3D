const multer = require('multer');
const { google } = require('googleapis');

// Configuración de Google Drive
const client = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/drive']
);

const drive = google.drive({ version: 'v3', auth: client });

// ID de la carpeta de videos en Drive
const videoFolder = '13GpXRx0KOVynwvcU4RdFm35fnyYt4MrL';
// ID de la carpeta de imágenes en Drive
const imgFolder = '1ldv5248POuRX4O39RF7snLksx8Uj7snh';

// Función para subir archivos a Google Drive
const uploadToDrive = async (file, folderId) => {
  const fileMetadata = {
    name: file.originalname,
    parents: [folderId],
  };
  const media = {
    mimeType: file.mimetype,
    body: Buffer.from(file.buffer),
  };
  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });
  return response.data.id;
};

// Función para crear y subir un archivo txt a Google Drive
async function uploadTextToDrive(text, folderId) {
  const textBuffer = Buffer.from(text, 'utf-8');
  const file = {
    originalname: 'test.txt',
    mimetype: 'text/plain',
    buffer: textBuffer,
  };
  
  try {
    const fileId = await uploadToDrive(file, folderId);
    console.log('Archivo txt subido con éxito, ID:', fileId);
    return fileId;
  } catch (error) {
    console.error('Error al subir archivo txt a Google Drive:', error);
    throw error;
  }
}

// Configuración de Multer para almacenar archivos en memoria
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });

// Verificar la conexión con Google Drive
async function verifyDriveConnection() {
  try {
    await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name)',
    });
    console.log("Conexión exitosa con Google Drive");
  } catch (error) {
    console.error("Error al conectar con Google Drive:", error);
  }
}

// Llamar a las funciones
verifyDriveConnection();
uploadTextToDrive('funciona', imgFolder)
  .then((fileId) => {
    // Haz algo con el fileId si es necesario
  })
  .catch((error) => {
    // Manejo de errores
  });

module.exports = {
  upload,
  uploadToDrive,
  videoFolder,
  imgFolder,
  drive
};
