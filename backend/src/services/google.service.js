


const { google } = require('googleapis');
const path = require('path');
const logger = require('../utils/logger');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/drive.readonly'];
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');

// Initialize Google Auth
const getAuthClient = async () => {
    try {
        if (!fs.existsSync(CREDENTIALS_PATH)) {
            logger.warn('Google Credentials file not found at:', CREDENTIALS_PATH);
            return null;
        }

        const auth = new google.auth.GoogleAuth({
            keyFile: CREDENTIALS_PATH,
            scopes: SCOPES,
        });

        return await auth.getClient();
    } catch (error) {
        logger.error('Error loading Google Auth:', error);
        return null; // Fail gracefully if auth fails
    }
};

/**
 * Fetch data from a Google Sheet
 * @param {string} spreadsheetId 
 * @param {string} range 
 * @returns {Promise<Array<Array<string>>>} Rows of data
 */
const getSheetData = async (spreadsheetId, range) => {
    try {
        const authClient = await getAuthClient();
        if (!authClient) return [];

        const sheets = google.sheets({ version: 'v4', auth: authClient });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        return response.data.values || [];
    } catch (error) {
        logger.error('Error fetching Google Sheet data:', error);
        throw error;
    }
};

/**
 * Fetch Spreadsheet Metadata (to get sheet names)
 * @param {string} spreadsheetId 
 * @returns {Promise<Object>} Metadata
 */
const getSheetMetadata = async (spreadsheetId) => {
    try {
        const authClient = await getAuthClient();
        if (!authClient) return null;

        const sheets = google.sheets({ version: 'v4', auth: authClient });
        const response = await sheets.spreadsheets.get({
            spreadsheetId
        });

        return response.data;
    } catch (error) {
        logger.error('Error fetching Spreadsheet Metadata:', error);
        throw error;
    }
};

/**
 * Download a file from Google Drive
 * @param {string} fileId 
 * @returns {Promise<Buffer>} File buffer
 */
const downloadFile = async (fileId) => {
    try {
        const authClient = await getAuthClient();
        if (!authClient) return null;

        const drive = google.drive({ version: 'v3', auth: authClient });
        const response = await drive.files.get({
            fileId,
            alt: 'media',
        }, { responseType: 'arraybuffer' });

        return Buffer.from(response.data);
    } catch (error) {
        if (error.code === 404 || error.response?.status === 404) {
            logger.error(`Drive API 404: File ${fileId} not found. This usually means the Service Account does not have permission. Please SHARE the 'File responses' folder in Google Drive with: hrm-google-sync@hrms-484804.iam.gserviceaccount.com`);
            return null; // Return null to indicate download failed but handled
        }

        logger.error(`Error downloading file ${fileId} from Drive: [${error.code}] ${error.message}`);
        if (error.response && error.response.data) {
            try {
                const errorData = JSON.parse(Buffer.from(error.response.data).toString());
                logger.error('Drive API Error Details:', JSON.stringify(errorData));
            } catch (e) {
                logger.error('Drive API Raw Error Data:', error.response.data);
            }
        }
        throw error;
    }
};

/**
 * Extract File ID from Google Drive URL
 * @param {string} url 
 * @returns {string|null}
 */
const extractDriveFileId = (url) => {
    if (!url) return null;

    // Pattern 1: /d/FILE_ID/
    const match1 = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match1 && match1[1]) return match1[1];

    // Pattern 2: id=FILE_ID
    const match2 = url.match(/id=([a-zA-Z0-9-_]+)/);
    if (match2 && match2[1]) return match2[1];

    // Pattern 3: open?id=FILE_ID
    const match3 = url.match(/open\?id=([a-zA-Z0-9-_]+)/);
    if (match3 && match3[1]) return match3[1];

    // Pattern 4: just a long string which might be the ID itself (fallback)
    // Be careful not to match entire URLs if they don't fit above
    if (url.length > 20 && !url.includes('/')) return url;

    return null;
};

module.exports = {
    getSheetData,
    getSheetMetadata, // Added
    downloadFile,
    extractDriveFileId
};
