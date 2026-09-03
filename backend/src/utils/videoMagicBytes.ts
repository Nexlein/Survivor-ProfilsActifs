import fs from 'fs';

// The multer fileFilter in middlewares/upload.ts only checks the
// client-declared Content-Type of the multipart part, which a caller fully
// controls and can set to anything regardless of the actual file content
// (e.g. a plain text file sent as `type=video/mp4` passes that check). This
// reads the real first bytes written to disk and checks them against the
// known container signatures for the video types the platform claims to
// accept, so a mislabeled file is rejected on its content, not its declared
// type or extension.
export function isValidVideoFile(filePath: string): boolean {
    const fd = fs.openSync(filePath, 'r');
    try {
        const header = Buffer.alloc(12);
        const bytesRead = fs.readSync(fd, header, 0, 12, 0);
        if (bytesRead < 12) return false;

        // MP4 / MOV (ISO Base Media File Format): a 4-byte size field
        // followed by the ASCII box type "ftyp" at byte offset 4.
        if (header.toString('ascii', 4, 8) === 'ftyp') return true;

        // AVI (RIFF container): "RIFF" at offset 0, "AVI " at offset 8.
        if (header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'AVI ') return true;

        return false;
    } finally {
        fs.closeSync(fd);
    }
}
