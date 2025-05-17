const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const { PDFDocument } = require('pdf-lib');

// Function to get template path based on certificate type
const getTemplatePath = (certificateType) => {
    const templateMap = {
        'ClearanceCert': 'clearance.pdf',
        'IndigencyCert': 'indigency.pdf',
        'JobseekerCert': 'jobseeker.pdf',
        'IDApp': 'id.pdf',
        'BrgyCert': 'certificate.pdf'
    };

    const templateFile = templateMap[certificateType];
    if (!templateFile) {
        throw new Error('Invalid certificate type');
    }

    return path.join(__dirname, '../templates/certificates', templateFile);
};

// Generate PDF endpoint
router.post('/generate-pdf', async (req, res) => {
    try {
        const { requestData } = req.body;
        console.log('Received request data:', requestData); // Log received data

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

        // Get the form fields
        const form = pdfDoc.getForm();

        // Log available form fields
        const fields = form.getFields();
        console.log('Available form fields:', fields.map(f => f.getName()));

        // Get current date parts
        const currentDate = new Date();
        const day = currentDate.getDate();
        const month = currentDate.toLocaleString('default', { month: 'long' });
        const year = currentDate.getFullYear();

        // Define fields based on certificate type
        let fieldsToFill = {};

        if (requestData.type_of_certificate === 'ClearanceCert') {
            fieldsToFill = {
                'date': currentDate.toLocaleDateString(),
                'name': `${requestData.last_name}, ${requestData.first_name} ${requestData.middle_name || ''} ${requestData.suffix || ''}`.trim(),
                'street': requestData.address,
                'purpose': requestData.purpose_of_request,
                'day': day.toString(),
                'month': month,
                'year': year.toString()
            };
        } else {
            // Handle other certificate types here when you have their templates
            fieldsToFill = {
                'full_name': `${requestData.last_name}, ${requestData.first_name} ${requestData.middle_name || ''} ${requestData.suffix || ''}`.trim(),
                'address': requestData.address,
                'purpose': requestData.purpose_of_request,
                'date': currentDate.toLocaleDateString()
            };
        }

        console.log('Attempting to fill fields:', fieldsToFill); // Log fields we're trying to fill

        // Fill in the form fields
        Object.entries(fieldsToFill).forEach(([fieldName, value]) => {
            try {
                console.log(`Attempting to fill field: ${fieldName} with value: ${value}`);
                const field = form.getTextField(fieldName);
                if (field) {
                    field.setText(value);
                    console.log(`Successfully filled field: ${fieldName}`);
                } else {
                    console.log(`Field not found: ${fieldName}`);
                }
            } catch (error) {
                console.error(`Error filling field ${fieldName}:`, error);
            }
        });

        // Save the PDF
        const pdfBytes = await pdfDoc.save();

        // Send the PDF as response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${requestData.type_of_certificate}_${requestData.last_name}.pdf`);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

module.exports = router; 