import * as crypto from "crypto";
import * as fs from "fs";

// Function to encrypt the password
function encryptPassword(password: string): string {
    const key = crypto.randomBytes(32); // 32 bytes for AES-256
    const iv = crypto.randomBytes(16); // 16 bytes for AES block size

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(password, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Returning both the IV and the encrypted password for later decryption
    return `${iv.toString('hex')}:${encrypted}`;
}

// Function to create RDP file
export function createRdpFile(
  username: string,
  address: string,
  password: string,
  filePath: string
): void {
  const encryptedPassword = encryptPassword(password);

  const rdpContent = `
    screen mode id:i:2
    use multimon:i:0
    desktopwidth:i:1920
    desktopheight:i:1080
    session bpp:i:32
    winposstr:s:0,3,0,0,800,600
    full address:s:${address}
    compression:i:1
    keyboardhook:i:2
    audiocapturemode:i:0
    videoplaybackmode:i:1
    connection type:i:2
    networkautodetect:i:1
    bandwidthautodetect:i:1
    displayconnectionbar:i:1
    enableworkspacereconnect:i:0
    disable wallpaper:i:0
    allow font smoothing:i:0
    allow desktop composition:i:0
    disable full window drag:i:1
    disable menu anims:i:1
    disable themes:i:0
    disable cursor setting:i:0
    bitmapcachepersistenable:i:1
    use multimon:i:0
    audiomode:i:0
    redirectprinters:i:1
    redirectcomports:i:0
    redirectsmartcards:i:1
    redirectclipboard:i:1
    redirectposdevices:i:0
    autoreconnection enabled:i:1
    authentication level:i:2
    prompt for credentials:i:0
    negotiate security layer:i:1
    remoteapplicationmode:i:0
    alternate shell:s:
    shell working directory:s:
    gatewayhostname:s:
    gatewayusagemethod:i:4
    gatewaycredentialssource:i:4
    gatewayprofileusagemethod:i:0
    promptcredentialonce:i:1
    gatewaybrokeringtype:i:0
    username:s:${username}
    password 51:b:${encryptedPassword}
    `;

  fs.writeFileSync(filePath, rdpContent.trim());
  console.log(`RDP file created at ${filePath}`);
}
