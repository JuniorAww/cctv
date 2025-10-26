import sequelize from '../db/index'

export const patch = async request => {
    const { table, id, key, value } = await request.json()
    
    const replacements = { id: Number(id) }
    replacements[key] = value
    console.log(table,id,key,value,replacements)
    try {
        const response = await sequelize.query(
            "UPDATE " + table + " SET " + key + " = :" + key + " WHERE id = :id",
            {
                replacements,
                type: sequelize.QueryTypes.UPDATE
            }
        )
        
        return sendJson(response)
    } catch (e) {
        return sendJson(e.toString())
    }    
}

export default {
    patch
}
