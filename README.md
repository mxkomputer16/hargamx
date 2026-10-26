# Data Stok & Harga MX

## Deploy ke Vercel

1. Push **isi folder `databarang` ini** ke repository GitHub. Jangan mengunggah seluruh folder `C:\xampp\htdocs`, karena berisi proyek dan file XAMPP lain.
2. Di Vercel, pilih **Add New → Project** lalu import repository tersebut.
3. Jika repository berisi langsung file `index.html`, biarkan **Root Directory** di `/`. Jika `databarang` berada di dalam repository, pilih folder `databarang` sebagai **Root Directory**.
4. Tidak perlu memilih framework atau menambahkan Build Command. Vercel akan menyajikan `index.html` sebagai halaman statis dan `api/stok.js` sebagai Function.
5. Deploy. Halaman mengambil data melalui `/api/stok`; Google Sheet harus dapat diakses sebagai CSV oleh publik.

## Pengembangan lokal

Untuk XAMPP, buka `index.php`. Halaman tersebut tetap menggunakan `api.php`. Untuk mencoba endpoint Vercel Function, jalankan Vercel CLI dari folder ini dengan `vercel dev`.
