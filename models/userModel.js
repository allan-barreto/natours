const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The field "name" is required'],
    trim: true,
    maxlength: [40, 'A name must have less ou equal then 40 characters'],
    minlength: [1, 'A name must have more ou equal then 40 characters'],
  },
  email: {
    type: String,
    required: [true, 'The field "e-mail" is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid e-mail'],
  },
  photo: { type: String },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'The field "password" is required'],
    minlength: [8, 'A password must have more ou equal then 8 characters'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: true,
    validate: {
      validator: function (el) {
        // THIS ONLY WORKS ON .CREATE OR .SAVE!
        return el === this.password;
      },
      message: 'Passwords must be the same',
    },
  },
  passwordChangedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  active: { type: Boolean, default: true, select: false },
});

userSchema.pre('save', async function (next) {
  //only runs if the password was modify
  if (!this.isModified('password')) return next();
  //hashing the password
  this.password = await bcrypt.hash(this.password, 12);
  //delete confirmPassword field
  this.confirmPassword = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 1000 * 60 * 10;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
