function showElement(targetSelector, targetId1, targetId2) {
    const selector = document.getElementById(targetSelector);
    const element1 = document.getElementById(targetId1);
    const element2 = document.getElementById(targetId2);

    // Hide both divs initially
    element1.style.display = 'none';
    element2.style.display = 'none';

    // Show the selected div
    if (selector.value === 'A') {
        element1.style.display = 'block';
    } else if (selector.value === 'B') {
        element2.style.display = 'block';
    }
    ;
}

// Introduce globally available (x,y) coordinates and scaling factor for QR code placement, and a target file location variable
var qrX = 0.0;
var qrY = 0.0;
var qrScale = 1.0;
var targetFile = "";

//Listen to elements (buttons) used to initiate QR code creation for a click by user
document.getElementById('generate-mobilepay').addEventListener('click', async function () {
    const userInput = document.getElementById('qrInput-1').value;

    // Specify PDF-specific (x,y) coordinates and scaling for QR code placement
    qrX = 109;
    qrY = 111;
    qrScale = 0.4;
    targetFile = "assets/mobilepay_ohje_asiakkaalle_qrkoodilla.pdf";

    //Prevent creating anything if there is no input from user
    if (!userInput) {
        alert("Ole hyvä ja syötä jäsennumero!");
        return;
    }

    //Text to code into QR code & relative placement of user input
    const qrInput = "https://mobilepay.fi/Yrityksille/Maksulinkki/maksulinkki-vastaus?phone=54068&amount=10&comment=Kalenteri%20" + userInput + "&lock=1";

    // Generate QR code and draw it on the canvas
    const canvas = document.getElementById('qrCanvas');
    QRCode.toCanvas(canvas, qrInput, { width: 200 }, async function (error) {
        if (error) console.error(error);

        // Load the pre-existing PDF file
        const pdfBytes = await fetch(targetFile).then(res => res.arrayBuffer());
        await createPDF(pdfBytes, canvas.toDataURL('image/png'));
    });
});

//Listen to elements (buttons) used to initiate QR code creation for a click by user
document.getElementById('generate-verkkomyynti').addEventListener('click', async function () {
    const userInput = document.getElementById('qrInput-2').value;

    // Specify PDF-specific (x,y) coordinates and scaling for QR code placement
    qrX = 350;
    qrY = 274;
    qrScale = 0.9;
    targetFile = "assets/verkkomyyntikoodin-juliste-1.pdf";

    const valittuVaihtoehto = document.getElementById('verkkomyynti-style-selector').value;

    if (valittuVaihtoehto == 'A') {
        targetFile = "assets/verkkomyyntikoodin-juliste-1.pdf";
    } else if (valittuVaihtoehto == 'B') {
        targetFile = "assets/verkkomyyntikoodin-juliste-2.pdf";
    };

    //Prevent creating anything if there is no input from user
    if (!userInput) {
        alert("Ole hyvä ja syötä jäsennumero!");
        return;
    }

    //Text to code into QR code & relative placement of user input
    const qrInput = "https://www.adventtikalenteri.fi/osta/myyja/" + userInput + "/";

    // Generate QR code and draw it on the canvas
    const canvas = document.getElementById('qrCanvas');
    QRCode.toCanvas(canvas, qrInput, { width: 200 }, async function (error) {
        if (error) console.error(error);

        // Load the pre-existing PDF file
        const pdfBytes = await fetch(targetFile).then(res => res.arrayBuffer());
        await createPDF(pdfBytes, canvas.toDataURL('image/png'));
    });
});

//Asynchronous function used to create the PDF when necessary
async function createPDF(existingPdfBytes, qrImageData) {
    const { PDFDocument } = PDFLib;

    // Load the existing PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPage(0); // Modify the first page or choose another

    // Embed the QR code image
    const pngImage = await pdfDoc.embedPng(qrImageData);
    const pngDims = pngImage.scale(qrScale); // Scale as needed

    // Draw the QR code on the PDF (adjust position as needed)
    page.drawImage(pngImage, {
        x: qrX,
        y: page.getHeight() - pngDims.height - qrY,
        width: pngDims.width,
        height: pngDims.height,
    });

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Kalenterimyyntijuliste.pdf'; //File name of downloaded PDF
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

