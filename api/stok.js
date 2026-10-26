const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/17qApH3_XO1Mx3sn1N1uqXz-mBu4KT5SqDzyIXJ3HZvQ/export?format=csv&gid=1103841187';

function parseCsv(csv) {
    const rows = [];
    let row = [];
    let field = '';
    let quoted = false;

    for (let index = 0; index < csv.length; index++) {
        const char = csv[index];

        if (quoted) {
            if (char === '"' && csv[index + 1] === '"') {
                field += '"';
                index++;
            } else if (char === '"') {
                quoted = false;
            } else {
                field += char;
            }
        } else if (char === '"') {
            quoted = true;
        } else if (char === ',') {
            row.push(field);
            field = '';
        } else if (char === '\n' || char === '\r') {
            if (char === '\r' && csv[index + 1] === '\n') index++;
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
        } else {
            field += char;
        }
    }

    if (field !== '' || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    return rows;
}

module.exports = async function handler(request, response) {
    if (request.method !== 'GET') {
        response.setHeader('Allow', 'GET');
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        const sheetResponse = await fetch(SHEET_CSV_URL, { signal: controller.signal });
        if (!sheetResponse.ok) {
            throw new Error(`Google Sheets returned HTTP ${sheetResponse.status}`);
        }

        const csv = (await sheetResponse.text()).replace(/^\uFEFF/, '');
        const rows = parseCsv(csv);
        let tanggalUpdate = 'As of 20 Sep 2026';
        const items = [];

        for (const [index, row] of rows.entries()) {
            if (index === 0 && row[0]) tanggalUpdate = row[0];
            if (index < 4) continue;

            const kode = (row[1] || '').trim();
            if (!kode || kode === 'Item No.') continue;

            const deskripsi = (row[3] || '').trim();
            const kuantitasRaw = (row[5] || '0').trim();
            const kuantitas = Number.isFinite(Number(kuantitasRaw))
                ? Math.trunc(Number(kuantitasRaw))
                : 0;
            const hargaJualRaw = (row[11] || '0').trim();
            const normalizedPrice = hargaJualRaw.replace(/[.,]/g, '');
            const hargaJual = normalizedPrice !== '' && Number.isFinite(Number(normalizedPrice))
                ? `Rp ${new Intl.NumberFormat('id-ID').format(Number(normalizedPrice))}`
                : hargaJualRaw;

            items.push({
                no: items.length + 1,
                kode,
                deskripsi,
                kuantitas,
                harga_jual: hargaJual,
                status: kuantitas > 0 ? 'Ready' : 'Kosong',
                raw_data: row
            });
        }

        response.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return response.status(200).json({ tanggal_update: tanggalUpdate, items });
    } catch (error) {
        console.error('Failed to load Google Sheets data:', error);
        return response.status(502).json({
            error: 'Gagal mengambil data dari Google Sheets'
        });
    } finally {
        clearTimeout(timeout);
    }
};
