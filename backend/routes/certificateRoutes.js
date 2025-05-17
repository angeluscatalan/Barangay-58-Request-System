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

// Helper function to format name with proper handling of optional fields
const formatName = (requestData) => {
    let name = `${requestData.last_name}, ${requestData.first_name}`;
    if (requestData.middle_name) name += ` ${requestData.middle_name}`;
    if (requestData.suffix && requestData.suffix !== 'None') name += ` ${requestData.suffix}`;
    return name.trim();
};

// Generate PDF endpoint
router.post('/generate-pdf', async (req, res) => {
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

        const fieldMappings = {
            'Text9': formattedDate,                     
            'Text10': formatName(requestData),          
            'Text12': cleanAddress(requestData.address),         
            'Text15': requestData.purpose_of_request,   
            'Text16': currentDate.getDate().toString(), 
            'Text17': currentDate.toLocaleString('default', { month: 'long' }), 
            'Text19': currentDate.getFullYear().toString() 
        };


        console.log('Attempting to fill fields:', fieldMappings);

        // Fill the fields
        Object.entries(fieldMappings).forEach(([fieldName, value]) => {
            try {
                const field = form.getTextField(fieldName);
                if (field) {
                    field.setText(value);
                    console.log(`✓ Filled ${fieldName} with: ${value}`);
                } else {
                    console.log(`✗ Field not found: ${fieldName}`);
                }
            } catch (error) {
                console.error(`Error filling ${fieldName}:`, error.message);
            }
        });

     
        form.updateFieldAppearances();
        form.flatten();


        // Save the PDF
        const pdfBytes = await pdfDoc.save();

        // Send the PDF as response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${requestData.type_of_certificate}_${requestData.last_name}.pdf`);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ 
            error: 'Failed to generate PDF',
            details: error.message 
        });
    }
});

// Helper function to calculate age
function calculateAge(birthday) {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

const cleanAddress = (rawAddress) => {
    if (!rawAddress) return '';
    return rawAddress
        .split(',')
        .map(part => part.trim())
        .filter(part => part && part.toLowerCase() !== 'undefined')
        .join(', ');
};

module.exports = router;