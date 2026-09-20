import {DataTypes} from 'sequelize';
import schema from './schema-v2.cjs';
import sequelize from '../config/db.js';
import * as legacy from './models/index.js';
const {tables,extensions}=schema(DataTypes);
const oldByTable=Object.fromEntries(Object.values(legacy).map(model=>[model.tableName,model]));
for(const [table,attrs] of Object.entries(extensions)) { Object.assign(oldByTable[table].rawAttributes,attrs); oldByTable[table].refreshAttributes(); }
export const db={...oldByTable};
for(const [table,attrs] of Object.entries(tables)) db[table]=sequelize.define(table,{id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},...attrs},{tableName:table});
legacy.User.prototype.toJSON=function(){const value={...this.get({plain:true})};delete value.password_hash;delete value.auth_user_id;return value;};
export {sequelize};
