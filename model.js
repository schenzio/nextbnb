import { Sequelize, Model, DataTypes } from 'sequelize'
import bcrypt from 'bcrypt'

//initialize a Sequelize instance passing the data to access our db = connection to postgres db with our secret token stored in .env.local
const sequelize = new Sequelize(process.env.POSTGRES_CONNECTION, {
  dialect: 'postgres',
  logging: false
  //We also disable logging, because it can be very verbose as it logs all the SQL queries, which we don’t really need to look at 
  //(unless you’re debugging a problem)
})


/*
create a model for our users table, describing the data it contains and the rules we want to apply. In this case, we disable null, 
to always require an email and password
*/
class User extends Model {}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    session_token: {
      type: DataTypes.STRING
    },
    session_expiration: {
      type: DataTypes.DATEONLY
    }
  },
  {
    sequelize,
    modelName: 'user', //tablename 
    timestamps: false,
    hooks: {
        beforeCreate: async (user) => {
          const saltRounds = 10
          const salt = await bcrypt.genSalt(saltRounds)
          user.password = await bcrypt.hash(user.password, salt)
        }
      }
  }
)
User.prototype.isPasswordValid = async function (password) {
    return await bcrypt.compare(password, this.password)
  }

class House extends Sequelize.Model {}

House.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        picture: { type: Sequelize.DataTypes.STRING, allowNull: false},
        type: { type: Sequelize.DataTypes.STRING, allowNull: false },
        town: { type: Sequelize.DataTypes.STRING, allowNull: false },
        title: { type: Sequelize.DataTypes.STRING, allowNull: false },
        price: { type: Sequelize.DataTypes.INTEGER, allowNull: false },
        owner: { type: Sequelize.DataTypes.INTEGER, allowNull: false } 
    },
    {
        sequelize,
        modelName: 'house',
        timestamps: false
    }
)


class Booking extends Sequelize.Model {}

Booking.init(
  {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    houseId: { type: Sequelize.DataTypes.INTEGER, allowNull: false },
    userId: { type: Sequelize.DataTypes.INTEGER, allowNull: false },
    startDate: { type: Sequelize.DataTypes.DATEONLY, allowNull: false },
    endDate: { type: Sequelize.DataTypes.DATEONLY, allowNull: false },
    paid: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
    sessionId: { type: Sequelize.DataTypes.STRING }
  },
  {
    sequelize,
    modelName: 'booking',
    timestamps: true
  }
)


User.sync({ alter: true }) //the alter: true option makes sure tables are updated when we change the model
House.sync({ alter: true })
Booking.sync({ alter: true })

export { sequelize, User, House, Booking }
