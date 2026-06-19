export function getApiBaseUrl() {
    const { protocol, hostname } = window.location;

    // localhost
    if (hostname === 'localhost') {
        return `${protocol}//localhost/hongkongrekrutment-filemanager`;
    }

    // LAN IP (192.168.x.x)
    if (hostname.startsWith('192.168.')) {
        return `${protocol}//${hostname}/hongkongrekrutment-filemanager`;
    }

    // selain itu ambil dari .env
    return process.env.VITE_API_URL;
}

export function buildDocumentUrl(filePath: string) {
    const normalizedPath = filePath.split('/').filter(Boolean);
    const encodedPath = normalizedPath.map((part) => encodeURIComponent(part)).join('/');

    return `${getApiBaseUrl()}/document/${encodedPath}`;
}
