const schema = require('../schema-v2.cjs');
module.exports = {
  async up(q,S) {
    const {tables,extensions}=schema(S);
    await q.sequelize.transaction(async transaction => {
      for (const [name,columns] of Object.entries(tables)) await q.createTable(name,{id:{type:S.INTEGER,primaryKey:true,autoIncrement:true,allowNull:false},...columns,created_at:{type:S.DATE,allowNull:false,defaultValue:S.fn('NOW')},updated_at:{type:S.DATE,allowNull:false,defaultValue:S.fn('NOW')}},{transaction});
      for (const [name,columns] of Object.entries(extensions)) for(const [key,value] of Object.entries(columns)) await q.addColumn(name,key,value,{transaction});
      for(const [table,fields] of [['leads',['status','created_at']],['quotes',['client_id','status']],['stored_files',['owner_type','owner_id']],['portfolio_entries',['status','published_at']],['appointments',['starts_at']],['audit_logs',['entity','entity_id']],['sessions',['expires_at']],['incomes',['work_order_id']],['purchases',['supplier_id']],['expenses',['purchase_id']]]) await q.addIndex(table,fields,{transaction});
      await q.sequelize.query('CREATE UNIQUE INDEX mold_file_version_unique ON mold_files (mold_id, file_type, version_number) WHERE stored_file_id IS NOT NULL',{transaction});
      const [roles] = await q.sequelize.query("SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated')",{transaction});
      const allTables = [...Object.keys(tables),...Object.keys(extensions),'roles','branches','permissions','role_permissions','vehicles','vehicle_brands','vehicle_models','vehicle_types','work_order_statuses','work_order_status_history','materials','material_categories','inventory_movements','technical_parts','molds','employees','products','product_categories','notifications','settings'];
      for(const table of new Set(allTables)) {
        await q.sequelize.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`,{transaction});
        for(const role of roles) await q.sequelize.query(`REVOKE ALL ON "${table}" FROM "${role.rolname}"`,{transaction});
      }
    });
  },
  async down(q,S) {
    const {tables,extensions}=schema(S);
    await q.sequelize.transaction(async transaction=>{
      await q.sequelize.query('DROP INDEX IF EXISTS mold_file_version_unique',{transaction});
      for(const [name,columns] of Object.entries(extensions).reverse()) for(const key of Object.keys(columns).reverse()) await q.removeColumn(name,key,{transaction});
      for(const name of Object.keys(tables).reverse()) await q.dropTable(name,{transaction});
    });
  }
};
