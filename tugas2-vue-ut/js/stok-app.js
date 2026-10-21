var blankForm = function () {
  return { kode: "", judul: "", kategori: "", upbjj: "", lokasiRak: "", harga: null, qty: null, safety: null, catatan: "" };
};

new Vue({
  el: "#app",
  data: function () {
    return {
      upbjjList: dataBahanAjar.upbjjList,
      kategoriList: dataBahanAjar.kategoriList,
      stok: JSON.parse(JSON.stringify(dataBahanAjar.stok)),
      filter: { upbjj: "", kategori: "", reorder: false },
      sortBy: "",
      sortDir: "asc",
      showAdd: false,
      form: blankForm(),
      errors: {},
      editing: null,
      editErrors: {},
      notif: ""
    };
  },
  computed: {
    // Opsi kategori bergantung pada UT-Daerah terpilih (dependent options)
    kategoriOptions: function () {
      var u = this.filter.upbjj;
      var set = {};
      this.stok.forEach(function (s) { if (s.upbjj === u) set[s.kategori] = true; });
      return Object.keys(set);
    },
    // Computed di-cache: hanya dihitung ulang jika filter/sort/stok berubah
    hasilFilter: function () {
      var self = this;
      var data = this.stok.filter(function (s) {
        if (self.filter.upbjj && s.upbjj !== self.filter.upbjj) return false;
        if (self.filter.kategori && s.kategori !== self.filter.kategori) return false;
        if (self.filter.reorder && !(s.qty < s.safety || s.qty === 0)) return false;
        return true;
      });
      if (this.sortBy) {
        var key = this.sortBy, dir = this.sortDir === "asc" ? 1 : -1;
        data = data.slice().sort(function (a, b) {
          var x = a[key], y = b[key];
          if (typeof x === "string") return x.localeCompare(y) * dir;
          return (x - y) * dir;
        });
      }
      return data;
    },
    jumlahReorder: function () {
      return this.stok.filter(function (s) { return s.qty < s.safety; }).length;
    }
  },
  watch: {
    // Watcher 1: ganti UT-Daerah -> kategori di-reset karena opsinya berubah
    "filter.upbjj": function () { this.filter.kategori = ""; },
    // Watcher 2: stok berubah -> perbarui pesan pengingat re-order
    stok: {
      deep: true,
      immediate: true,
      handler: function () {
        this.notif = this.jumlahReorder + " bahan ajar berada di bawah stok safety atau kosong. Pertimbangkan re-order.";
      }
    },
    // Watcher 3: sort dikosongkan -> arah kembali ke naik
    sortBy: function (v) { if (!v) this.sortDir = "asc"; }
  },
  methods: {
    statusOf: function (s) {
      if (s.qty === 0) return "kosong";
      return s.qty < s.safety ? "menipis" : "aman";
    },
    rupiah: function (n) { return "Rp " + Number(n).toLocaleString("id-ID"); },
    resetFilter: function () {
      this.filter = { upbjj: "", kategori: "", reorder: false };
      this.sortBy = ""; this.sortDir = "asc";
    },
    validate: function (f, isNew) {
      var e = {};
      var isInt = function (v) { return Number.isInteger(v) && v >= 0; };
      if (isNew) {
        if (!/^[A-Z]{4}\d{4}$/.test(f.kode)) e.kode = "Format: 4 huruf kapital + 4 angka (contoh EKMA4116).";
        else if (this.stok.some(function (s) { return s.kode === f.kode && s.upbjj === f.upbjj; })) e.kode = "Kode sudah ada di UT-Daerah ini.";
        if (!f.judul || f.judul.length < 3) e.judul = "Judul minimal 3 karakter.";
        if (!f.kategori) e.kategori = "Pilih kategori.";
        if (!f.upbjj) e.upbjj = "Pilih UT-Daerah.";
      }
      if (!/^R\d+-[A-Z]\d+$/.test(f.lokasiRak)) e.lokasiRak = "Format rak: R1-A3.";
      if (!(f.harga > 0)) e.harga = "Harga harus lebih dari 0.";
      if (!isInt(f.qty)) e.qty = "Stok harus bilangan bulat >= 0.";
      if (!isInt(f.safety)) e.safety = "Safety harus bilangan bulat >= 0.";
      return e;
    },
    tambah: function () {
      this.errors = this.validate(this.form, true);
      if (Object.keys(this.errors).length) return;
      var f = this.form, div = document.createElement("div");
      div.textContent = f.catatan; // escape agar aman dipakai v-html
      this.stok.push({ kode: f.kode, judul: f.judul, kategori: f.kategori, upbjj: f.upbjj, lokasiRak: f.lokasiRak,
        harga: f.harga, qty: f.qty, safety: f.safety, catatanHTML: div.innerHTML });
      this.form = blankForm(); this.showAdd = false;
    },
    mulaiEdit: function (item) { this.editErrors = {}; this.editing = Object.assign({}, item); },
    simpanEdit: function () {
      this.editErrors = this.validate(this.editing, false);
      if (Object.keys(this.editErrors).length) return;
      var e = this.editing;
      var target = this.stok.find(function (s) { return s.kode === e.kode && s.upbjj === e.upbjj; });
      Object.assign(target, { lokasiRak: e.lokasiRak, harga: e.harga, qty: e.qty, safety: e.safety });
      this.editing = null;
    }
  }
});
