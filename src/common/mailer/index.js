import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
  service: process.env.MAIL_UER,
  auth: {
    user: process.env.MAIL_UER,
    pass: process.env.MAIL_SECRET,
  },
})

export default transporter
