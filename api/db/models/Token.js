import { DataTypes, Model } from '@sequelize/core'

export default class Token extends Model {
	static init(sequelize) {
		return super.init({
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
			name: { type: DataTypes.STRING, allowNull: false },
			data: { type: DataTypes.STRING, allowNull: false },
			access: { type: DataTypes.STRING, allowNull: true },
		}, {
			sequelize,
			modelName: 'Token',
			timestamps: false
		})
	}
	
	static associate(models) {}
}
