document.getElementById('qr-form').addEventListener('submit', function(e) {
    e.preventDefault();
    generateQRCode();
});

document.getElementById('edit-btn').addEventListener('click', function() {
    document.getElementById('qr-card').classList.add('hidden');
    document.getElementById('form-section').classList.remove('hidden');
});

document.getElementById('bg-color').addEventListener('input', function() {
    document.getElementById('bg-color-hex').value = this.value;
    checkContrast();
});

document.getElementById('pattern-color').addEventListener('input', function() {
    document.getElementById('pattern-color-hex').value = this.value;
    checkContrast();
});

document.getElementById('bg-color-hex').addEventListener('input', function() {
    document.getElementById('bg-color').value = this.value;
    checkContrast();
});

document.getElementById('pattern-color-hex').addEventListener('input', function() {
    document.getElementById('pattern-color').value = this.value;
    checkContrast();
});

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

    // Configure QR code with qrcode-styling
    const qrCode = new QRCodeStyling({
        width: 600, // High resolution for 300 DPI (2 inches)
        height: 600,
        data: url,
        dotsOptions: {
            color: patternColor,
            type: patternType // square, dots, rounded
        },
        backgroundOptions: {
            color: bgColor
        },
        cornersSquareOptions: {
            type: cornerFrame // square, extra-rounded
        },
        cornersDotOptions: {
            type: cornerDot // square, dot
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
    await qrCode.append(document.getElementById('qr-code'));

    // Add bottom text
    const qrText = document.getElementById('qr-text');
    qrText.textContent = bottomText;

    // Show QR card
    document.getElementById('form-section').classList.add('hidden');
    document.getElementById('qr-card').classList.remove('hidden');
}

document.getElementById('export-jpeg').addEventListener('click', function() {
    exportQRCode('jpeg');
});

document.getElementById('export-png').addEventListener('click', function() {
    exportQRCode('png');
});

document.getElementById('export-svg').addEventListener('click', function() {
    exportQRCode('svg');
});

function exportQRCode(format) {
    const qrCard = document.getElementById('qr-code');
    if (format === 'svg') {
        const qrCode = new QRCodeStyling({
            width: 600,
            height: 600,
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
            image: document.getElementById('logo').files[0] ? URL.createObjectURL(document.getElementById('logo').files[0]) : undefined
        });
        qrCode.download({ name: "qrcode", extension: "svg" });
    } else {
        html2canvas(qrCard, {
            scale: 2, // Increase scale for 300 DPI
            useCORS: true,
            backgroundColor: null
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `qrcode.${format}`;
            link.href = canvas.toDataURL(`image/${format}`, 1.0); // High quality
            link.click();
        }).catch(err => {
            console.error('Export failed:', err);
            alert('Export failed. Please try again.');
        });
    }
}
