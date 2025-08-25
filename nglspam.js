// File: multiTargetSpamNGL_termux_full.js
import fetch from "node-fetch";
import readline from "readline";
import fs from "fs";
import path from "path";

// Warna ANSI
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// Array warna untuk tiap target (akan berulang)
const targetColors = [
  colors.cyan,
  colors.magenta,
  colors.yellow,
  colors.green,
  colors.blue,
  colors.white,
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ======== Fungsi spam NGL ========
async function spamngl(link, pesan, jumlah, delayMs, color) {
  const username = link.split("https://ngl.link/")[1];
  if (!username) throw new Error("❌ Username tidak ditemukan dari link");

  console.log(`\n${color}🌸 Mulai spam ke: @${username} 🌸${colors.reset}\n`);

  for (let i = 0; i < jumlah; i++) {
    try {
      await fetch("https://ngl.link/api/submit", {
        method: "POST",
        headers: {
          accept: "*/*",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: `username=${username}&question=${encodeURIComponent(
          pesan
        )}&deviceId=1`,
      });
      console.log(
        `${colors.green}✅ [${i + 1}/${jumlah}] Pesan terkirim:${colors.reset} "${pesan}" (delay: ${delayMs}ms)`
      );
      await delay(delayMs);
    } catch (err) {
      console.error(
        `${colors.red}❌ [${i + 1}/${jumlah}] Gagal kirim:${colors.reset} ${err.message}`
      );
    }
  }

  console.log(
    `\n${color}🎉 Selesai mengirim ${jumlah} pesan ke @${username} 🎉${colors.reset}\n`
  );
  console.log(`${colors.yellow}══════════════════════════════════════════${colors.reset}\n`);
}

// ======== Menu Info ========
async function showInfo() {
  console.log(`\n${colors.yellow}╔══════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}║           ℹ️ SCRIPT INFO          ║${colors.reset}`);
  console.log(`${colors.yellow}╚══════════════════════════════════╝${colors.reset}`);
  console.log(`${colors.cyan}Nama Script  : Multi-Target Spam NGL Termux${colors.reset}`);
  console.log(`${colors.cyan}Versi        : 1.1${colors.reset}`);
  console.log(`${colors.cyan}Deskripsi    : Mengirim spam pesan ke link NGL dengan jumlah dan delay sesuai input.${colors.reset}`);
  console.log(`${colors.cyan}Instruksi    : Pilih Start Spam, masukkan link, jumlah, pesan, dan delay.${colors.reset}`);
  console.log(`${colors.yellow}══════════════════════════════════${colors.reset}\n`);
  await mainMenu();
}

// ======== Flow spam ========
async function startSpamFlow() {
  const linkInput = await new Promise((resolve) =>
    rl.question(`${colors.blue}Masukkan link NGL target (pisahkan koma jika lebih dari 1): ${colors.reset}`, resolve)
  );
  const links = linkInput.split(",").map((l) => l.trim());

  const jumlahStr = await new Promise((resolve) =>
    rl.question(`${colors.blue}Jumlah pesan per link: ${colors.reset}`, resolve)
  );
  const jumlah = parseInt(jumlahStr);

  const pesan = await new Promise((resolve) =>
    rl.question(`${colors.blue}Pesan yang ingin dikirim: ${colors.reset}`, resolve)
  );

  const delayStr = await new Promise((resolve) =>
    rl.question(`${colors.blue}Delay antar pesan (ms): ${colors.reset}`, resolve)
  );
  const delayMs = parseInt(delayStr);

  console.log(`\n${colors.magenta}🌼 Mulai proses spam... 🌼${colors.reset}\n`);

  for (let idx = 0; idx < links.length; idx++) {
    const link = links[idx];
    const color = targetColors[idx % targetColors.length];
    if (!link.startsWith("https://ngl.link/")) {
      console.log(`${colors.red}❌ Link tidak valid: ${link}${colors.reset}`);
      continue;
    }
    await spamngl(link, pesan, jumlah, delayMs, color);
  }

  await postMenu();
}

// ======== Backup ke GitHub ========
async function backupToGitHub() {
  const repo = await new Promise((resolve) =>
    rl.question(`${colors.blue}Masukkan GitHub repo (user/repo): ${colors.reset}`, resolve)
  );
  const branch = await new Promise((resolve) =>
    rl.question(`${colors.blue}Masukkan branch tujuan (default: main): ${colors.reset}`, resolve)
  );
  const token = await new Promise((resolve) =>
    rl.question(`${colors.blue}Masukkan Personal Access Token (PAT): ${colors.reset}`, resolve)
  );
  const filePath = await new Promise((resolve) =>
    rl.question(`${colors.blue}Masukkan path file yang mau di-backup: ${colors.reset}`, resolve)
  );
  const commitMessage = await new Promise((resolve) =>
    rl.question(`${colors.blue}Masukkan pesan commit: ${colors.reset}`, resolve)
  );

  try {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, { encoding: "base64" });

    let sha;
    const getResp = await fetch(`https://api.github.com/repos/${repo}/contents/${fileName}?ref=${branch || 'main'}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (getResp.status === 200) {
      const data = await getResp.json();
      sha = data.sha;
    }

    const putResp = await fetch(`https://api.github.com/repos/${repo}/contents/${fileName}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: commitMessage,
        content: content,
        branch: branch || "main",
        sha: sha,
      }),
    });

    if (putResp.status === 201 || putResp.status === 200) {
      console.log(`${colors.green}✅ Backup berhasil: ${fileName}${colors.reset}`);
    } else {
      const errData = await putResp.json();
      console.log(`${colors.red}❌ Backup gagal: ${errData.message}${colors.reset}`);
    }
  } catch (err) {
    console.error(`${colors.red}❌ Error backup: ${err.message}${colors.reset}`);
  }

  await mainMenu();
}

// ======== Menu utama ========
async function mainMenu() {
  console.log(`${colors.yellow}╔══════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}║   🌟 MULTI-TARGET SPAM NGL 🌟   ║${colors.reset}`);
  console.log(`${colors.yellow}╚══════════════════════════╝${colors.reset}`);
  console.log("1. Start Spam");
  console.log("2. Info");
  console.log("3. Backup ke GitHub");
  console.log("4. Exit");
  console.log("──────────────────────────────");

  const choice = await new Promise((resolve) =>
    rl.question(`${colors.blue}Pilih opsi (1/2/3/4): ${colors.reset}`, resolve)
  );

  switch (choice) {
    case "1":
      await startSpamFlow();
      break;
    case "2":
      await showInfo();
      break;
    case "3":
      await backupToGitHub();
      break;
    case "4":
      console.log(`${colors.green}👋 Keluar dari program. Sampai jumpa!${colors.reset}`);
      rl.close();
      process.exit(0);
      break;
    default:
      console.log(`${colors.red}❌ Pilihan tidak valid!${colors.reset}\n`);
      mainMenu();
      break;
  }
}

// ======== Menu setelah spam ========
async function postMenu() {
  console.log(`${colors.yellow}╔══════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}║     Pilihan Setelah Spam     ║${colors.reset}`);
  console.log(`${colors.yellow}╚══════════════════════════╝${colors.reset}`);
  console.log("1. Coba Lagi (langsung ke input link)");
  console.log("2. Exit");
  console.log("──────────────────────────────");

  const choice = await new Promise((resolve) =>
    rl.question(`${colors.blue}Pilih opsi (1/2): ${colors.reset}`, resolve)
  );

  switch (choice) {
    case "1":
      await startSpamFlow();
      break;
    case "2":
      console.log(`${colors.green}👋 Keluar dari program. Sampai jumpa!${colors.reset}`);
      rl.close();
      process.exit(0);
      break;
    default:
      console.log(`${colors.red}❌ Pilihan tidak valid!${colors.reset}\n`);
      postMenu();
      break;
  }
}

// Jalankan menu utama
mainMenu();
