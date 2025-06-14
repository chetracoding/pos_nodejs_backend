import mongoose from 'mongoose'

export default async function initDb() {
  console.log('-----------> Connecting to database, please wait... <-----------')

  try {
    await mongoose.connect(process.env.MONGOOSE_URL, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    })

    console.log('-----------> Database is connected <-----------')
  } catch (error) {
    throw new Error(error)
  }
}
