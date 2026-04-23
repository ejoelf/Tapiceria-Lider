import Role from "./Role.js";
import Branch from "./Branch.js";
import User from "./User.js";
import Permission from "./Permission.js";
import RolePermission from "./RolePermission.js";
import Client from "./Client.js";
import VehicleBrand from "./VehicleBrand.js";
import VehicleModel from "./VehicleModel.js";
import Vehicle from "./Vehicle.js";
import VehicleType from "./VehicleType.js";
import WorkOrderStatus from "./WorkOrderStatus.js";
import WorkOrder from "./WorkOrder.js";
import WorkOrderStatusHistory from "./WorkOrderStatusHistory.js";
import WorkOrderMedia from "./WorkOrderMedia.js";
import MaterialCategory from "./MaterialCategory.js";
import Material from "./Material.js";
import InventoryMovement from "./InventoryMovement.js";
import TechnicalPart from "./TechnicalPart.js";
import Mold from "./Mold.js";
import MoldFile from "./MoldFile.js";
import Employee from "./Employee.js";
import ProductCategory from "./ProductCategory.js";
import Product from "./Product.js";
import Income from "./Income.js";
import Expense from "./Expense.js";
import Notification from "./Notification.js";
import Setting from "./Setting.js";

Role.hasMany(User, { foreignKey: "role_id", as: "users" });
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

Branch.hasMany(User, { foreignKey: "branch_id", as: "users" });
User.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "role_id",
  otherKey: "permission_id",
  as: "permissions",
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permission_id",
  otherKey: "role_id",
  as: "roles",
});
Role.hasMany(RolePermission, { foreignKey: "role_id", as: "role_permissions" });
RolePermission.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Permission.hasMany(RolePermission, { foreignKey: "permission_id", as: "role_permissions" });
RolePermission.belongsTo(Permission, { foreignKey: "permission_id", as: "permission" });

Branch.hasMany(Client, { foreignKey: "branch_id", as: "clients" });
Client.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

Client.hasMany(Vehicle, { foreignKey: "client_id", as: "vehicles" });
Vehicle.belongsTo(Client, { foreignKey: "client_id", as: "client" });

Branch.hasMany(Vehicle, { foreignKey: "branch_id", as: "vehicles" });
Vehicle.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

VehicleBrand.hasMany(VehicleModel, { foreignKey: "brand_id", as: "models" });
VehicleModel.belongsTo(VehicleBrand, { foreignKey: "brand_id", as: "brand" });

VehicleBrand.hasMany(Vehicle, { foreignKey: "brand_id", as: "vehicles" });
Vehicle.belongsTo(VehicleBrand, { foreignKey: "brand_id", as: "brand" });

VehicleModel.hasMany(Vehicle, { foreignKey: "model_id", as: "vehicles" });
Vehicle.belongsTo(VehicleModel, { foreignKey: "model_id", as: "model" });

Branch.hasMany(WorkOrder, { foreignKey: "branch_id", as: "work_orders" });
WorkOrder.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

Client.hasMany(WorkOrder, { foreignKey: "client_id", as: "work_orders" });
WorkOrder.belongsTo(Client, { foreignKey: "client_id", as: "client" });

Vehicle.hasMany(WorkOrder, { foreignKey: "vehicle_id", as: "work_orders" });
WorkOrder.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });

User.hasMany(WorkOrder, { foreignKey: "created_by_user_id", as: "created_work_orders" });
WorkOrder.belongsTo(User, { foreignKey: "created_by_user_id", as: "created_by_user" });

WorkOrderStatus.hasMany(WorkOrder, { foreignKey: "current_status_id", as: "work_orders" });
WorkOrder.belongsTo(WorkOrderStatus, { foreignKey: "current_status_id", as: "current_status" });

WorkOrder.hasMany(WorkOrderStatusHistory, { foreignKey: "work_order_id", as: "status_history" });
WorkOrderStatusHistory.belongsTo(WorkOrder, { foreignKey: "work_order_id", as: "work_order" });

WorkOrderStatus.hasMany(WorkOrderStatusHistory, { foreignKey: "previous_status_id", as: "previous_status_changes" });
WorkOrderStatusHistory.belongsTo(WorkOrderStatus, { foreignKey: "previous_status_id", as: "previous_status" });

WorkOrderStatus.hasMany(WorkOrderStatusHistory, { foreignKey: "new_status_id", as: "new_status_changes" });
WorkOrderStatusHistory.belongsTo(WorkOrderStatus, { foreignKey: "new_status_id", as: "new_status" });

User.hasMany(WorkOrderStatusHistory, { foreignKey: "changed_by_user_id", as: "status_changes" });
WorkOrderStatusHistory.belongsTo(User, { foreignKey: "changed_by_user_id", as: "changed_by_user" });

WorkOrder.hasMany(WorkOrderMedia, { foreignKey: "work_order_id", as: "media_items" });
WorkOrderMedia.belongsTo(WorkOrder, { foreignKey: "work_order_id", as: "work_order" });

User.hasMany(WorkOrderMedia, { foreignKey: "uploaded_by_user_id", as: "uploaded_work_order_media" });
WorkOrderMedia.belongsTo(User, { foreignKey: "uploaded_by_user_id", as: "uploaded_by_user" });

MaterialCategory.hasMany(Material, { foreignKey: "category_id", as: "materials" });
Material.belongsTo(MaterialCategory, { foreignKey: "category_id", as: "category" });

Branch.hasMany(Material, { foreignKey: "branch_id", as: "materials" });
Material.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

Material.hasMany(InventoryMovement, { foreignKey: "material_id", as: "inventory_movements" });
InventoryMovement.belongsTo(Material, { foreignKey: "material_id", as: "material" });

WorkOrder.hasMany(InventoryMovement, { foreignKey: "work_order_id", as: "inventory_movements" });
InventoryMovement.belongsTo(WorkOrder, { foreignKey: "work_order_id", as: "work_order" });

User.hasMany(InventoryMovement, { foreignKey: "created_by_user_id", as: "inventory_movements" });
InventoryMovement.belongsTo(User, { foreignKey: "created_by_user_id", as: "created_by_user" });

TechnicalPart.hasMany(Mold, { foreignKey: "technical_part_id", as: "molds" });
Mold.belongsTo(TechnicalPart, { foreignKey: "technical_part_id", as: "technical_part" });

VehicleBrand.hasMany(Mold, { foreignKey: "brand_id", as: "molds" });
Mold.belongsTo(VehicleBrand, { foreignKey: "brand_id", as: "brand" });

VehicleModel.hasMany(Mold, { foreignKey: "model_id", as: "molds" });
Mold.belongsTo(VehicleModel, { foreignKey: "model_id", as: "model" });

User.hasMany(Mold, { foreignKey: "created_by_user_id", as: "created_molds" });
Mold.belongsTo(User, { foreignKey: "created_by_user_id", as: "created_by_user" });

Mold.hasMany(MoldFile, { foreignKey: "mold_id", as: "files" });
MoldFile.belongsTo(Mold, { foreignKey: "mold_id", as: "mold" });

User.hasMany(MoldFile, { foreignKey: "uploaded_by_user_id", as: "uploaded_mold_files" });
MoldFile.belongsTo(User, { foreignKey: "uploaded_by_user_id", as: "uploaded_by_user" });

Branch.hasMany(Employee, { foreignKey: "branch_id", as: "employees" });
Employee.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

User.hasMany(Employee, { foreignKey: "linked_user_id", as: "employee_profiles" });
Employee.belongsTo(User, { foreignKey: "linked_user_id", as: "linked_user" });

ProductCategory.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(ProductCategory, { foreignKey: "category_id", as: "category" });

Branch.hasMany(Product, { foreignKey: "branch_id", as: "products" });
Product.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

Branch.hasMany(Income, { foreignKey: "branch_id", as: "incomes" });
Income.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

WorkOrder.hasMany(Income, { foreignKey: "work_order_id", as: "incomes" });
Income.belongsTo(WorkOrder, { foreignKey: "work_order_id", as: "work_order" });

User.hasMany(Income, { foreignKey: "created_by_user_id", as: "created_incomes" });
Income.belongsTo(User, { foreignKey: "created_by_user_id", as: "created_by_user" });

Branch.hasMany(Expense, { foreignKey: "branch_id", as: "expenses" });
Expense.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

User.hasMany(Expense, { foreignKey: "created_by_user_id", as: "created_expenses" });
Expense.belongsTo(User, { foreignKey: "created_by_user_id", as: "created_by_user" });

User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });

export {
  Role,
  Branch,
  User,
  Permission,
  RolePermission,
  Client,
  VehicleBrand,
  VehicleModel,
  Vehicle,
  VehicleType,
  WorkOrderStatus,
  WorkOrder,
  WorkOrderStatusHistory,
  WorkOrderMedia,
  MaterialCategory,
  Material,
  InventoryMovement,
  TechnicalPart,
  Mold,
  MoldFile,
  Employee,
  ProductCategory,
  Product,
  Income,
  Expense,
  Notification,
  Setting,
};