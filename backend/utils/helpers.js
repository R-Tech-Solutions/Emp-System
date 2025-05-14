function bufferToBase64(buffer) {
  if (!buffer) {
    throw new Error('Invalid buffer provided for Base64 conversion');
  }
  return buffer.toString('base64');
}

module.exports = {
  bufferToBase64,
};