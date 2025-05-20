const path = require('path');
const fs = require('fs-extra');
const { PDFDocument } = require('pdf-lib');
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
    console.log(`Fetching image from S3: ${s3Key}`);
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key
    });
    
    const { Body } = await s3Client.send(command);
    return await Body.transformToByteArray();
  } catch (error) {
    console.error('Error fetching image from S3:', error);
    throw error;
  }
};

// Helper function to embed image into PDF
const embedImageInPdf = async (pdfDoc, imageBytes) => {
  try {
    const fileType = await fromBuffer(imageBytes);
    
    // Embed image based on detected mime type
    if (fileType.mime === 'image/png') {
      return await pdfDoc.embedPng(imageBytes);
    } else {
      return await pdfDoc.embedJpg(imageBytes);
    }
  } catch (error) {
    console.error('Error embedding image:', error);
    throw error;
  }
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
                    field.setText(value);

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
        
        if (requestData.type_of_certificate === 'ClearanceCert' && requestData.s3_key) {
            try {
                // Get the field for image
                console.log('Searching for pic_af_image field...');
                const allFields = form.getFields();
                const fieldNames = allFields.map(f => f.getName());
                console.log('Available fields:', fieldNames);
                
                // Try to get the button field specifically
                let imageField;
                try {
                    imageField = form.getButton('pic_af_image');
                    console.log('Image field found as button:', !!imageField);
                } catch (err) {
                    console.log('Error getting button field:', err.message);
                }
                
                // If not found as button, try other field types
                if (!imageField) {
                    try {
                        imageField = form.getField('pic_af_image');
                        console.log('Image field found as generic field:', !!imageField);
                    } catch (err) {
                        console.log('Error getting generic field:', err.message);
                    }
                }
                
                if (imageField) {
                    // Examine the field structure
                    try {
                        const fieldType = imageField.constructor.name;
                        console.log(`Field type: ${fieldType}`);
                        
                        const widget = imageField.acroField.getWidgets()[0];
                        if (widget) {
                            const rect = widget.getRectangle();
                            console.log('Widget rectangle:', rect);
                        } else {
                            console.log('No widgets found for the field');
                        }
                    } catch (err) {
                        console.log('Error examining field structure:', err.message);
                    }
                    
                    // Fetch the image from S3
                    const imageBytes = await getImageFromS3(requestData.s3_key);
                    console.log(`Successfully fetched image from S3, size: ${imageBytes.length} bytes`);
                    
                    // Embed the image in the PDF
                    const image = await embedImageInPdf(pdfDoc, imageBytes);
                    console.log(`Successfully embedded image, dimensions: ${image.width}x${image.height}`);
                    
                    // Get the button position and dimensions
                    const widget = imageField.acroField.getWidgets()[0];
                    const { x, y, width, height } = widget.getRectangle();
                    console.log(`Image will be placed at x:${x}, y:${y}, width:${width}, height:${height}`);
                    
                    // Draw the image on the page
                    const page = pdfDoc.getPages()[0];
                    page.drawImage(image, {
                        x,
                        y,
                        width,
                        height,
                        opacity: 1
                    });
                    
                    // Remove the original field
                    form.removeField('pic_af_image');
                    console.log('✅ Successfully embedded image and removed original field');
                } else {
                    console.log('⚠️ pic_af_image field not found using standard methods, trying alternative approach');
                    
                    // Try alternative approach: look for the field by iterating through all fields
                    const targetField = fields.find(f => f.getName() === 'pic_af_image');
                    if (targetField) {
                        console.log(`Found pic_af_image field as ${targetField.constructor.name}`);
                        
                        try {
                            // Fetch the image from S3
                            const imageBytes = await getImageFromS3(requestData.s3_key);
                            console.log(`Successfully fetched image from S3, size: ${imageBytes.length} bytes`);
                            
                            // Embed the image in the PDF
                            const image = await embedImageInPdf(pdfDoc, imageBytes);
                            console.log(`Successfully embedded image, dimensions: ${image.width}x${image.height}`);
                            
                            // Get the field's position
                            const widget = targetField.acroField.getWidgets()[0];
                            if (widget) {
                                const { x, y, width, height } = widget.getRectangle();
                                console.log(`Image will be placed at x:${x}, y:${y}, width:${width}, height:${height}`);
                                
                                // Draw the image on the page
                                const page = pdfDoc.getPages()[0];
                                page.drawImage(image, {
                                    x,
                                    y,
                                    width,
                                    height,
                                    opacity: 1
                                });
                                
                                // Remove the original field
                                form.removeField('pic_af_image');
                                console.log('✅ Successfully embedded image using alternative approach');
                            } else {
                                console.log('⚠️ No widget found for the pic_af_image field');
                            }
                        } catch (imageError) {
                            console.error('Alternative image embedding failed:', imageError);
                        }
                    } else {
                        console.log('⚠️ pic_af_image field not found by any method');
                    }
                }
            } catch (imageError) {
                console.error('Image embedding failed:', imageError);
            }
        }

        // Finalize the form
        form.updateFieldAppearances();
        form.flatten();
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