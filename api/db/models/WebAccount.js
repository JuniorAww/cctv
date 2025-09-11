import { DataTypes, Model } from '@sequelize/core'

export default class WebAccount extends Model {
	checkPassword(password) {
		return Bun.password.verify(password, this.password);
	}
	
	static init(sequelize) {
		return super.init({
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
			email: { type: DataTypes.STRING, allowNull: false },
			password: { type: DataTypes.STRING, allowNull: false }
			// + createdAt
		}, {
			sequelize,
			modelName: 'WebAccount',
			hooks: {
				beforeCreate: async user => {
					if(user.password) user.password = await Bun.password.hash(user.password);
				}
			},
			timestamps: false
		})
	}
	
	static associate(models) {
		WebAccount.belongsTo(models.User, { foreignKey: 'userId' })
	}
}
