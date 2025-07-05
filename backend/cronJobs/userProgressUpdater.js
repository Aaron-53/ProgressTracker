const cron = require('node-cron');
const userController = require('../controllers/userController');

function userProgressCron() {
   cron.schedule('*/15 * * * *', async () => {
    console.log('⏰ Running addAllUsersProgress at', new Date().toLocaleString());

    try {
      await userController.addAllUsersProgress(
        {}, 
        {
          json: (data) => console.log('✅ Cron Result:', data),
          status: (code) => ({
            json: (data) => console.log(`❌ Cron Error ${code}:`, data),
          }),
        }
      );
    } catch (err) {
      console.error('Cron job failed:', err.message);
    }
  });
}

module.exports = userProgressCron;
