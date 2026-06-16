/**
 * local server entry file, for local development
 */
import app from './app.js';
import db from './database.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

const checkExpiredFoods = () => {
  const now = new Date().getTime()
  const foods = Array.from(db.foods.values())
  let expiredCount = 0

  foods.forEach((food) => {
    if (
      food.status !== 'claimed' &&
      food.status !== 'expired' &&
      food.status !== 'rejected'
    ) {
      const expiryTime = new Date(food.expiryDate).getTime()
      if (expiryTime < now) {
        db.updateFoodStatus(food.id, 'expired')
        expiredCount++
      }
    }
  })

  if (expiredCount > 0) {
    console.log(`[食品安全检测] 已自动下架 ${expiredCount} 件过期食物`)
  }
}

const FOOD_CHECK_INTERVAL = 60 * 60 * 1000

console.log('[系统] 食品安全自动检测已启动，每小时检测一次')
checkExpiredFoods()
setInterval(checkExpiredFoods, FOOD_CHECK_INTERVAL)

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;