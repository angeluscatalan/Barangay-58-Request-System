const path = require('path');
const fs = require('fs-extra');
const { PDFDocument, rgb } = require('pdf-lib'); // Import rgb for drawing rectangles
const JSZip = require('jszip');
const { fromBuffer } = require('file-type');
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

// Helper function to get template path based on certificate type
const getTemplatePath = (certificateType) => {
    const templateMap = {
        'ClearanceCert': 'clearance.pdf',
        'IndigencyCert': 'indigency.pdf',
        'JobseekerCert': 'jobseeker.pdf',
        'IDApp': 'brgyid.pdf',
        'BrgyCert': 'certificate.pdf',
        'Undertaking': 'undertaking.pdf'
    };

    const templateFile = templateMap[certificateType];
    if (!templateFile) {
        throw new Error('Invalid certificate type');
    }

    return path.join(__dirname, '../templates/certificates', templateFile);
};


// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Helper function to format name with proper handling of optional fields
const formatName = (requestData) => {
    let name = `${requestData.last_name}, ${requestData.first_name}`;
    if (requestData.middle_name) name += ` ${requestData.middle_name}`;
    if (requestData.suffix && requestData.suffix !== 'None') name += ` ${requestData.suffix}`;
    return name.trim();
};

// Helper function to calculate age
const calculateAge = (birthday) => {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

// Helper function to clean address
const cleanAddress = (rawAddress) => {
    if (!rawAddress) return '';
    return rawAddress
        .split(',')
        .map(part => part.trim())
        .filter(part => part && part.toLowerCase() !== 'undefined')
        .join(', ');
};

// Helper function to get image from S3
const getImageFromS3 = async (s3Key) => {
  try {
    if (!s3Key) throw new Error('No S3 key provided');
    
    console.log(`Fetching image from S3: ${s3Key}`);
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key
    });
    
    const { Body } = await s3Client.send(command);
    const imageBytes = await Body.transformToByteArray();
    
    if (!imageBytes || imageBytes.length === 0) {
      throw new Error('Empty image data received from S3');
    }
    
    return imageBytes;
  } catch (error) {
    console.error('Error fetching image from S3:', error);
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
};

const embedImageInPdf = async (pdfDoc, imageBytes) => {
  try {
    // First try to embed as JPEG (most common format)
    try {
      return await pdfDoc.embedJpg(imageBytes);
    } catch (jpegError) {
      // console.log('Not a JPEG, trying PNG...'); // Removed for conciseness
    }
    
    // Then try to embed as PNG
    try {
      return await pdfDoc.embedPng(imageBytes);
    } catch (pngError) {
      // console.log('Not a PNG either, trying to determine type...'); // Removed for conciseness
    }
    
    // Fallback to file-type detection (if needed)
    const { fileTypeFromBuffer } = await import('file-type');
    const fileType = await fileTypeFromBuffer(imageBytes);
    
    if (fileType) {
      if (fileType.mime === 'image/png') {
        return await pdfDoc.embedPng(imageBytes);
      } else if (fileType.mime === 'image/jpeg') {
        return await pdfDoc.embedJpg(imageBytes);
      }
    }
    
    throw new Error('Unsupported image format');
  } catch (error) {
    console.error('Error embedding image:', error);
    throw new Error(`Image embedding failed: ${error.message}`);
  }
};

// Helper to fit text in a PDF field with max font size, using widget rectangle for width
const fitTextToField = (field, value, pdfDoc, maxFontSize = 12, minFontSize = 7) => {
    // Get the widget annotation rectangle to determine field width
    let width = 150; // Default fallback width
    try {
        const widget = field.acroField.getWidgets()[0];
        if (widget && widget.getRectangle) {
            const rect = widget.getRectangle();
            if (rect && rect[2] > rect[0]) {
                width = rect[2] - rect[0];
            }
        }
    } catch (e) {
        // Fallback to default width if widget/rectangle is missing
    }
    let fontSize = maxFontSize;
    const font = pdfDoc.getForm().getDefaultFont();
    // Estimate text width: average char width * fontSize * value.length
    while (fontSize > minFontSize) {
        const estimatedWidth = value.length * fontSize * 0.6;
        if (estimatedWidth < width - 2) break;
        fontSize--;
    }
    field.setFontSize(fontSize);
    field.setText(value);
};

// Main controller function to generate PDF
exports.generatePDF = async (req, res) => {
    try {
        const { requestData } = req.body;
        console.log('Received request data:', requestData);

        // Get the template path
        const templatePath = getTemplatePath(requestData.type_of_certificate);
        console.log('Using template:', templatePath);

        // Check if template exists
        if (!await fs.exists(templatePath)) {
            console.log('Template not found at path:', templatePath);
            return res.status(404).json({
                error: 'Template not found. Please ensure all templates are properly set up.'
            });
        }

        // Read the template
        const templateBytes = await fs.readFile(templatePath);

        // Load the PDF document
        const pdfDoc = await PDFDocument.load(templateBytes);
        const form = pdfDoc.getForm();

        // Debug: Log all available fields
        console.log('=== PDF FORM FIELDS ===');
        const fields = form.getFields();
        fields.forEach(field => {
            console.log(`- ${field.getName()} (${field.constructor.name})`);
        });

        // Get current date
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Create different field mappings for each certificate type
        const fieldMappings = {
            'IndigencyCert': {
                'date': formattedDate,
                'address': cleanAddress(requestData.address),
                'purpose_of_request': requestData.purpose_of_request,
                'day': currentDate.getDate().toString(),
                'month': currentDate.toLocaleString('default', { month: 'long' }),
                'year': currentDate.getFullYear().toString(),
                'full_name': formatName(requestData),
                'age': calculateAge(requestData.birthday).toString()
            },
            'JobseekerCert': {
                'full_name': formatName(requestData),
                'address': cleanAddress(requestData.address),
                'month': currentDate.toLocaleString('default', { month: 'long' }),
                'day': currentDate.getDate().toString(),
                'age': calculateAge(requestData.birthday).toString()
            },
            'IDApp': {
                'full_name': formatName(requestData)
            },
            'BrgyCert': {
                'full_name': formatName(requestData),
                'age': calculateAge(requestData.birthday).toString(),
                'address': cleanAddress(requestData.address),
                'purpose_of_request': requestData.purpose_of_request,
                'day': currentDate.getDate().toString(),
                'month': currentDate.toLocaleString('default', { month: 'long' }),
                'year': currentDate.getFullYear().toString(),
                'date': formattedDate
            },
            // Default mapping (for other certificate types)
            'ClearanceCert': {
                'Text9': formattedDate,
                'Text10': formatName(requestData),
                'Text12': cleanAddress(requestData.address),
                'Text15': requestData.purpose_of_request,
                'Text16': currentDate.getDate().toString(),
                'Text17': currentDate.toLocaleString('default', { month: 'long' }),
                'Text19': currentDate.getFullYear().toString()
            }
        };

        // Get the appropriate mapping based on certificate type
        const mappingToUse = fieldMappings[requestData.type_of_certificate] || fieldMappings.default;

        console.log('Attempting to fill fields:', mappingToUse);

        // Fill the text fields
        Object.entries(mappingToUse).forEach(([fieldName, value]) => {
            try {
                const field = form.getTextField(fieldName);
                if (field) {
                    // Clamp font size for name and address fields
                    if (fieldName.toLowerCase().includes('name') || fieldName.toLowerCase().includes('address')) {
                        fitTextToField(field, value, pdfDoc, 12, 7);
                    } else {
                        field.setText(value);
                    }
                    // Remove border from the widget
                    const widget = field.acroField.getWidgets()[0];
                    if (widget) {
                        widget.dict.delete('Border');
                        widget.dict.delete('BS');
                    }
                    console.log(`✓ Filled ${fieldName} with: ${value} and removed borders`);
                } else {
                    console.log(`✗ Field not found: ${fieldName}`);
                }
            } catch (error) {
                console.error(`Error filling ${fieldName}:`, error.message);
            }
        });

        // Handle image embedding for ClearanceCert
        console.log('Checking for image embedding:', {
            certificateType: requestData.type_of_certificate,
            hasS3Key: !!requestData.s3_key,
            s3Key: requestData.s3_key
        });
        
        if ((requestData.type_of_certificate === 'ClearanceCert' || requestData.type_of_certificate === 'IDApp') && requestData.s3_key) {
    try {
        console.log(`Processing image for ${requestData.type_of_certificate}...`);
        
        // Fetch the image from S3
        const imageBytes = await getImageFromS3(requestData.s3_key);
        console.log(`Successfully fetched image from S3, size: ${imageBytes.length} bytes`);
        
        // Embed the image in the PDF
        const image = await embedImageInPdf(pdfDoc, imageBytes);
        console.log(`Successfully embedded image, dimensions: ${image.width}x${image.height}`);
        
        // Get the first page
        const page = pdfDoc.getPages()[0];
        
        // Different positions for different certificate types
        let imagePosition;
        let imageFieldName;
        
        if (requestData.type_of_certificate === 'ClearanceCert') {
            imagePosition = {
                x: 202.8,
                y: 581,
                width: 76.581,
                height: 74.110
            };
            imageFieldName = 'pic_af_image';
        } else if (requestData.type_of_certificate === 'IDApp') {
            // Adjust these coordinates to match your ID template
            imagePosition = {
                x: 114,  // Example position - adjust as needed
                y: 233,  // Example position - adjust as needed
                width: 201,  // Example size - adjust as needed
                height: 205  // Example size - adjust as needed
            };
            imageFieldName = 'pic_af_image';  // This should match your ID template's image field name
        }
        
        // Calculate adjusted y-coordinate (PDF coordinates start from bottom)
        const adjustedY = page.getHeight() - imagePosition.y - imagePosition.height;
        
        // Draw the image on the page
        page.drawImage(image, {
            x: imagePosition.x,
            y: adjustedY,
            width: imagePosition.width,
            height: imagePosition.height
        });
        
        console.log(`Drew image at: x=${imagePosition.x}, y=${adjustedY}, width=${imagePosition.width}, height=${imagePosition.height}`);
        
        // Try to remove the field completely
        try {
            const imageField = form.getField(imageFieldName);
            if (imageField) {
                form.removeField(imageField);
                console.log('Successfully removed image field');
            }
        } catch (removeError) {
            console.log('Could not remove field:', removeError.message);
        }
        
        // Add a debug rectangle to verify position
        page.drawRectangle({
            x: imagePosition.x,
            y: adjustedY,
            width: imagePosition.width,
            height: imagePosition.height,
            opacity: 0
        });
        
    } catch (imageError) {
        console.error('Image processing failed:', imageError);
    }
}

        // Finalize the form
        // form.updateFieldAppearances(); // Removed as low-level manipulation handles appearance
        form.flatten(); // This will apply the current state of fields to the page content
        const mainPdfBytes = await pdfDoc.save();

        // Handle Jobseeker certificate with undertaking
        if (requestData.type_of_certificate === 'JobseekerCert') {
            const undertakingPath = getTemplatePath('Undertaking');
            console.log('Undertaking path resolved to:', undertakingPath);

            if (!await fs.exists(undertakingPath)) {
                console.log('Undertaking template not found at path:', undertakingPath);
                return res.status(404).json({
                    error: 'Undertaking template not found.'
                });
            }

            console.log('✅ Undertaking template found, reading file...');
            const undertakingBytes = await fs.readFile(undertakingPath);
            const undertakingDoc = await PDFDocument.load(undertakingBytes);
            const undertakingForm = undertakingDoc.getForm();

            // Field mappings for undertaking.pdf
            const undertakingFields = {
                'full_name': formatName(requestData),
                'address': cleanAddress(requestData.address),
                'years': calculateAge(requestData.birthday).toString()
            };

            Object.entries(undertakingFields).forEach(([fieldName, value]) => {
                const field = undertakingForm.getTextField(fieldName);
                if (field) {
                    field.setText(value);
                    // Remove borders
                    const widget = field.acroField.getWidgets()[0];
                    if (widget) {
                        widget.dict.delete('Border');
                        widget.dict.delete('BS');
                    }
                }
            });

            undertakingForm.updateFieldAppearances();
            undertakingForm.flatten();
            const undertakingPdfBytes = await undertakingDoc.save();

            // ========== ADD DEBUGGING HERE ==========
            console.log('Main PDF size:', mainPdfBytes.length, 'bytes');
            console.log('Undertaking PDF size:', undertakingPdfBytes.length, 'bytes');
            console.log(`Creating ZIP with:
                - ${requestData.type_of_certificate}_${requestData.last_name}.pdf (${mainPdfBytes.length} bytes)
                - Undertaking_${requestData.last_name}.pdf (${undertakingPdfBytes.length} bytes)`);

            const zip = new JSZip();
            zip.file(`${requestData.type_of_certificate}_${requestData.last_name}.pdf`, mainPdfBytes);
            zip.file(`Undertaking_${requestData.last_name}.pdf`, undertakingPdfBytes);

            try {
                const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
                console.log('ZIP file created successfully:', zipContent.length, 'bytes');

                res.setHeader('Content-Type', 'application/zip');
                res.setHeader('Content-Disposition', `attachment; filename=JobseekerDocuments_${requestData.last_name}.zip`);
                return res.send(zipContent);
            } catch (zipError) {
                console.error('Error creating ZIP file:', zipError);
                return res.status(500).json({
                    error: 'Failed to create ZIP file',
                    details: zipError.message
                });
            }
        }

        // For non-Jobseeker certificates
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${requestData.type_of_certificate}_${requestData.last_name}.pdf`);
        res.send(Buffer.from(mainPdfBytes));

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            error: 'Failed to generate PDF',
            details: error.message
        });
    }
};

