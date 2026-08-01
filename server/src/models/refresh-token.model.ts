const RefreshTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    tokenHash: {
        type: String,
        required: true,
    },

    familyId: {
        type: String,
        required: true,
        index: true,
    },

    deviceInfo: String,
    ipAddress: String,

    lastUsedAt: {
    type: Date,
    default: Date.now,
},

    revoked: {
        type: Boolean,
        default: false,
    },

    expiresAt: Date,
});