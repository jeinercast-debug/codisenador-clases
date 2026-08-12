import officeparser from 'officeparser';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.pptx', '.docx', '.ppt', '.doc'];

function getExtension(filename) {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot).toLowerCase() : '';
}

export async function extractTextFromBuffer(buffer, filename) {
  if (buffer.length > MAX_FILE_SIZE) {
    throw Object.assign(new Error(`El archivo supera el límite de ${MAX_FILE_SIZE / 1024 / 1024} MB.`), { status: 400 });
  }

  const ext = getExtension(filename);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw Object.assign(
      new Error(`Formato no soportado (${ext}). Usá .pptx, .docx o .pdf.`),
      { status: 400 }
    );
  }

  const raw = await officeparser.parseOffice(buffer);
  const text = typeof raw === 'string' ? raw : String(raw ?? '');
  if (!text.trim()) {
    throw Object.assign(new Error('No se pudo extraer texto del archivo. Verificá que no esté vacío.'), { status: 422 });
  }
  return text.trim();
}

export { ALLOWED_EXTENSIONS, MAX_FILE_SIZE };
