const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');
const fs = require('fs');
const FileService = require('./fileService');

class TgBox {
  constructor(apiId, apiHash, sessionFilePath = 'session.txt') {
    if (!apiId || !apiHash) {
      throw new Error('TgBox requires apiId and apiHash.');
    }
    this.apiId = Number(apiId);
    this.apiHash = apiHash;
    this.sessionFilePath = sessionFilePath;
    this.fileService = null;

    let savedSession = '';
    if (fs.existsSync(this.sessionFilePath)) {
      savedSession = fs.readFileSync(this.sessionFilePath, 'utf8').trim();
    }

    this.stringSession = new StringSession(savedSession);
  }

  async init() {
    this.client = new TelegramClient(this.stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
    });
    this.fileService = new FileService(this.client);

    await this.client.start({
      phoneNumber: async () => await input.text('[INFO] Type your phonenumber in: '),
      password: async () => await input.text('[INFO] 2FA Code: '),
      phoneCode: async () => await input.text('[INFO] Telegram code: '),
      onError: (err) => console.log("[ERROR] " + err),
    });

    console.log('[INFO] Successfully logged in!');


    const currentSession = this.client.session.save();
    fs.writeFileSync(this.sessionFilePath, currentSession);
  }
  async upload(filePath, targetChat = 'me') {
    return this.fileService.upload(filePath, targetChat);
  }
  
  async download(messageId, outputPath, targetChat = 'me') {
    return this.fileService.download(messageId, outputPath, targetChat);
  }

  async deleteFile(messageId, targetChat = 'me') {
    return this.fileService.deleteFile(messageId, targetChat);
  }

  async listFiles(targetChat = 'me') {
    return this.fileService.listFiles(targetChat);
  }

  async searchFiles(query, targetChat = 'me') {
    return this.fileService.searchFiles(query, targetChat);
  }

  async findFile(identifier, targetChat = 'me') {
    return this.fileService.findFile(identifier, targetChat);
  }
}

module.exports = TgBox;