import { DataTypes, Model } from '@sequelize/core'

export default class User extends Model {
	static init(sequelize) {
		return super.init({
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
			name: { type: DataTypes.STRING, allowNull: true },
      avatar: { type: DataTypes.STRING, allowNull: true },
			limits: { type: DataTypes.JSON, defaultValue: {} },
			// Лимит: кол-во приглашений (при role = 0 нельзя, role = 1 макс. 3 приглашения)
		}, {
			sequelize,
			modelName: 'User',
			timestamps: false
		})
	}
	
	static associate(models) {
    User.hasOne(models.WebAccount, { foreignKey: 'userId' });
    User.hasOne(models.TelegramAccount, { foreignKey: 'userId' });
    User.belongsToMany(models.Group, { through: models.GroupUser, as: 'groups', foreignKey: 'userId', otherKey: 'groupId' })
    User.hasMany(models.Invite, { foreignKey: 'creatorId', as: 'creator' })
    User.hasMany(models.Session, { foreignKey: 'userId' })
	}
}
