function hariIni() {
  var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}

new Vue({
  el: "#app",
  data: function () {
    return {
      pengirimanList: dataBahanAjar.pengirimanList,
      paketList: dataBahanAjar.paket,
      stok: dataBahanAjar.stok,
      tracking: JSON.parse(JSON.stringify(dataBahanAjar.tracking)),
      cari: "", hasil: null, pesanCari: "",
      form: { nim: "", nama: "", ekspedisi: "", paket: "", tanggalKirim: hariIni() },
      errors: {}, sukses: ""
    };
  },
  computed: {
    // Nomor DO: "DO" + tahun berjalan + "-" + urutan (lanjut dari nomor terbesar)
    nomorBerikut: function () {
      var maks = 0;
      Object.keys(this.tracking).forEach(function (no) {
        var n = parseInt(no.split("-")[1], 10);
        if (n > maks) maks = n;
      });
      return "DO" + new Date().getFullYear() + "-" + String(maks + 1).padStart(3, "0");
    },
    paketTerpilih: function () {
      var k = this.form.paket;
      return this.paketList.find(function (p) { return p.kode === k; }) || null;
    },
    isiPaket: function () {
      if (!this.paketTerpilih) return [];
      var stok = this.stok;
      return this.paketTerpilih.isi.map(function (kode) {
        var s = stok.find(function (x) { return x.kode === kode; });
        return { kode: kode, judul: s ? s.judul : "(judul tidak ditemukan)" };
      });
    },
    totalHarga: function () { return this.paketTerpilih ? this.paketTerpilih.harga : 0; },
    daftarDO: function () {
      var t = this.tracking;
      return Object.keys(t).map(function (no) { return Object.assign({ no: no }, t[no]); });
    }
  },
  watch: {
    // Watcher 1: input pencarian berubah -> bersihkan hasil & pesan lama
    cari: function () { this.hasil = null; this.pesanCari = ""; },
    // Watcher 2: pilih paket -> hapus error paket & pesan sukses
    "form.paket": function () { this.errors.paket = ""; }
  },
  methods: {
    rupiah: function (n) { return "Rp " + Number(n).toLocaleString("id-ID"); },
    lacak: function () {
      var no = this.cari.toUpperCase();
      var d = this.tracking[no];
      if (!d) { this.hasil = null; this.pesanCari = "Nomor DO tidak ditemukan."; return; }
      this.pesanCari = "";
      this.hasil = Object.assign({ no: no }, d);
    },
    tambah: function () {
      var f = this.form, e = {};
      if (!/^\d{9,}$/.test(f.nim)) e.nim = "NIM harus angka, minimal 9 digit.";
      if (f.nama.length < 3) e.nama = "Nama minimal 3 karakter.";
      if (!f.ekspedisi) e.ekspedisi = "Pilih ekspedisi.";
      if (!f.paket) e.paket = "Pilih paket.";
      if (!f.tanggalKirim) e.tanggalKirim = "Tanggal kirim wajib diisi.";
      this.errors = e;
      if (Object.keys(e).length) return;
      var peng = this.pengirimanList.find(function (p) { return p.kode === f.ekspedisi; });
      var no = this.nomorBerikut;
      this.$set(this.tracking, no, {
        nim: f.nim, nama: f.nama, status: "Diproses", ekspedisi: "JNE " + peng.nama,
        tanggalKirim: f.tanggalKirim, paket: f.paket, total: this.totalHarga,
        perjalanan: [{ waktu: f.tanggalKirim + " 00:00:00", keterangan: "DO dibuat" }]
      });
      this.sukses = no + " berhasil disimpan.";
      this.form = { nim: "", nama: "", ekspedisi: "", paket: "", tanggalKirim: hariIni() };
    }
  }
});
