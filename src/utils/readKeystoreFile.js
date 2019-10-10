export const ERROR_FAILED_READING_FILE = 'failed_reading_file';
export const ERROR_INVALID_KEYSTORE = 'invalid_keystore';

export function readKeystoreFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onloadend = onLoadEnd;
    fileReader.readAsText(file);

    function onLoadEnd(_event) {
      if (fileReader.error) reject(ERROR_FAILED_READING_FILE);

      try {
        const keystore = JSON.parse(fileReader.result);
        if (!validate(keystore)) throw void 0;
        resolve(keystore);
      } catch (_error) {
        reject(ERROR_INVALID_KEYSTORE);
      }
    }
  });
}

function validate(keystore) {
  return keystore.version && keystore.id && keystore.address;
}
