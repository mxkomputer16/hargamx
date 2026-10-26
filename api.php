<?php
// api.php
header('Content-Type: application/json; charset=utf-8');

$url = "https://docs.google.com/spreadsheets/d/17qApH3_XO1Mx3sn1N1uqXz-mBu4KT5SqDzyIXJ3HZvQ/export?format=csv&gid=1103841187";

$csvData = @file_get_contents($url);

if ($csvData === FALSE) {
    echo json_encode(["error" => "Gagal mengambil data dari Google Sheets"]);
    exit;
}

$lines = explode(PHP_EOL, $csvData);
$data = [];
$tanggalUpdate = "As of 20 Sep 2026";

foreach ($lines as $index => $line) {
    $row = str_getcsv($line);
    
    if ($index == 0 && isset($row[0])) {
        $tanggalUpdate = $row[0];
    }

    if ($index < 4) continue; 

    $kode = isset($row[1]) ? trim($row[1]) : '';
    $deskripsi = isset($row[3]) ? trim($row[3]) : '';
    $kuantitasRaw = isset($row[5]) ? trim($row[5]) : '0';
    $kuantitas = is_numeric($kuantitasRaw) ? intval($kuantitasRaw) : 0;
    
    $hargaJualRaw = isset($row[11]) ? trim($row[11]) : '0';
    $hargaJual = is_numeric(str_replace(['.', ','], '', $hargaJualRaw)) 
                 ? 'Rp ' . number_format((float)str_replace(['.', ','], '', $hargaJualRaw), 0, ',', '.') 
                 : $hargaJualRaw;

    if (!empty($kode) && $kode !== 'Item No.') {
        $data[] = [
            "no" => count($data) + 1,
            "kode" => $kode,
            "deskripsi" => $deskripsi,
            "kuantitas" => $kuantitas,
            "harga_jual" => $hargaJual,
            "status" => ($kuantitas > 0) ? 'Ready' : 'Kosong',
            "raw_data" => $row 
        ];
    }
}

echo json_encode([
    "tanggal_update" => $tanggalUpdate,
    "items" => $data
]);
?>