import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import { TrainerVerification } from '../models/index.js';

export const verifyDocument = async (verificationId, documentUrl) => {
  try {
    // Download and preprocess image
    const response = await fetch(documentUrl);
    const buffer = await response.arrayBuffer();
    
    // Enhance image for OCR
    const processedImage = await sharp(Buffer.from(buffer))
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();

    // Perform OCR
    const { data: { text } } = await Tesseract.recognize(processedImage);
    
    // Extract key information
    const extractedData = extractDocumentData(text);
    
    // Validate based on document type
    const verification = await TrainerVerification.findByPk(verificationId);
    const validationResult = validateDocument(verification.document_type, extractedData);
    
    // Update verification record
    await verification.update({
      ai_confidence_score: validationResult.confidence,
      status: validationResult.confidence > 0.8 ? 'ai_reviewed' : 'additional_docs_required',
      extracted_data: extractedData
    });

    return validationResult;
  } catch (error) {
    console.error('AI Verification error:', error);
    throw error;
  }
};

const extractDocumentData = (text) => {
  // Extract common fields from OCR text
  const patterns = {
    name: /name[:\s]+([A-Za-z\s]+)/i,
    certificationNumber: /(?:certification|license|number)[:\s#]+([A-Z0-9-]+)/i,
    issueDate: /(?:issued?|date)[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    expiryDate: /(?:expir(?:y|ation)|valid until)[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    issuingOrganization: /(?:issued by|organization|institution)[:\s]+([A-Za-z\s]+)/i
  };

  const extracted = {};
  for (const [field, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) {
      extracted[field] = match[1].trim();
    }
  }

  return extracted;
};

const validateDocument = (documentType, extractedData) => {
  let confidence = 0;
  const checks = [];

  // Check for required fields based on document type
  switch (documentType) {
    case 'certification':
      checks.push(
        !!extractedData.certificationNumber,
        !!extractedData.issueDate,
        !!extractedData.issuingOrganization
      );
      break;
    case 'insurance':
      checks.push(
        !!extractedData.certificationNumber,
        !!extractedData.expiryDate
      );
      break;
    case 'id_proof':
      checks.push(
        !!extractedData.name
      );
      break;
  }

  // Calculate confidence score
  confidence = checks.filter(Boolean).length / checks.length;

  return {
    confidence,
    isValid: confidence > 0.6,
    missingFields: checks.map((check, idx) => !check ? idx : null).filter(Boolean)
  };
};