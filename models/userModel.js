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
});

userSchema.pre('save', async function (next) {
  //only runs if the password was modify
  if (!this.isModified('password')) return next();
  //hashing the password
  this.password = await bcrypt.hash(this.password, 10);
  //delete confirmPassword field
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
