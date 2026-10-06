// ===== Fungsi umum =====
function ambilUser() {
  try { return JSON.parse(sessionStorage.getItem("user")); } catch (e) { return null; }
}
function bukaModal(id) { document.getElementById(id).style.display = "flex"; }
function tutupModal(id) { document.getElementById(id).style.display = "none"; }

// ===== Halaman Login =====
function initLogin() {
  document.getElementById("formLogin").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("email").value.trim();
    var pass = document.getElementById("password").value;
    var pesan = document.getElementById("pesanError");
    if (email === "" || pass === "") {
      pesan.textContent = "Email dan password wajib diisi.";
      return;
    }
    var user = dataPengguna.find(function (u) { return u.email === email && u.password === pass; });
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
      window.location.href = "dashboard.html";
    } else {
      alert("Email/password yang Anda masukkan salah");
    }
  });
  document.getElementById("btnLupa").onclick = function () { bukaModal("modalLupa"); };
  document.getElementById("btnDaftar").onclick = function () { bukaModal("modalDaftar"); };
  document.querySelectorAll("[data-tutup]").forEach(function (b) {
    b.onclick = function () { tutupModal(b.dataset.tutup); };
  });
  document.getElementById("kirimLupa").onclick = function () {
    var em = document.getElementById("emailLupa").value.trim();
    if (em === "") { alert("Email wajib diisi."); return; }
    alert("Tautan reset password dikirim ke " + em + " (simulasi).");
    tutupModal("modalLupa");
  };
  document.getElementById("kirimDaftar").onclick = function () {
    var n = document.getElementById("namaDaftar").value.trim();
    var em = document.getElementById("emailDaftar").value.trim();
    var p = document.getElementById("passDaftar").value;
    if (n === "" || em.indexOf("@") < 1 || p.length < 6) {
      alert("Isi nama, email yang valid, dan password minimal 6 karakter.");
      return;
    }
    alert("Pendaftaran berhasil (simulasi). Silakan login.");
    tutupModal("modalDaftar");
  };
}

// ===== Dashboard =====
function initDashboard(user) {
  var jam = new Date().getHours();
  var sapa = jam < 11 ? "pagi" : jam < 15 ? "siang" : jam < 18 ? "sore" : "malam";
  document.getElementById("greeting").textContent = "Selamat " + sapa + ", " + user.nama;
  document.getElementById("infoUser").textContent = "Role: " + user.role + " | Lokasi: " + user.lokasi;
}

// ===== Tracking =====
function initTracking() {
  var progress = { "Dalam Perjalanan": 60, "Dikirim": 100 };
  document.getElementById("btnCari").onclick = function () {
    var no = document.getElementById("noDO").value.trim();
    var box = document.getElementById("hasil");
    if (no === "") { alert("Nomor Delivery Order wajib diisi."); return; }
    var d = dataTracking[no];
    if (!d) {
      box.style.display = "block";
      box.innerHTML = "<p class='error'>Nomor DO " + no + " tidak ditemukan.</p>";
      return;
    }
    var persen = progress[d.status] || 30;
    var html = "<h1>" + d.nama + "</h1>" +
      "<p><b>Status: " + d.status + "</b></p>" +
      "<div class='bar'><div style='width:" + persen + "%'></div></div>" +
      "<div class='info'>" +
      "<b>Ekspedisi</b><span>" + d.ekspedisi + "</span>" +
      "<b>Tanggal Kirim</b><span>" + d.tanggalKirim + "</span>" +
      "<b>Jenis Paket</b><span>" + d.paket + "</span>" +
      "<b>Total Pembayaran</b><span>" + d.total + "</span></div>" +
      "<h3>Perjalanan Paket</h3><ul class='timeline'>";
    d.perjalanan.slice().reverse().forEach(function (p) {
      html += "<li>" + p.keterangan + "<small>" + p.waktu + "</small></li>";
    });
    box.innerHTML = html + "</ul>";
    box.style.display = "block";
  };
}

// ===== Stok =====
function tambahBaris(b) {
  var tr = document.createElement("tr");
  var kolom = [b.kodeLokasi, b.kodeBarang, b.namaBarang, b.jenisBarang, b.edisi, b.stok];
  var tdCover = document.createElement("td");
  if (b.cover) {
    var img = document.createElement("img");
    img.src = b.cover; img.alt = b.namaBarang;
    tdCover.appendChild(img);
  }
  tr.appendChild(tdCover);
  kolom.forEach(function (isi) {
    var td = document.createElement("td");
    td.textContent = isi;
    tr.appendChild(td);
  });
  document.getElementById("tbodyStok").appendChild(tr);
}
function initStok() {
  dataBahanAjar.forEach(tambahBaris);
  document.getElementById("btnTambah").onclick = function () {
    var b = {
      kodeLokasi: document.getElementById("inLokasi").value.trim(),
      kodeBarang: document.getElementById("inKode").value.trim(),
      namaBarang: document.getElementById("inNama").value.trim(),
      jenisBarang: document.getElementById("inJenis").value,
      edisi: document.getElementById("inEdisi").value,
      stok: document.getElementById("inStok").value,
      cover: ""
    };
    if (!b.kodeLokasi || !b.kodeBarang || !b.namaBarang || !b.edisi || b.stok === "") {
      alert("Semua kolom wajib diisi.");
      return;
    }
    if (Number(b.stok) < 0) { alert("Stok tidak boleh negatif."); return; }
    tambahBaris(b);
    ["inLokasi", "inKode", "inNama", "inEdisi", "inStok"].forEach(function (id) {
      document.getElementById(id).value = "";
    });
    alert("Stok baru berhasil ditambahkan.");
  };
}

// ===== Jalankan sesuai halaman =====
var halaman = document.body.dataset.page;
if (halaman === "login") {
  initLogin();
} else {
  var user = ambilUser();
  if (!user) { window.location.href = "index.html"; }
  else {
    document.getElementById("logout").onclick = function () {
      sessionStorage.removeItem("user");
      window.location.href = "index.html";
    };
    document.querySelectorAll("[data-soon]").forEach(function (a) {
      a.onclick = function () { alert("Halaman ini belum tersedia pada Tugas Praktik 1."); };
    });
    if (halaman === "dashboard") initDashboard(user);
    if (halaman === "tracking") initTracking();
    if (halaman === "stok") initStok();
  }
}
