// Ensure QRCodeStyling is loaded
if (!window.QRCodeStyling) {
    console.error('QRCodeStyling library not loaded. Please ensure qr-code-styling.js is included.');
    alert('QR code library failed to load. Please check the console and ensure qr-code-styling.js is included.');
    throw new Error('QRCodeStyling not loaded');
}

// Ensure html2canvas is loaded
if (!window.html2canvas) {
    console.error('html2canvas library not loaded. Please ensure html2canvas.js is included.');
    alert('html2canvas library failed to load. Please check the console.');
    throw new Error('html2canvas not loaded');
}

// Store QR code instance for reuse
let qrCodeInstance = null;

// Form submission
document.getElementById('qr-form').addEventListener('submit', function(e) {
    e.preventDefault();
    generateQRCode();
});

// Edit button
document.getElementById('edit-btn').addEventListener('click', function() {
    document.getElementById('qr-card').classList.add('hidden');
    document.getElementById('form-section').classList.remove('hidden');
});

// Color picker sync
document.getElementById('bg-color').addEventListener('input', function() {
    document.getElementById('bg-color-hex').value = this.value;
    checkContrast();
});

document.getElementById('pattern-color').addEventListener('input', function() {
    document.getElementById('pattern-color-hex').value = this.value;
    checkContrast();
});

document.getElementById('bg-color-hex').addEventListener('input', function() {
    const value = this.value.match(/^#[0-9A-Fa-f]{6}$/) ? this.value : '#ffffff';
    document.getElementById('bg-color').value = value;
    this.value = value;
    checkContrast();
});

document.getElementById('pattern-color-hex').addEventListener('input', function() {
    const value = this.value.match(/^#[0-9A-Fa-f]{6}$/) ? this.value : '#000000';
    document.getElementById('pattern-color').value = value;
    this.value = value;
    checkContrast();
});

// Contrast checker
function checkContrast() {
    const bgColor = document.getElementById('bg-color').value;
    const patternColor = document.getElementById('pattern-color').value;
    const contrastRatio = getContrastRatio(bgColor, patternColor);
    const warning = document.getElementById('contrast-warning');
    if (contrastRatio < 4.5) {
        warning.classList.remove('hidden');
    } else {
        warning.classList.add('hidden');
    }
}

function getContrastRatio(color1, color2) {
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const brighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (brighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// QR code generation
async function generateQRCode() {
    const url = document.getElementById('url').value;
    const bgColor = document.getElementById('bg-color').value;
    const patternColor = document.getElementById('pattern-color').value;
    const patternType = document.getElementById('pattern-type').value;
    const cornerFrame = document.getElementById('corner-frame').value;
    const cornerDot = document.getElementById('corner-dot').value;
    const logo = document.getElementById('logo').files[0];
    const bottomText = document.getElementById('bottom-text').value;

    if (!url) {
        alert('Please enter a valid URL');
        return;
    }

    try {
        // Configure QR code for display (smaller size for performance)
        qrCodeInstance = new QRCodeStyling({
            width: 300, // Display size
            height: 300,
            data: url,
            dotsOptions: {
                color: patternColor,
                type: patternType
            },
            backgroundOptions: {
                color: bgColor
            },
            cornersSquareOptions: {
                type: cornerFrame
            },
            cornersDotOptions: {
                type: cornerDot
            },
            image: logo ? URL.createObjectURL(logo) : undefined,
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 10,
                imageSize: 0.4
            }
        });

        // Clear previous QR code
        document.getElementById('qr-code').innerHTML = '';
        // Append QR code
        await qrCodeInstance.append(document.getElementById('qr-code'));

        // Add bottom text
        document.getElementById('qr-text').textContent = bottomText;

        // Show QR card
        document.getElementById('form-section').classList.add('hidden');
        document.getElementById('qr-card').classList.remove('hidden');
    } catch (error) {
        console.error('QR code generation failed:', error);
        alert('Failed to generate QR code. Please check the console for details.');
    }
}

// Export buttons
document.getElementById('export-jpeg').addEventListener('click', function() {
    exportQRCode('jpeg');
});

document.getElementById('export-png').addEventListener('click', function() {
    exportQRCode('png');
});

document.getElementById('export-svg').addEventListener('click', function() {
    exportQRCode('svg');
});

async function exportQRCode(format) {
    if (!qrCodeInstance) {
        alert('No QR code generated. Please generate a QR code first.');
        return;
    }

    try {
        if (format === 'svg') {
            // Reconfigure QR code for high-resolution export (600 DPI, 24 inches)
            const highResQRCode = new QRCodeStyling({
                width: 14400, // 24 inches * 600 DPI
                height: 14400,
                data: document.getElementById('url').value,
                dotsOptions: {
                    color: document.getElementById('pattern-color').value,
                    type: document.getElementById('pattern-type').value
                },
                backgroundOptions: {
                    color: document.getElementById('bg-color').value
                },
                cornersSquareOptions: {
                    type: document.getElementById('corner-frame').value
                },
                cornersDotOptions: {
                    type: document.getElementById('corner-dot').value
                },
                image: document.getElementById('logo').files[0] ? URL.createObjectURL(document.getElementById('logo').files[0]) : undefined,
                imageOptions: {
                    crossOrigin: "anonymous",
                    margin: 240, // Scaled proportionally: 10 * (14400/300)
                    imageSize: 0.4
                }
            });
            await highResQRCode.download({ name: "qrcode", extension: "svg" });
        } else {
            // For JPEG/PNG, use html2canvas with high scale
            const qrCard = document.getElementById('qr-code');
            const canvas = await html2canvas(qrCard, {
                scale: 48, // 14400/300 = 48x scaling for 600 DPI at 24 inches
                useCORS: true,
                backgroundColor: null
            });
            const link = document.createElement('a');
            link.download = `qrcode.${format}`;
            link.href = canvas.toDataURL(`image/${format}`, 1.0);
            link.click();
        }
    } catch (error) {
        console.error(`Export failed (${format}):`, error);
        alert(`Export failed for ${format.toUpperCase()}. Please check the console.`);
    }
}
