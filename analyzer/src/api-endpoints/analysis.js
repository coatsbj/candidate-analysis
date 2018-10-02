/**
 * Registers the /subject endpoint for persisting entities
 * @param app
 */
export default (app) => {
    // Retrieve previous document analysis result
    app.get('/analysis/:id', (req, res) => {
        // blah blah grab the model and respond if found...
        res.status(503).send('not implemented');
    });

    // Attach a document to the subject...basically the same as below...
    app.post('/subject/:id/document', (req, res) => {});

    // Post a document to be analyzed...this is a full DTO here, with other params supplied about the document.
    app.post('/document', (req, res) => {});
};