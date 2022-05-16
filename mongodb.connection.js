const mongoose = require('mongoose');

async function startMongoDB(server) {
  try {
    mongoose
      .connect(process.env.DB_URL, {
        dbName: process.env.DB_NAME,
        useNewUrlParser: true,
      })
      .then(() => console.log('🔥🔥🔥 MongoDB Connection Ready.'));

    mongoose.connection.on('connected', () =>
      console.log('🔥🔥🔥 Mongoose Connection Ready.')
    );

    mongoose.connection.on('error', (e) => console.log(`😢😢😢 ${e.message}`));

    mongoose.connection.on('disconnecting', () =>
      console.log('😢😢😢 Mongoose Connection Disconnected.')
    );

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      await server.close();
      process.exit(0);
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = startMongoDB;
