import { JSONStream } from "@pipeline/parse/JSONStream";
import { progress } from "@pipeline/Progress";
import { AttachmentType } from "@pipeline/Types";

// interface for file to be parsed
export interface FileInput {
    name: string;
    size: number;
    slice(start?: number, end?: number): Promise<ArrayBuffer>;
}

export const streamJSONFromFile = async function* (stream: JSONStream, file: FileInput): AsyncGenerator<void> {
    const CHUNK_SIZE = 1024 * 1024 * (2 * 2); // 4MB
    const textDecoder = new TextDecoder("utf-8");
    const fileSize = file.size;

    let receivedLength = 0;
    while (receivedLength < fileSize) {
        const buffer = await file.slice(receivedLength, receivedLength + CHUNK_SIZE);
        const str = textDecoder.decode(buffer, { stream: true });
        receivedLength += buffer.byteLength;
        stream.push(str);
        progress.progress("bytes", receivedLength, fileSize);
        yield;
    }
};

export const downloadTextFile = async (filepath: string): Promise<string> => {
    // TODO: progress
    const req = await fetch(filepath);
    const text = await req.text();
    return text;
};

export const downloadBinaryFile = async (filepath: string): Promise<Uint8Array> => {
    // TODO: progress
    const req = await fetch(filepath);
    const bytes = await req.arrayBuffer();
    return new Uint8Array(bytes);
};

export const getAttachmentTypeFromFileName = (filename: string): AttachmentType => {
    const ext = (filename.split(".").pop() || "").toLocaleLowerCase();
    const mappings: {
        [key in AttachmentType]?: string[];
    } = {
        [AttachmentType.Image]: ["png", "jpg", "jpeg", "webp", "bmp", "tiff", "tif", "svg", "ico", "psd"],
        [AttachmentType.ImageAnimated]: ["gif", "gifv", "apng"],
        [AttachmentType.Video]: ["mp4", "webm", "mkv", "flv", "mov", "avi", "wmv", "mpg", "mpeg", "avi"],
        [AttachmentType.Audio]: ["mp3", "ogg", "wav", "flac", "m4a"],
        [AttachmentType.Document]: ["doc", "docx", "odt", "pdf", "xls", "xlsx", "ods", "ppt", "pptx", "txt", "html"],
    };
    for (let type: AttachmentType = 0; type < AttachmentType.Last; type++) {
        if (mappings[type]?.includes(ext)) {
            return type;
        }
    }
    // unknown or generic
    return AttachmentType.Other;
};

export const getAttachmentTypeFromMimeType = (mimeType: string): AttachmentType => {
    mimeType = mimeType.toLocaleLowerCase();

    if (mimeType.startsWith("image/gif")) return AttachmentType.ImageAnimated;
    if (mimeType.startsWith("image/")) return AttachmentType.Image;
    if (mimeType.startsWith("video/")) return AttachmentType.Video;
    if (mimeType.startsWith("audio/")) return AttachmentType.Audio;

    const docMimeTypes = [
        "application/pdf",
        "application/epub",
        "application/epub+zip",
        "text/html",
        "application/rtf",
        "application/msword",
        "application/vnd.oasis.opendocument.spreadsheet",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
    ];
    if (docMimeTypes.includes(mimeType)) return AttachmentType.Document;

    console.log(`Unknown mime type: ${mimeType}`);

    // unknown or generic
    return AttachmentType.Other;
};
