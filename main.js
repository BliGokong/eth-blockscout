const axios = require('axios');
const fs = require('fs').promises;

// Fungsi untuk membaca token dari file token.txt
async function getTokens() {
  try {
    const data = await fs.readFile('token.txt', 'utf8');
    return data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  } catch (error) {
    console.error('Gagal membaca file token.txt:', error.message);
    return [];
  }
}

// Fungsi untuk melakukan klaim menggunakan token JWT
async function claimDaily(token, index) {
  try {
    const response = await axios.post('https://merits.blockscout.com/api/v1/user/daily/claim', null, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      console.log(`Klaim berhasil untuk token (urutan ${index}):`, response.data);
    } else {
      console.log(`Klaim gagal untuk token (urutan ${index}) dengan status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Terjadi kesalahan saat klaim untuk token (urutan ${index})`, error.message);
  }
}

// Fungsi untuk klaim semua token
async function claimAllTokens() {
  const tokens = await getTokens();
  
  if (tokens.length === 0) {
    console.log('Tidak ada token yang ditemukan di file token.txt');
    return;
  }

  for (let i = 0; i < tokens.length; i++) {
    console.log(`Memulai klaim untuk token (urutan ${i + 1})`);
    await claimDaily(tokens[i], i + 1);
  }

  console.log('Semua token telah diproses. Menunggu 24 jam untuk pengulangan berikutnya.');
}

// Fungsi untuk menampilkan countdown 24 jam dalam satu baris
async function countdown(hours) {
  let seconds = hours * 60 * 60;
  process.stdout.write('Menunggu 24 jam sebelum klaim ulang: ');

  while (seconds > 0) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    // Tampilkan waktu tersisa di baris yang sama
    process.stdout.write(`\rMenunggu ${hrs} jam ${mins} menit ${secs} detik sebelum klaim ulang.`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    seconds--;
  }

  console.log('\nCountdown selesai. Memulai klaim ulang...');
}

// Fungsi utama untuk menjalankan klaim secara berulang setiap 24 jam
async function startAutoClaim() {
  while (true) {
    await claimAllTokens();
    await countdown(24); // Countdown selama 24 jam
  }
}

// Memulai klaim otomatis
startAutoClaim();
