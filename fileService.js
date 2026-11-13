const fs = require('fs');

class FileService {
  constructor(client) {
    this.client = client;
  }

  async upload(filePath, targetChat = 'me') {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
      }

      const result = await this.client.sendFile(targetChat, {
        file: filePath,
        workers: 2,
      });

      return {
        success: true,
        messageId: result.id,
        fileName: filePath.split(/[\\/]/).pop(),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async download(messageId, outputPath, targetChat = 'me') {
    try {
      const messages = await this.client.getMessages(targetChat, {
        ids: [messageId],
      });

      if (!messages || messages.length === 0) {
        throw new Error('Message not found.');
      }

      await this.client.downloadMedia(messages[0], {
        outputFile: outputPath,
      });

      return { success: true, path: outputPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteFile(messageId, targetChat = 'me') {
    const messageIds = Array.isArray(messageId) ? messageId : [messageId];
    if (
      messageIds.length === 0 ||
      messageIds.some((id) => !Number.isInteger(Number(id)) || Number(id) <= 0)
    ) {
      return { success: false, error: 'A valid file message ID is required.' };
    }

    try {
      await this.client.deleteMessages(
        targetChat,
        messageIds.map(Number),
        { revoke: true },
      );

      return { success: true, messageIds: messageIds.map(Number) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listFiles(targetChat = 'me') {
    try {
      const files = [];

      for await (const message of this.client.iterMessages(targetChat, {
        limit: 0,
      })) {
        if (!message.document) {
          continue;
        }

        const fileNameAttribute = message.document.attributes.find(
          (attribute) => attribute.className === 'DocumentAttributeFilename',
        );

        files.push({
          messageId: message.id,
          fileName: fileNameAttribute ? fileNameAttribute.fileName : null,
          size: Number(message.document.size),
          mimeType: message.document.mimeType,
          date: message.date,
          caption: message.message || null,
          telegram: {
            message: message.toJSON(),
            document: message.document.toJSON(),
          },
        });
      }

      return { success: true, files };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async searchFiles(query, targetChat = 'me') {
    if (typeof query !== 'string' || query.trim() === '') {
      return { success: false, error: 'Search query must not be empty.' };
    }

    const result = await this.listFiles(targetChat);
    if (!result.success) {
      return result;
    }

    const normalizedQuery = query.trim().toLowerCase();
    const files = result.files.filter((file) => {
      const fileName = file.fileName || '';
      const caption = file.caption || '';
      const messageId = String(file.messageId);
      return (
        messageId === normalizedQuery ||
        `${fileName} ${caption}`.toLowerCase().includes(normalizedQuery)
      );
    });

    return { success: true, files };
  }

  async findFile(identifier, targetChat = 'me') {
    if (typeof identifier !== 'string' && typeof identifier !== 'number') {
      return { success: false, error: 'File ID or name is required.' };
    }

    const query = String(identifier).trim();
    if (!query) {
      return { success: false, error: 'File ID or name must not be empty.' };
    }

    const result = await this.listFiles(targetChat);
    if (!result.success) {
      return result;
    }

    const files = result.files.filter(
      (item) =>
        String(item.messageId) === query ||
        (item.fileName && item.fileName.toLowerCase() === query.toLowerCase()),
    );

    return { success: true, files };
  }
}

module.exports = FileService;
