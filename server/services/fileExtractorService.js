import pdfParse from 'pdf-parse/lib/pdf-parse.js';

// Extracts raw text from a PDF memory buffer
export const extractTextFromPDF = async (buffer) => {
    try {
        const data = await pdfParse(buffer);

        // Slightly clean up the text (remove excessive empty newlines) to save API tokens
        let text = data.text.replace(/\n\s*\n/g, '\n');

        return text.trim();
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error(`Failed to extract text from the provided PDF file: ${error.message}`);
    }
};
