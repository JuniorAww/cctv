import { DataTypes, Model } from '@sequelize/core'

export default class Session extends Model {
	static init(sequelize) {
		return super.init({
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
			name: { type: DataTypes.STRING, allowNull: true },
      expiresAt: { type: DataTypes.INTEGER, allowNull: false },
      disabled: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
			history: { type: DataTypes.JSON, defaultValue: [] },
		}, {
			sequelize,
			modelName: 'Session',
		})
	}
	
	static associate(models) {
		Session.belongsTo(models.User, { foreignKey: 'userId' })
	}
}
