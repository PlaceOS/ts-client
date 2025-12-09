import { PlaceResourceQueryOptions } from '../resources/interface';

/** Mapping of available query parameters for the short_url index endpoint */
export interface PlaceShortUrlQueryOptions extends PlaceResourceQueryOptions {}

/** Format options for QR code generation */
export type QrCodeFormat = 'svg' | 'png';

/** Options for generating a QR code with custom content */
export interface PlaceQrCodeOptions {
    /** The contents of the QR code (required) */
    content: string;
    /** Identifier for the QR code (required) */
    id: string;
    /** File format of the response */
    format?: QrCodeFormat;
    /** Size of the QR code in pixels (between 72px and 512px) */
    size?: number;
}

/** Options for generating a PNG QR code for a short URL */
export interface PlaceShortUrlPngQrOptions {
    /** Size of the QR code in pixels (between 72px and 512px) */
    size?: number;
}
