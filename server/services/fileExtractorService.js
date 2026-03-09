import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export const extractTextFromPDF = async (buffer) => {
    try {
        const data = await pdfParse(buffer);
        let text = data.text;

        text = text.replace(/\n\s*\n/g, '\n');

        text = text
            .replace(//g, '')
            .replace(/#/g, '')
            .replace(/§/g, '@')
            .replace(/•\s*/g, '- ');

        text = text
            .replace(/([a-zA-Z0-9])(19\d{2}|20\d{2})/g, '$1 $2')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/(\d+%)([A-Z])/g, '$1 $2');

        text = text
            .replace(/ {2,}/g, ' ')
            .replace(/\n\s*\n+/g, '\n\n')
            .trim();

        return text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error(`Failed to extract text from the provided PDF file: ${error.message}`);
    }
};