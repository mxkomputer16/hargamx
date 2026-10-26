function appData() {
    return {
        items: [],
        tanggalUpdate: 'Memuat...',
        loading: true,
        loadError: '',
        search: '',
        statusFilter: 'semua',
        currentPage: 1,
        rowsPerPage: 20,
        modalOpen: false,
        selectedItem: {},

        init() {
            const apiUrl = window.location.pathname.toLowerCase().endsWith('.php')
                ? 'api.php'
                : '/api/stok';

            fetch(apiUrl)
                .then(async res => {
                    const data = await res.json();
                    if (!res.ok || data.error) {
                        throw new Error(data.error || `HTTP ${res.status}`);
                    }
                    return data;
                })
                .then(data => {
                    this.items = data.items;
                    this.tanggalUpdate = data.tanggal_update;
                    this.loading = false;
                })
                .catch(err => {
                    console.error('Gagal memuat data:', err);
                    this.loadError = 'Data gagal dimuat. Silakan coba lagi beberapa saat.';
                    this.loading = false;
                });
        },

        get filteredItems() {
            let result = this.items;

            if (this.statusFilter === 'ready') {
                result = result.filter(item => item.kuantitas > 0);
            } else if (this.statusFilter === 'kosong') {
                result = result.filter(item => item.kuantitas <= 0);
            }

            if (this.search) {
                let query = this.search.toLowerCase();
                result = result.filter(item => {
                    return item.kode.toLowerCase().includes(query) || 
                           item.deskripsi.toLowerCase().includes(query);
                });
            }

            return result;
        },

        get totalPages() {
            return Math.ceil(this.filteredItems.length / this.rowsPerPage) || 1;
        },

        get startIndex() {
            return (this.currentPage - 1) * this.rowsPerPage;
        },

        get paginatedItems() {
            return this.filteredItems.slice(this.startIndex, this.startIndex + this.rowsPerPage);
        },

        nextPage() {
            if (this.currentPage < this.totalPages) this.currentPage++;
        },

        prevPage() {
            if (this.currentPage > 1) this.currentPage--;
        },

        openModal(item) {
            this.selectedItem = item;
            this.modalOpen = true;
        }
    }
}