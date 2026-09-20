// Contrato inmutable de la migración V2. Cambios posteriores requieren otra migración.
module.exports = (S) => {
  const text = (n=255) => ({ type: S.STRING(n), allowNull: true });
  const req = (n=255) => ({ type: S.STRING(n), allowNull: false });
  const money = () => ({ type: S.DECIMAL(14,2), allowNull: false, defaultValue: 0 });
  const bool = (v=false) => ({ type: S.BOOLEAN, allowNull: false, defaultValue: v });
  const fk = (model, nullable=true) => ({ type: S.INTEGER, allowNull: nullable, references: { model, key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  const date = () => ({ type: S.DATE, allowNull: true });
  const json = (v={}) => ({ type: S.JSONB, allowNull: false, defaultValue: v });
  const tables = {
    sessions: { token_hash: { ...req(64), unique: true }, user_id: fk('users',false), expires_at: { type: S.DATE, allowNull:false }, provider_session: text(10000) },
    leads: { name:req(120), email:text(150), phone:text(50), client_type:{...req(20),defaultValue:'individual'}, vehicle_description:text(), service:text(100), message:{type:S.TEXT,allowNull:false}, status:{...req(30),defaultValue:'new'}, source:{...req(30),defaultValue:'web'}, assigned_user_id:fk('users'), next_contact_at:date(), client_id:fk('clients'), notes:{type:S.TEXT}, consent:bool() },
    suppliers: { name:req(180), contact_name:text(120), email:text(150), phone:text(50), tax_id:text(30), address:text(), notes:{type:S.TEXT}, is_active:bool(true) },
    purchases: { supplier_id:fk('suppliers',false), material_id:fk('materials',false), quantity:{type:S.DECIMAL(12,3),allowNull:false}, unit_cost:money(), total:money(), status:{...req(20),defaultValue:'ordered'}, received_at:date(), notes:{type:S.TEXT}, created_by_user_id:fk('users') },
    quotes: { code:{...req(50),unique:true}, client_id:fk('clients',false), vehicle_id:fk('vehicles'), lead_id:fk('leads'), parent_quote_id:fk('quotes'), version:{type:S.INTEGER,allowNull:false,defaultValue:1}, status:{...req(20),defaultValue:'draft'}, items:json([]), subtotal:money(), discount:money(), tax_rate:money(), total:money(), valid_until:{type:S.DATEONLY}, notes:{type:S.TEXT}, acceptance_note:{type:S.TEXT}, accepted_at:date(), work_order_id:fk('work_orders'), created_by_user_id:fk('users') },
    stored_files: { key:{...req(500),unique:true}, original_name:req(), mime_type:req(120), size:{type:S.INTEGER,allowNull:false}, provider:req(20), owner_type:req(40), owner_id:{type:S.INTEGER,allowNull:false}, created_by_user_id:fk('users') },
    portfolio_entries: { slug:{...req(180),unique:true}, title:req(180), service:req(100), vehicle_description:text(180), summary:{type:S.TEXT}, materials:text(500), work_order_id:fk('work_orders'), gallery:json([]), status:{...req(20),defaultValue:'draft'}, featured:bool(), consent:bool(), published_at:date(), created_by_user_id:fk('users') },
    appointments: { title:req(180), starts_at:{type:S.DATE,allowNull:false}, ends_at:date(), work_order_id:fk('work_orders'), client_id:fk('clients'), assigned_user_id:fk('users'), status:{...req(20),defaultValue:'scheduled'}, notes:{type:S.TEXT} },
    partner_movements: { partner:req(100), type:req(30), amount:money(), date:{type:S.DATEONLY,allowNull:false}, concept:req(180), notes:{type:S.TEXT}, created_by_user_id:fk('users'), voided_at:date() },
    audit_logs: { user_id:fk('users'), action:req(30), entity:req(60), entity_id:text(80), changes:json(), request_id:text(80) },
    outbox_messages: { lead_id:fk('leads'), recipient:req(150), subject:req(180), body:{type:S.TEXT,allowNull:false}, status:{...req(20),defaultValue:'draft'}, provider_id:text(), error:text(500), sent_at:date(), created_by_user_id:fk('users') },
  };
  const extensions = {
    users: { auth_user_id:{type:S.UUID,unique:true,allowNull:true} },
    clients: { company_kind:{...req(30),defaultValue:'other'}, payment_terms:text(), credit_limit:money() },
    work_orders: { assigned_user_id:fk('users'), mold_id:fk('molds'), labor_hours:money(), labor_hour_cost:money(), other_costs:money() },
    mold_files: { stored_file_id:fk('stored_files'), validation_status:{...req(20),defaultValue:'pending'}, scale:{...req(30),defaultValue:'1:1'}, validated_by_user_id:fk('users'), validated_at:date(), calibration_mm:{type:S.DECIMAL(12,2)}, validation_notes:{type:S.TEXT} },
    work_order_media: { stored_file_id:fk('stored_files') },
    incomes: { voided_at:date(), reversal_reason:text(500) },
    expenses: { supplier_id:fk('suppliers'), purchase_id:fk('purchases'), work_order_id:fk('work_orders'), voided_at:date(), reversal_reason:text(500) },
  };
  return { tables, extensions };
};
