const express = require("express");
const router = express.Router();
const uploadFiles = require("./storage");

const validation = require("./controllers/validationController");
const testController = require("./controllers/testController");
const fileController = require("./controllers/fileController");
const templateController = require("./controllers/templateController");
const workflowController = require("./controllers/workflowController");
const archivedController = require("./controllers/archivedTests");
const presetController = require("./controllers/presetController");
const productController = require("./controllers/productController");
const branchController = require("./controllers/branchController");
const userController = require("./controllers/userController");
const mailController = require("./controllers/mailController");

// Tests
router.get("/tests/advanced-filters/", testController.advancedFilters);
router.post("/tests/", testController.addTest);
router.get("/tests/status/completed", testController.getCompletedTests);
router.get("/tests/status/pending", testController.getPendingTests);
router.get("/tests/:testId", testController.getTestByTestId);
router.get('/tests/date/:date', testController.getTestByDate);
router.put("/tests/:testId", testController.updateTest);
router.put("/tests/archive/:id", testController.archiveTest);
router.get("/tests/validated-releases/:days", validation.getValidatedReleases);

// Archived Tests
router.get("/tests/status/archived/", archivedController.getArchivedTests);
router.put("/tests/archived/restore/", archivedController.restoreArchivedTest);
router.delete("/tests/archived/:id", archivedController.deleteArchivedTest);
router.delete("/tests/archived/empty/", archivedController.emptyArchivedTests);


// Tests files
router.get("/tests/files/:id", fileController.getFiles);
router.delete("/tests/files/:testId/:fileId", fileController.removeFile);
router.put("/tests/files/:id", uploadFiles, fileController.uploadFilesToTest);

// Templates
router.get("/templates/template/product/:product", templateController.getTemplates);
router.post("/templates/template", templateController.addTemplate);
router.delete("/templates/template/:id", templateController.deleteTemplate);
router.post("/templates/template/duplicate/:id", templateController.duplicateTemplate);
router.put("/templates/template/:id", templateController.updateTemplate);

// Workflows
router.post("/workflows/:testId", workflowController.addWorkflow);
router.delete("/workflows/:testId/:workflowId", workflowController.deleteWorkflow);
router.put("/workflows/:testId/:workflowId", workflowController.duplicateWorkflow);
router.put("/workflows/update/:testId/:workflowId", workflowController.updateWorkflow);
router.put("/workflows/update-on-cascade/:testId/:workflowId", workflowController.updateWorkflowsOnCascade);
router.put("/workflows/update-info/:testId/:workflowId", workflowController.updateWorkflowInfo);


// Presets
router.get("/presets/", presetController.getPresets);
router.post("/presets/", presetController.addPreset);
router.delete("/presets/:id", presetController.deletePreset);
router.put("/presets/", presetController.updatePreset);
router.post("/presets/duplicate/:id", presetController.duplicatePreset);

// Products
router.get("/products/", productController.getProducts);
router.post("/products/", productController.addProduct);
router.delete("/products/:id", productController.deleteProduct);
router.put("/products/", productController.updateProduct);

// Branches
router.get("/branches/", branchController.getBranches);
router.post("/branches/", branchController.addBranch);
router.delete("/branches/:id", branchController.deleteBranch);
router.put("/branches/", branchController.updateBranch);

// Users
router.get("/users/", userController.getUsers);
router.post("/users/", userController.addUser);
router.delete("/users/:id", userController.deleteUser);
router.put("/users/", userController.updateUser);

// Mails
router.get("/mails/", mailController.getMails);
router.post("/mails/", mailController.addMail);
router.delete("/mails/:id", mailController.deleteMail);
router.put("/mails/", mailController.updateMail);

module.exports = router;
