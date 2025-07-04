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

function generateQRCode() {
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

    document.getElementById('qr-code').innerHTML = '';
    const qrCode = new QRCode(document.getElementById('qr-code'), {
        text: url,
        width: 200,
        height: 200,
        colorDark: patternColor,
        colorLight: bgColor,
        correctLevel: QRCode.CorrectLevel.H
    });

    // Apply pattern and corner styles (simplified for QRCode.js compatibility)
    // Note: QRCode.js has limited support for patterns and corners, so we simulate with CSS or canvas
    const canvas = document.getElementById('qr-code').querySelector('canvas');
    if (patternType === 'dots') {
        canvas.style.borderRadius = '10%';
    } else if (patternType === 'rounded') {
        canvas.style.borderRadius = '20%';
    }

    // Add logo if provided
    if (logo) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const ctx = canvas.getContext('2d');
                const logoSize = 40;
                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;
                ctx.drawImage(img, x, y, logoSize, logoSize);
            };
        };
        reader.readAsDataURL(logo);
    }

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
    const qrCard = document.getElementById('qr-card');
    html2canvas(qrCard).then(canvas => {
        let link = document.createElement('a');
        link.download = `qrcode.${format}`;
        if (format === 'svg') {
            // SVG export requires additional handling (not natively supported by html2canvas)
            alert('SVG export is not fully supported in this demo.');
        } else {
            link.href = canvas.toDataURL(`image/${format}`);
            link.click();
        }
    });
}
