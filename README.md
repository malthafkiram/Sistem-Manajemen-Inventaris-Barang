# Sistem Manajemen Inventaris Barang (SMIB) - RESTful API

> **Take-Home Test: Backend Developer Intern (Node.js / Golang)**  
> Implementasi RESTful API backend menggunakan **Node.js**, **Express.js**, **PostgreSQL**, dan **Sequelize ORM**.

---

## Daftar Isi
1. [Tech Stack & Referensi Dokumentasi Resmi](#tech-stack--referensi-dokumentasi-resmi)
2. [Fitur Utama](#fitur-utama)
3. [Struktur Proyek](#struktur-proyek)
4. [Jawaban Pertanyaan Pemahaman (WAJIB)](#jawaban-pertanyaan-pemahaman-wajib)
   - [1. Alur Request](#1-alur-request)
   - [2. Keamanan & Token (Local Storage vs HttpOnly Cookie)](#2-keamanan--token-local-storage-vs-httponly-cookie)
   - [3. Penanganan Konkurensi (Concurrency)](#3-penanganan-konkurensi-concurrency)
5. [Panduan Instalasi & Menjalankan Project Secara Lokal](#panduan-instalasi--menjalankan-project-secara-lokal)
6. [Dokumentasi API & Koleksi Insomnia](#dokumentasi-api--koleksi-insomnia)

---

## Tech Stack & Referensi Dokumentasi Resmi

Seluruh implementasi dibangun dengan mengikuti standar dokumentasi resmi dari masing-masing pustaka (*official documentation*):

| Teknologi / Package | Fungsi | Referensi Dokumentasi Resmi |
| :--- | :--- | :--- |
| **Node.js** | JavaScript Runtime Environment | [Node.js Official Docs](https://nodejs.org/docs/) |
| **Express.js** (`^5.3.0`) | Web Framework RESTful API | [Express.js Official Docs](https://expressjs.com/) |
| **PostgreSQL** (`pg ^8.23.1`) | Relational Database Management System | [PostgreSQL Official Documentation](https://www.postgresql.org/docs/) |
| **Sequelize ORM** (`^6.37.8`) | Object-Relational Mapping (Data Modeling & Query) | [Sequelize ORM Guide](https://sequelize.org/) |
| **Sequelize Validations** | Validasi integritas data & batas minimum stok/harga | [Sequelize Validations & Constraints Docs](https://sequelize.org/docs/v6/core-concepts/validations-and-constraints/) |
| **bcryptjs** (`^3.0.3`) | Hashing & Salting password pengguna secara aman | [bcryptjs npm package](https://www.npmjs.com/package/bcryptjs) |
| **jsonwebtoken** (`^9.0.3`) | Autentikasi stateless berbasis JSON Web Token (JWT) | [jsonwebtoken npm package](https://www.npmjs.com/package/jsonwebtoken) |
| **dotenv** (`^18.0.9`) | Manajemen environment variables secara aman | [dotenv npm package](https://www.npmjs.com/package/dotenv) |
| **cors** (`^2.8.6`) | Mengatur Cross-Origin Resource Sharing | [cors npm package](https://www.npmjs.com/package/cors) |

---

## Fitur Utama

1. **Autentikasi (Authentication)**:
   - `POST /register`: Mendaftarkan pengguna baru dengan validasi email unik, format email valid, serta password minimal 8 karakter yang di-hash dengan `bcryptjs`.
   - `POST /login`: Memverifikasi kredensial pengguna dan mengembalikan `access_token` (JWT).

2. **CRUD Barang (Inventaris)**:
   - Seluruh endpoint inventaris diproteksi oleh middleware **Authentication** (`jsonwebtoken`), sehingga hanya user yang telah terautentikasi yang dapat mengakses.
   - `POST /items`: Menambahkan data barang baru (Nama, Deskripsi, Stok, Harga).
   - `GET /items`: Menampilkan daftar barang dengan dukungan **Search** (`?search=nama_barang`) dan **Pagination** (`?page=1&limit=10`).
   - `GET /items/:id`: Menampilkan detail spesifik dari satu barang berdasarkan ID.
   - `PUT /items/:id`: Memperbarui data barang dengan proteksi **Authorization** (hanya pembuat barang yang berhak mengedit).
   - `DELETE /items/:id`: Menghapus data barang dengan proteksi **Authorization** (hanya pembuat barang yang berhak menghapus).

3. **Validasi & Integritas Data**:
   - Stok dan harga divalidasi pada level Model Sequelize menggunakan aturan bawaan `min: [0]` dan `isInt: true`.
   - Mencegah input data bernilai negatif atau format tidak valid masuk ke database.
   - Penanganan error terpusat (`errorHandler`) yang mengembalikan HTTP Status 400 Bad Request dengan pesan yang informatif.

---

## Struktur Proyek

```text
Sistem-Manajemen-Inventaris-Barang/
├── Backend_Test_Node_Golang.pdf      # Dokumen soal tes
├── Insomnia_2026-11-05-20-25-30.yaml # Koleksi dokumentasi API untuk Insomnia
├── README.md                          # Dokumentasi proyek & jawaban tes
└── smib_backend/                      # Source code RESTful API backend
    ├── config/
    │   └── config.js                  # Konfigurasi koneksi database PostgreSQL
    ├── controllers/
    │   ├── itemController.js          # Logic handler CRUD barang, search, & pagination
    │   └── userController.js          # Logic handler Register & Login
    ├── helpers/
    │   ├── bcrypt.js                  # Helper hashing & perbandingan password (bcryptjs)
    │   └── jwt.js                     # Helper sign & verify token (jsonwebtoken)
    ├── middlewares/
    │   ├── authentication.js          # Verifikasi validitas JWT Bearer token
    │   ├── authorization.js           # Verifikasi kepemilikan data (item ownership)
    │   └── errorHandler.js            # Penanganan error global terpusat
    ├── migrations/
    │   ├── 20261104153939-create-user.js
    │   └── 20261104154112-create-item.js
    ├── models/
    │   ├── index.js                   # Inisialisasi Sequelize & asosiasi model
    │   ├── item.js                    # Model Item & validasi (min stock/price)
    │   └── user.js                    # Model User & validasi (unique email, hash hooks)
    ├── routes/
    │   ├── index.js                   # Root router
    │   ├── item.js                    # Routing endpoint /items
    │   └── user.js                    # Routing endpoint /register & /login
    ├── .env.example                   # Contoh format variabel lingkungan
    ├── app.js                         # Entry point aplikasi Express.js
    └── package.json                   # Dependensi & script eksekusi
```

---

## Jawaban Pertanyaan Pemahaman (WAJIB)

### 1. Alur Request
> **Pertanyaan:**  
> *Jelaskan alur perjalanan sebuah request dari saat API dipanggil oleh client hingga data tersimpan di database. (Misal: Router -> Middleware -> Controller -> Service -> Repository). Mengapa Anda memisahkan logic seperti itu?*

#### A. Diagram Perjalanan Request

```text
[ Client (Insomnia / Frontend) ]
             │  (HTTP Request: POST /items dengan Bearer Token)
             ▼
[ Express Application (app.js) ]
             │  1. Global Middlewares: express.json(), express.urlencoded(), cors()
             ▼
[ Routing Layer (routes/index.js -> routes/item.js) ]
             │  2. Mencocokkan method & endpoint URL
             ▼
[ Middleware Layer ]
             │  3. authentication.js: Ekstrak header Authorization, verifikasi JWT (jwt.verify)
             │     dan memastikan user terdaftar di database.
             │  4. authorization.js (untuk PUT/DELETE): Memastikan item.userId === req.loginInfo.id
             ▼
[ Controller Layer (itemController.js) ]
             │  5. Menerima req.body & req.loginInfo, menyusun payload data
             ▼
[ ORM / Model Layer (Sequelize: models/item.js) ]
             │  6. Menjalankan validasi skema (notNull, notEmpty, isInt, min: [0])
             │     Jika validasi gagal -> Throw SequelizeValidationError
             ▼
[ Database Engine (PostgreSQL) ]
             │  7. Menjalankan query SQL (misal: INSERT INTO "Items" (...))
             ▼
[ Response Formatter & Error Handler ]
             │  8. Response sukses: Controller mengembalikan status 201/200 JSON ke Client
             │  9. Response gagal: Dilempar via next(error) ke errorHandler.js -> HTTP 400/401/403/404/500
             ▼
[ Client menerima Response JSON ]
```

#### B. Mengapa Memisahkan Logic Seperti Itu? (*Separation of Concerns*)

Pemisahan logika ke dalam layer yang terpisah mengacu pada prinsip **Separation of Concerns (SoC)** dan **Single Responsibility Principle (SRP)**:
1. **Router Layer (`routes/`)**: Bertanggung jawab murni untuk mendefinisikan *endpoint*, *HTTP method*, serta memasang middleware yang relevan. Router tidak perlu mengetahui bagaimana query database dijalankan.
2. **Middleware Layer (`middlewares/`)**: Berfungsi sebagai penjaga gerbang (*gatekeeper* / *interceptor*). Validasi token autentikasi (`authentication.js`) dan pengecekan hak akses kepemilikan (`authorization.js`) dipisahkan agar dapat digunakan kembali (*reusable*) di banyak rute tanpa duplikasi kode (*DRY - Don't Repeat Yourself*).
3. **Controller Layer (`controllers/`)**: Bertindak sebagai orkestrator yang menerima HTTP Request, mengekstrak parameter/body/query, memanggil operasi Model, dan menentukan format HTTP Response beserta status code-nya.
4. **Model & Validation Layer (`models/`)**: Bertanggung jawab atas integritas data, relasi antar tabel (`belongsTo`, `hasMany`), serta batasan nilai (seperti `min: [0]` untuk stok dan harga). Aturan bisnis terkait bentuk data berada di sini sehingga database selalu terlindungi dari data korup.
5. **Centralized Error Handler (`errorHandler.js`)**: Seluruh error dilempar menggunakan `next(error)` ke middleware error terpusat. Hal ini memastikan bahwa klien selalu menerima format response error yang seragam, konsisten, dan aman (tidak mengekspos *stack trace* internal ke publik).

---

### 2. Keamanan & Token (Local Storage vs HttpOnly Cookie)
> **Pertanyaan:**  
> *Dimana sebaiknya frontend menyimpan token JWT yang dikembalikan oleh API ini (Local Storage atau HttpOnly Cookie)? Apa alasan dan risiko keamanannya?*

#### Perbandingan Komparatif:

| Parameter | Local Storage | HttpOnly Cookie |
| :--- | :--- | :--- |
| **Aksesibilitas JavaScript** | Ya (`localStorage.getItem('token')`) | **Tidak** (Diblokir oleh browser dari skrip JS) |
| **Kerentanan Utama** | **XSS (Cross-Site Scripting)** | **CSRF (Cross-Site Request Forgery)** |
| **Kemudahan Implementasi** | Sangat mudah | Membutuhkan konfigurasi CORS & cookie header |
| **Tingkat Keamanan** | Rendah - Sedang | **Tinggi (Standar Industri)** |

#### Analisis Risiko:
1. **Local Storage**:
   - **Alasan Penggunaan**: Sederhana digunakan pada Single Page Application (SPA), mudah dikirimkan melalui header `Authorization: Bearer <token>`.
   - **Risiko Keamanan**: Sangat rentan terhadap serangan **XSS (Cross-Site Scripting)**. Jika aplikasi web memiliki celah XSS (misal dari input yang tidak di-sanitize atau dependensi third-party NPM yang disusupi malware), penyerang dapat mengeksekusi script jahat untuk membaca `localStorage` dan mencuri JWT. Begitu token dicuri, penyerang dapat menyamar sebagai user dari mana saja sampai token kadaluarsa.

2. **HttpOnly Cookie**:
   - **Alasan Penggunaan**: Cookie yang diberi atribut `HttpOnly` **tidak dapat dibaca maupun dimanipulasi oleh skrip JavaScript di sisi browser** (`document.cookie` tidak bisa mengaksesnya). Browser secara otomatis menyertakan cookie ini pada setiap request ke origin/domain yang sesuai. Hal ini secara efektif **menutup celah pencurian token via serangan XSS**.
   - **Risiko Keamanan**: Rentan terhadap serangan **CSRF (Cross-Site Request Forgery)**, di mana situs jahat memicu request ke API korban karena browser otomatis melampirkan cookie.
   - **Mitigasi CSRF**: Risiko ini dapat dicegah dengan mengaktifkan flag:
     - `SameSite=Strict` atau `SameSite=Lax` pada cookie.
     - `Secure` (memastikan cookie hanya dikirim melalui koneksi terenkripsi HTTPS).
     - Menggunakan mekanisme Anti-CSRF Token / Double Submit Cookie untuk request mutasi (POST/PUT/DELETE).

#### Rekomendasi Arsitektur Terbaik (*Best Practice*):
Rekomendasi terbaik adalah menyimpan token di **HttpOnly Cookie** dengan atribut `Secure`, `SameSite=Strict`, dan `HttpOnly`.

Untuk sistem skala produksi modern, arsitektur yang paling disarankan adalah kombinasi:
- **Short-Lived Access Token** (masa aktif 5–15 menit): Disimpan hanya di dalam **In-Memory** state aplikasi frontend (variabel memori JavaScript). Jika terjadi XSS, token akan hilang saat tab ditutup/refresh.
- **Long-Lived Refresh Token** (masa aktif 7–30 hari): Disimpan di dalam **HttpOnly Secure Cookie**. Digunakan hanya untuk memanggil endpoint `/refresh-token` guna memperbarui access token baru saat kadaluarsa.

---

### 3. Penanganan Konkurensi (Concurrency)
> **Pertanyaan:**  
> *Misalkan API Anda dipublish ke publik, lalu ada 2 user yang secara TEPAT BERSAMAAN melakukan request untuk mengurangi stok barang X (stok tersisa: 1). Bagaimana cara Anda mencegah stok menjadi -1 di database?*

#### A. Implementasi Saat Ini (Model Validation Sequelize)
Pada backend ini, pencegahan di layer aplikasi diimplementasikan pada Model `Item` (`models/item.js`) menggunakan validasi bawaan Sequelize:
```javascript
stock: {
  type: DataTypes.INTEGER,
  allowNull: false,
  validate: {
    notNull: { msg: "Stok wajib diisi" },
    isInt: { msg: "Stok harus berupa bilangan bulat" },
    min: {
      args: [0],
      msg: "Stok tidak boleh bernilai negatif",
    },
  },
}
```
*(Dokumentasi resmi: [Sequelize Core Concepts - Validations and Constraints](https://sequelize.org/docs/v6/core-concepts/validations-and-constraints/))*.

Validasi `min: [0]` memastikan bahwa setiap kali operasi pembuatan atau pembaruan item (`Item.create()` atau `item.update()`) dilakukan, Sequelize akan memvalidasi nilai properti sebelum query dieksekusi ke database. Jika nilai stok yang hendak disimpan bernilai `< 0` (misalnya `-1`), Sequelize akan menggagalkan operasi, membatalkan penulisan ke database, dan melempar `SequelizeValidationError` yang menghasilkan HTTP 400 Bad Request.

#### B. Mengapa Race Condition Tetap Membutuhkan Perlindungan Database?
Meskipun validasi model mencegah angka negatif masuk secara langsung, pada kondisi *concurrency tinggi* dapat terjadi fenomena **Race Condition / Lost Update**:
1. User A dan User B sama-sama membaca data barang X pada waktu yang bersamaan (`SELECT stock FROM Items WHERE id = 1` -> keduanya membaca stok = 1).
2. Kedua thread aplikasi memeriksa kondisi: `stok >= 1` (keduanya lolos evaluasi karena stok terbaca 1).
3. User A mengurangi stok: `1 - 1 = 0` dan berhasil menyimpannya.
4. User B juga mengurangi stok: `1 - 1 = 0` dan menimpanya (*Lost Update*), sehingga kedua user berhasil melakukan pembelian padahal barang fisik hanya tersisa 1 (*overselling*). Atau jika dieksekusi dengan decrement langsung tanpa pengecekan atomik, stok bisa bernilai `-1`.

#### C. Solusi Komprehensif Mencegah Race Condition di Level Database (Production-Ready)

Untuk menangani konkurensi ekstrem di lingkungan produksi, berikut strategi terbaik yang dapat diterapkan:

##### 1. Database CHECK Constraint (Lapisan Pertahanan Absolut)
Menambahkan aturan constraint `CHECK` langsung pada tabel PostgreSQL melalui migrasi:
```sql
ALTER TABLE "Items" ADD CONSTRAINT "check_stock_non_negative" CHECK (stock >= 0);
```
Dengan constraint ini, database PostgreSQL sendiri yang menjamin bahwa tidak ada operasi SQL apa pun (baik via ORM, query manual, maupun stored procedure) yang dapat menyebabkan kolom `stock` bernilai kurang dari 0. Jika dilanggar, PostgreSQL akan membatalkan transaksi dengan error `check_violation`.

##### 2. Database Transaction dengan Pessimistic Locking (`SELECT FOR UPDATE`)
Menggunakan fitur transaksi terkelola (*Managed Transaction*) dan *Row-Level Lock* dari Sequelize:
```javascript
const { sequelize, Item } = require("../models");

await sequelize.transaction(async (t) => {
  // Melakukan SELECT ... FOR UPDATE pada baris barang tersebut
  const item = await Item.findByPk(itemId, {
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  if (!item || item.stock < quantityRequested) {
    throw new Error("Stok barang tidak mencukupi");
  }

  // Kurangi stok dan simpan dalam transaksi yang sama
  await item.decrement("stock", { by: quantityRequested, transaction: t });
});
```
**Cara Kerja**: Ketika User A membaca data dengan `lock: t.LOCK.UPDATE`, PostgreSQL akan mengunci baris data tersebut. Request dari User B yang datang bersamaan akan **antre/menunggu** sampai transaksi User A selesai (`COMMIT`). Begitu giliran User B tiba, User B akan membaca stok terbaru yang sudah bernilai `0`, sehingga request User B langsung ditolak dengan pesan "Stok tidak mencukupi".

##### 3. Atomic Conditional Update (Efisien Tanpa Lock Eksplisit)
Menggunakan klausa kondisional langsung pada query SQL `UPDATE`:
```javascript
const [affectedRows] = await Item.update(
  { stock: sequelize.literal("stock - 1") },
  {
    where: {
      id: itemId,
      stock: { [Op.gte]: 1 }, // Hanya update jika stok masih >= 1
    },
  }
);

if (affectedRows === 0) {
  throw { name: "BadRequest", message: "Stok telah habis" };
}
```
**Cara Kerja**: Database mengeksekusi operasi pengurangan dan pengecekan stok dalam satu instruksi atomik. Jika dua request datang bersamaan, hanya satu request yang berhasil mengubah 1 baris (`affectedRows = 1`), sedangkan request kedua mendapati kondisi `stock >= 1` sudah tidak terpenuhi sehingga `affectedRows = 0`.

---

## Panduan Instalasi & Menjalankan Project Secara Lokal

### 1. Prasyarat Sistem
- **Node.js**: v18.0.0 atau yang lebih baru ([Unduh Node.js](https://nodejs.org/))
- **PostgreSQL**: v14.0 atau yang lebih baru ([Unduh PostgreSQL](https://www.postgresql.org/))
- **npm**: v9.0.0 atau yang lebih baru

### 2. Kloning Repository & Instal Dependensi
```bash
# Clone repository
git clone <URL_REPOSITORY_ANDA>
cd Sistem-Manajemen-Inventaris-Barang/smib_backend

# Install dependensi yang dibutuhkan
npm install
```

### 3. Konfigurasi Environment Variables (`.env`)
Salin file `.env.example` menjadi `.env` di dalam folder `smib_backend/`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi database PostgreSQL dan secret key Anda pada file `.env`:
```env
USERNAME_DB=postgres
PASSWORD_DB=postgres
DATABASE_DB=sistem_manajemen_inventaris_barang
HOST=127.0.0.1

SECRET_KEY_JWT=rahasia_super_aman_jwt_secret_key

PORT=3000
```

### 4. Setup Database & Jalankan Migrasi
Pastikan service database PostgreSQL Anda sedang berjalan, lalu eksekusi perintah berikut untuk membuat database dan tabel:
```bash
# Membuat database PostgreSQL sesuai nama di .env
npx sequelize-cli db:create

# Menjalankan migrasi tabel Users dan Items
npx sequelize-cli db:migrate
```

### 5. Menjalankan Server API
Jalankan aplikasi dengan script yang tersedia di `package.json`:
```bash
# Mode development (auto-reload)
npm run dev

# ATAU Mode standar produksi
npm start
```
Server akan aktif dan siap menerima request pada:
```text
http://localhost:3000
```

---

## Dokumentasi API & Koleksi Insomnia

File koleksi Insomnia telah disediakan pada root direktori:
📁 **`Insomnia_2026-11-05-20-25-30.yaml`**

### Cara Import ke Insomnia:
1. Buka aplikasi **Insomnia**.
2. Klik tombol menu di pojok kiri atas -> pilih **Import**.
3. Pilih opsi **From File** dan arahkan ke file `Insomnia_2026-11-05-20-25-30.yaml`.
4. Koleksi request akan otomatis siap digunakan.

---

### Ringkasan Endpoint API

#### 1. Auth: Register Pengguna Baru
- **Endpoint**: `POST /register`
- **Akses**: Public
- **Request Body (JSON)**:
  ```json
  {
    "username": "althaf",
    "email": "althaf@mail.com",
    "password": "password123"
  }
  ```
- **Response Sukses (201 Created)**:
  ```json
  {
    "id": 1,
    "email": "althaf@mail.com",
    "username": "althaf"
  }
  ```

#### 2. Auth: Login Pengguna
- **Endpoint**: `POST /login`
- **Akses**: Public
- **Request Body (JSON)**:
  ```json
  {
    "email": "althaf@mail.com",
    "password": "password123"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "access_token": "<JWT_TOKEN_STRING>",
    "email": "althaf@mail.com"
  }
  ```

---

#### 3. Items: Tambah Barang Baru
- **Endpoint**: `POST /items`
- **Akses**: Memerlukan Login (`Authorization: Bearer <access_token>`)
- **Request Body (JSON)**:
  ```json
  {
    "name": "Laptop Asus ROG",
    "description": "Laptop gaming spesifikasi tinggi",
    "stock": 10,
    "price": 15000000
  }
  ```
- **Response Sukses (201 Created)**:
  ```json
  {
    "message": "Berhasil menambahkan barang baru",
    "data": {
      "id": 1,
      "name": "Laptop Asus ROG",
      "description": "Laptop gaming spesifikasi tinggi",
      "stock": 10,
      "price": 15000000,
      "userId": 1,
      "updatedAt": "2026-11-05T13:40:00.000Z",
      "createdAt": "2026-11-05T13:40:00.000Z"
    }
  }
  ```

#### 4. Items: Lihat Daftar Barang (Search & Pagination)
- **Endpoint**: `GET /items`
- **Akses**: Memerlukan Login (`Authorization: Bearer <access_token>`)
- **Query Parameters (Opsional)**:
  - `search` (string): Pencarian nama barang (case-insensitive)
  - `page` (integer): Halaman data (default: 1)
  - `limit` (integer): Jumlah data per halaman (default: 10)
- **Contoh Request**: `GET /items?search=Asus&page=1&limit=5`
- **Response Sukses (200 OK)**:
  ```json
  {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 5,
    "data": [
      {
        "id": 1,
        "name": "Laptop Asus ROG",
        "description": "Laptop gaming spesifikasi tinggi",
        "stock": 10,
        "price": 15000000,
        "userId": 1,
        "createdAt": "2026-11-05T13:40:00.000Z",
        "updatedAt": "2026-11-05T13:40:00.000Z",
        "User": {
          "id": 1,
          "username": "althaf",
          "email": "althaf@mail.com"
        }
      }
    ]
  }
  ```

#### 5. Items: Detail Barang Berdasarkan ID
- **Endpoint**: `GET /items/:id`
- **Akses**: Memerlukan Login (`Authorization: Bearer <access_token>`)
- **Response Sukses (200 OK)**:
  ```json
  {
    "id": 1,
    "name": "Laptop Asus ROG",
    "description": "Laptop gaming spesifikasi tinggi",
    "stock": 10,
    "price": 15000000,
    "userId": 1,
    "createdAt": "2026-11-05T13:40:00.000Z",
    "updatedAt": "2026-11-05T13:40:00.000Z",
    "User": {
      "id": 1,
      "username": "althaf",
      "email": "althaf@mail.com"
    }
  }
  ```

#### 6. Items: Edit Data Barang
- **Endpoint**: `PUT /items/:id`
- **Akses**: Memerlukan Login & Hak Akses Pemilik Data (`Authorization: Bearer <access_token>`)
- **Request Body (JSON)**:
  ```json
  {
    "name": "Laptop Asus ROG Terbaru",
    "description": "Spesifikasi sudah di-upgrade",
    "stock": 8,
    "price": 16000000
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "message": "Berhasil memperbarui data barang",
    "data": {
      "id": 1,
      "name": "Laptop Asus ROG Terbaru",
      "description": "Spesifikasi sudah di-upgrade",
      "stock": 8,
      "price": 16000000,
      "userId": 1,
      "updatedAt": "2026-11-05T13:45:00.000Z"
    }
  }
  ```

#### 7. Items: Hapus Barang
- **Endpoint**: `DELETE /items/:id`
- **Akses**: Memerlukan Login & Hak Akses Pemilik Data (`Authorization: Bearer <access_token>`)
- **Response Sukses (200 OK)**:
  ```json
  {
    "message": "Barang berhasil dihapus"
  }
  ```

---
*Dibuat untuk Take-Home Test: Backend Developer Intern (Node.js).*
