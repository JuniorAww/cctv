import { DataTypes, Model } from '@sequelize/core'

export default class TelegramAccount extends Model {
	static init(sequelize) {
		return super.init({
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
			telegramId: { type: DataTypes.INTEGER, allowNull: false },
            data: { type: DataTypes.STRING, allowNull: false }
		}, {
			sequelize,
			modelName: 'TelegramAccount',
			timestamps: false
		})
	}
	
	static associate(models) {
		TelegramAccount.belongsTo(models.User, { foreignKey: 'userId' })
	}
}
