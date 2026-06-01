import mongoose, { InferSchemaType, Model } from "mongoose";

const emailAttachmentSchema = new mongoose.Schema(
	{
		id: { type: String, default: null, trim: true },
		filename: { type: String, default: null, trim: true },
		contentType: { type: String, default: null, trim: true },
		contentDisposition: { type: String, default: null, trim: true },
		contentId: { type: String, default: null, trim: true },
	},
	{ _id: false }
);

const emailSchema = new mongoose.Schema(
	{
		deliveryId: { type: String, required: true, unique: true, index: true, trim: true },
		eventType: { type: String, required: true, index: true, trim: true },
		eventCreatedAt: { type: Date, required: true },
		emailId: { type: String, required: true, index: true, trim: true },
		emailCreatedAt: { type: Date, default: null },
		from: { type: String, required: true, trim: true },
		to: { type: [String], default: [] },
		cc: { type: [String], default: [] },
		bcc: { type: [String], default: [] },
		messageId: { type: String, default: null, index: true, trim: true },
		subject: { type: String, default: "", trim: true },
		attachments: { type: [emailAttachmentSchema], default: [] },
		rawPayload: { type: mongoose.Schema.Types.Mixed, required: true },
		verifiedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

export type EmailDocument = InferSchemaType<typeof emailSchema> & {
	_id: mongoose.Types.ObjectId;
};

const Email =
	(mongoose.models.Email as Model<EmailDocument>) ||
	mongoose.model<EmailDocument>("Email", emailSchema);

export default Email;
