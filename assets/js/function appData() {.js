function appData() {
    return {
        items: [],
        tanggalUpdate: 'Memuat...',
        loading: true,
        search: '',
        currentPage: 1,
        rowsPerPage: 10,
        modalOpen: false,
        selectedItem: {},

        init() {
            fetch('api.php')
                .then(res => res.json())
                .then(data => {
                    this.items = data.items;
                    this.tanggalUpdate = data.tanggal_update;
                    this.loading = false;
                })
                .catch(err => {
                    console.error('Gagal memuat data:', err);
                    this.loading = false;
                });
        },

        // Pencarian full semua halaman (mencakup Kode dan Deskripsi)
        get filteredItems() {
            // Reset ke halaman 1 setiap kali kata kunci pencarian berubah
            if (this.search !== '') {
                // Opsional: biarkan user tetap di halaman saat mengetik, atau reset
            }
            
            if (!this.search) return this.items;
            let query = this.search.toLowerCase();
            return this.items.filter(item => {
                return item.kode.toLowerCase().includes(query) || 
                       item.deskripsi.toLowerCase().includes(query);
            });
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