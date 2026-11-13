# TgBox

TgBox ist eine kleine Node.js-Bibliothek, die Telegram als Speicher-Backend
für Dateien und Nachrichten verwendet.

## Installation

```bash
npm install tgbox
```

## Telegram API-Zugang

Für die Verbindung werden eine Telegram `apiId` und ein `apiHash` benötigt.
Beide Werte erhältst du unter [my.telegram.org](https://my.telegram.org).

```js
const TgBox = require('tgbox');

const storage = new TgBox(
  process.env.TELEGRAM_API_ID,
  process.env.TELEGRAM_API_HASH,
);

await storage.init();
```

Beim ersten Start werden Telefonnummer, Login-Code und gegebenenfalls das
2FA-Passwort abgefragt. Die Session wird anschließend lokal in `session.txt`
gespeichert. Diese Datei darf niemals veröffentlicht oder geteilt werden.

## Dateien hochladen

```js
const result = await storage.upload('./documents/report.pdf', '@meinchannel');

if (result.success) {
  console.log(result.messageId);
  console.log(result.fileName);
} else {
  console.error(result.error);
}
```

Der Standard-Chat ist `me` (gespeicherte Nachrichten). Telegram-Dateigrößen
werden in `size` als Bytes zurückgegeben.

## Dateien auflisten

```js
const result = await storage.listFiles('@meinchannel');

if (result.success) {
  result.files.forEach((file) => {
    console.log(file.messageId, file.fileName, file.size, file.mimeType);
  });
}
```

Jedes Dateiobjekt enthält unter anderem:

- `messageId`
- `fileName`
- `size` in Bytes
- `mimeType`
- `date`
- `caption`
- `telegram` mit den vollständigen Telegram-Daten der Nachricht und des Dokuments

## Dateien suchen

Die Suche berücksichtigt Dateiname, Caption und Message-ID:

```js
const result = await storage.searchFiles('report', '@meinchannel');

result.files.forEach((file) => {
  console.log(file);
});
```

Für eine exakte Suche nach ID oder Dateiname:

```js
const result = await storage.findFile('report.pdf', '@meinchannel');

result.files.forEach((file) => {
  console.log(file.messageId, file.fileName);
});
```

Mehrere Dateien mit demselben Namen werden vollständig zurückgegeben.

## Dateien herunterladen

```js
const result = await storage.download(
  123,
  './downloads/report.pdf',
  '@meinchannel',
);

if (!result.success) {
  console.error(result.error);
}
```

## Dateien löschen

Eine oder mehrere Dateien können über ihre Telegram-Message-ID gelöscht
werden:

```js
await storage.deleteFile(123, '@meinchannel');
await storage.deleteFile([123, 124], '@meinchannel');
```

Das Löschen erfolgt dauerhaft mit `revoke: true`. Dafür werden im Channel oder
Chat die entsprechenden Telegram-Berechtigungen benötigt.

## Nachrichten schreiben

```js
const result = await storage.writeMessage(
  'Backup erfolgreich abgeschlossen.',
  '@meinchannel',
);

console.log(result.messageId);
```

## Fehlerbehandlung

Die Dateioperationen geben ein Ergebnisobjekt zurück:

```js
{
  success: true,
  files: []
}
```

Bei Fehlern ist `success` auf `false` gesetzt und die Meldung steht in
`error`.

## Sicherheit

API-Hash, API-ID und `session.txt` gehören nicht in Git oder in ein
veröffentlichtes npm-Paket. Verwende Umgebungsvariablen und trage lokale
Dateien in `.gitignore` ein.

## Lizenz

MIT
