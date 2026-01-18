export function getApiBaseUrl() {
    const { protocol, hostname } = window.location;

    // localhost
    if (hostname === 'localhost') {
        return `${protocol}//localhost/rekrutment-filemanager`;
    }

    // LAN IP (192.168.x.x)
    if (hostname.startsWith('192.168.')) {
        return `${protocol}//${hostname}/rekrutment-filemanager`;
    }

    // selain itu (production)
    return 'https://sasea.demo.api';
}
