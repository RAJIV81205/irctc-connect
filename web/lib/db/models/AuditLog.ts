import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  statusCode: {
    type: Number,
    required: true,
  },
  path: {
    type: String,
    required: true,
    trim: true,
  },
  ip: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    enum: ['SDK', 'API'],
    required: true,
    default: 'API',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
