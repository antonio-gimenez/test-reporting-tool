const { ScheduledTest } = require("../models/testModel");

const deleteWorkflow = async (req, res) => {
    const { testId, workflowId } = req.params;

    if (!testId) return res.status(400).send({ message: "No testId provided" });
    if (!workflowId) return res.status(400).send({ message: "No workflowId provided" });

    try {
        const scheduledTest = await ScheduledTest.findOne({ _id: testId });
        if (!scheduledTest) return res.status(404).send({ message: `Test not found` });
        const workflowToDelete = scheduledTest.workflows.find((workflow) => workflow._id == workflowId);
        if (!workflowToDelete) return res.status(404).send({ message: `Workflow not found` });

        scheduledTest.workflows = scheduledTest.workflows.filter((workflow) => workflow._id != workflowId);
        await scheduledTest.save();
        return res.status(200).send(scheduledTest);
    } catch (error) {
        res.status(400).send(error);
    }
};

const duplicateWorkflow = async (req, res) => {
    const { testId, workflowId } = req.params;

    if (!testId) return res.status(400).send({ message: "No testId provided" });
    if (!workflowId) return res.status(400).send({ message: "No workflowId provided" });

    try {
        const scheduledTest = await ScheduledTest.findOne({ _id: testId });
        if (!scheduledTest) return res.status(404).send({ message: "Test not found" });
        const workflowToDuplicate = scheduledTest.workflows.find((workflow) => workflow._id == workflowId);
        if (!workflowToDuplicate) return res.status(404).send({ message: "Workflow not found" });

        const workflowIndex = scheduledTest.workflows.findIndex((workflow) => workflow._id == workflowId);
        if (workflowIndex < 0 || workflowIndex >= scheduledTest.workflows.length)
            return res.status(404).send({ message: "Workflow not found, index out of bounds" });
        // The new workflow will have the same data as the duplicated workflow except for the _id
        const newWorkflow = { ...workflowToDuplicate.toObject() };
        delete newWorkflow._id;

        // Push the new workflow to the next index after the duplicated workflow
        console.log(workflowIndex)
        scheduledTest.workflows.splice(workflowIndex + 1, 0, newWorkflow);

        await scheduledTest.save();

        res.status(200).send(newWorkflow);
    } catch (error) {
        res.status(400).send(error);
    }
};


const updateWorkflowInfo = async (req, res) => {
    const { testId, workflowId } = req.params;

    if (!testId) return res.status(400).send({ message: "No testId provided" });
    if (!workflowId) return res.status(400).send({ message: "No workflowId provided" });
    const { workflowName, workflowDescription } = req.body;
    try {
        const scheduledTest = await ScheduledTest.findOne({ _id: testId });
        if (!scheduledTest) return res.status(404).send({ message: "Test not found" });
        const workflowToUpdate = scheduledTest.workflows.find((workflow) => workflow._id == workflowId);
        if (!workflowToUpdate) return res.status(404).send({ message: "Workflow not found" });

        const workflowUpdated = await ScheduledTest.findOneAndUpdate(
            { _id: testId, "workflows._id": workflowId },
            { $set: { "workflows.$.workflowName": workflowName ?? workflowToUpdate.workflowName, "workflows.$.workflowDescription": workflowDescription ?? workflowToUpdate.workflowDescription } },
            { new: true }
        );

        if (!workflowUpdated) return res.status(404).send({ message: "Workflow not found" });
        res.status(200).send({ message: "Workflow updated", workflow: workflowUpdated });
    } catch (error) {
        res.status(500).send({ message: "Internal server error", details: error.message });
    }
}

const updateWorkflow = async (req, res) => {
    const { testId, workflowId } = req.params;

    const { field, value } = req.body;

    if (!field) return res.status(400).send({ message: "No field provided" });
    if (!testId) return res.status(400).send({ message: "No testId provided" });
    if (!workflowId) return res.status(400).send({ message: "No workflowId provided" });



    try {
        const scheduledTest = await ScheduledTest.findOne({ _id: testId });
        if (!scheduledTest) return res.status(404).send({ message: "Test not found" });
        const workflowToUpdate = scheduledTest.workflows.find((workflow) => workflow._id == workflowId);
        if (!workflowToUpdate) return res.status(404).send({ message: "Workflow not found" });

        const workflowIndex = scheduledTest.workflows.findIndex((workflow) => workflow._id == workflowId);
        if (workflowIndex < 0 || workflowIndex >= scheduledTest.workflows.length)
            return res.status(404).send({ message: "Workflow not found, index out of bounds" });

        const workflowUpdated = await ScheduledTest.findOneAndUpdate(
            { _id: testId, "workflows._id": workflowId },
            { $set: { [`workflows.$.${field}`]: value ?? '' } },
            { new: true }
        );

        if (!workflowUpdated) return res.status(404).send({ message: "Workflow not found" });
        res.status(200).send({ message: "Workflow updated", workflow: workflowUpdated });

    } catch (error) {
        res.status(500).send({ message: "Internal server error", details: error.message });
    }
}


const updateWorkflowsOnCascade = async (req, res) => {
    const { testId, workflowId } = req.params;

    const { field, value } = req.body;


    if (!testId) return res.status(400).send({ message: "No testId provided" });
    if (!workflowId) return res.status(400).send({ message: "No workflowId provided" });
    if (!field) return res.status(400).send({ message: "No field provided" });

    try {
        const scheduledTest = await ScheduledTest.findOne({ _id: testId });
        if (!scheduledTest) return res.status(404).send({ message: "Test not found" });
        const startingWorkflow = scheduledTest.workflows?.find((workflow) => workflow._id == workflowId);
        if (!startingWorkflow) return res.status(404).send({ message: "Workflow not found" });

        const workflowsToUpdate = scheduledTest.workflows.filter((workflow) => workflow._id >= workflowId);

        if (!workflowsToUpdate) res.status(404).send({ message: "Workflows not found" });

        workflowsToUpdate.forEach(async (workflow) => {
            await ScheduledTest.findOneAndUpdate(
                { _id: testId, "workflows._id": workflow._id },
                { $set: { [`workflows.$.${field}`]: value ?? '' } },
                { new: true }
            );

        });
        res.status(200).send({ message: "Workflows updated", workflows: workflowsToUpdate });

    } catch (error) {
        res.status(500).send({ message: "Internal server error", details: error.message });
    }

}


const addWorkflow = async (req, res) => {
    const { testId } = req.params;

    const { workflowName, workflowDescription } = req.body;
    if (!testId) return res.status(400).send({ message: "No testId provided" });

    try {

        const scheduledTest = await ScheduledTest.findOne({ _id: testId });
        if (!scheduledTest) return res.status(404).send({ message: "Test not found" });


        const newWorkflow = {
            workflowName: workflowName ?? "New Workflow",
            workflowDescription: workflowDescription ?? "New Workflow Description",
        };

        if (!scheduledTest.workflows) scheduledTest.workflows = [];
        scheduledTest.workflows.push(newWorkflow);

        await scheduledTest.save();

        res.status(200).send(newWorkflow);


    } catch (error) {
        res.status(500).send({ message: "Internal server error", details: error.message });
    }
}



module.exports = {
    addWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    updateWorkflow,
    updateWorkflowInfo,
    updateWorkflowsOnCascade
}