import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

try {
  await sequelize.authenticate();
  console.log('✅ Connected to the database!');
} catch (error) {
  console.error('❌ Unable to connect to the database:', error);
} finally {
  await sequelize.close();
}
