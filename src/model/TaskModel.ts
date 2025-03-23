import mongoose from "mongoose";
import {TaskInterface} from "../types/SchemaType";
import {AppError} from "../util/AppError";
import {StatusCodes} from "../util/StatusCode";

let taskSchema
    = new mongoose.Schema<TaskInterface>({
    taskName: { type: String, required: true, index: true },
    description: { type: String, required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    completeDate: { type: Date, required: false },
    assignUser: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
    status: { type: Boolean, required: true, default: true, index: true },
    taskStatus: { type: String, required: true, enum:['pending', 'complete'], default: 'pending', index: true },
    createdAt: { type: Date, required: false, default: Date.now}
});

// Ensure endDate is after startDate
taskSchema.pre("save", function (next) {
    if (this.startDate > this.endDate) {
        return next(new AppError(
            "End date must be after start date",
            400,
            StatusCodes.VALIDATION_ERROR));
    }
    next();
});

// Auto update completeDate when taskStatus changes to complete
taskSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate() as any;

    // Check if taskStatus is being updated to "complete"
    if (update?.taskStatus === "complete" && !update?.completeDate) {
        update.completeDate = new Date();
    }

    this.setUpdate(update);

    next();
});

let TaskModel = mongoose.model('task',taskSchema);
export default TaskModel;