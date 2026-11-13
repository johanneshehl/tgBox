# TgBox

TgBox is a small Node.js library that uses Telegram as a backend for storing
files and sending messages.

## Installation

```bash
npm install tgbox
```

## Telegram API credentials

You need a Telegram `apiId` and `apiHash` to connect. You can get both values
from [my.telegram.org](https://my.telegram.org).

```js
const TgBox = require('tgbox');

const storage = new TgBox(
  process.env.TELEGRAM_API_ID,
  process.env.TELEGRAM_API_HASH,
);

await storage.init();
```

On the first start, TgBox asks for your phone number, login code, and, if
configured, your 2FA password. The session is then stored locally in
`session.txt`. Never publish or share this file.

## Upload files

```js
const result = await storage.upload('./documents/report.pdf', '@mychannel');

if (result.success) {
  console.log(result.messageId);
  console.log(result.fileName);
} else {
  console.error(result.error);
}
```

The default chat is `me` (Saved Messages). Telegram file sizes are returned in
`size` as bytes.

## List files

```js
const result = await storage.listFiles('@mychannel');

if (result.success) {
  result.files.forEach((file) => {
    console.log(file.messageId, file.fileName, file.size, file.mimeType);
  });
}
```

Each file object contains, among other fields:

- `messageId`
- `fileName`
- `size` in bytes
- `mimeType`
- `date`
- `caption`
- `telegram` with the complete Telegram message and document data

## Search files

The search checks the file name, caption, and message ID:

```js
const result = await storage.searchFiles('report', '@mychannel');

result.files.forEach((file) => {
  console.log(file);
});
```

For an exact search by ID or file name:

```js
const result = await storage.findFile('report.pdf', '@mychannel');

result.files.forEach((file) => {
  console.log(file.messageId, file.fileName);
});
```

All files with the same name are returned.

## Download files

```js
const result = await storage.download(
  123,
  './downloads/report.pdf',
  '@mychannel',
);

if (!result.success) {
  console.error(result.error);
}
```

## Delete files

You can delete one or more files by their Telegram message IDs:

```js
await storage.deleteFile(123, '@mychannel');
await storage.deleteFile([123, 124], '@mychannel');
```

Deletion is permanent and uses `revoke: true`. Your Telegram account needs the
required permissions in the target chat or channel.

## Send messages

```js
const result = await storage.writeMessage(
  'Backup completed successfully.',
  '@mychannel',
);

console.log(result.messageId);
```

## Error handling

File operations return a result object:

```js
{
  success: true,
  files: []
}
```

If an operation fails, `success` is set to `false` and the error message is
available in `error`.

## Security

Never commit your API hash, API ID, or `session.txt` to Git or publish them in
an npm package. Use environment variables and add local files to `.gitignore`.

## License

MIT
