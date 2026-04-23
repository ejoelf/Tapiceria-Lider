import { useEffect, useMemo, useState } from "react";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import SimpleTable from "../../components/ui/SimpleTable";
import StatelessMessage from "../../components/ui/StatelessMessage";
import Toolbar from "../../components/ui/Toolbar";
import { createEmployeeRequest, getEmployeesRequest } from "../../services/employeesService";
import "./EmployeesPage.css";

const initialForm = {
  branch_id: 1,
  linked_user_id: "",
  first_name: "",
  last_name: "",
  document_number: "",
  email: "",
  phone: "",
  address: "",
  position: "",
  hire_date: "",
  salary_reference: "",
  notes: "",
};

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadEmployees() {
    try {
      setLoading(true);
      const response = await getEmployeesRequest();
      setEmployees(response?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar los empleados."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchableText = [
        employee.first_name,
        employee.last_name,
        employee.position,
        employee.email,
        employee.phone,
        employee.document_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search.toLowerCase());
    });
  }, [employees, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createEmployeeRequest({
        ...form,
        branch_id: form.branch_id ? Number(form.branch_id) : null,
        linked_user_id: form.linked_user_id ? Number(form.linked_user_id) : null,
        salary_reference: form.salary_reference ? Number(form.salary_reference) : 0,
      });

      setSuccess("Empleado creado correctamente.");
      setForm(initialForm);
      setOpenModal(false);
      await loadEmployees();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear el empleado."
      );
    }
  };

  const columns = [
    {
      key: "name",
      label: "Empleado",
      render: (row) => `${row.first_name || ""} ${row.last_name || ""}`.trim() || "-",
    },
    {
      key: "position",
      label: "Puesto",
      render: (row) => row.position || "-",
    },
    {
      key: "email",
      label: "Email",
      render: (row) => row.email || "-",
    },
    {
      key: "phone",
      label: "Teléfono",
      render: (row) => row.phone || "-",
    },
    {
      key: "hire_date",
      label: "Ingreso",
      render: (row) => row.hire_date || "-",
    },
    {
      key: "salary_reference",
      label: "Salario ref.",
      render: (row) =>
        `$${Number(row.salary_reference || 0).toLocaleString("es-AR")}`,
    },
  ];

  return (
    <div className="employees-page">
      <PageHeader
        title="Empleados"
        description="Administrá la información del equipo de trabajo."
        actionLabel="Nuevo empleado"
        onAction={() => setOpenModal(true)}
      />

      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre, puesto, email o DNI..."
      />

      {error ? <StatelessMessage type="error">{error}</StatelessMessage> : null}
      {success ? <StatelessMessage type="success">{success}</StatelessMessage> : null}

      {loading ? (
        <StatelessMessage>Cargando empleados...</StatelessMessage>
      ) : (
        <SimpleTable
          columns={columns}
          rows={filteredEmployees}
          emptyText="No se encontraron empleados con esos filtros."
        />
      )}

      <Modal
        open={openModal}
        title="Crear empleado"
        onClose={() => setOpenModal(false)}
      >
        <form className="employees-form" onSubmit={handleSubmit}>
          <div className="employees-form__grid">
            <div className="employees-form__field">
              <label>Sucursal</label>
              <input name="branch_id" value={form.branch_id} onChange={handleChange} />
            </div>

            <div className="employees-form__field">
              <label>ID usuario vinculado</label>
              <input
                name="linked_user_id"
                value={form.linked_user_id}
                onChange={handleChange}
              />
            </div>

            <div className="employees-form__field">
              <label>Nombre</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} required />
            </div>

            <div className="employees-form__field">
              <label>Apellido</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} required />
            </div>

            <div className="employees-form__field">
              <label>DNI</label>
              <input
                name="document_number"
                value={form.document_number}
                onChange={handleChange}
              />
            </div>

            <div className="employees-form__field">
              <label>Email</label>
              <input name="email" value={form.email} onChange={handleChange} />
            </div>

            <div className="employees-form__field">
              <label>Teléfono</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>

            <div className="employees-form__field">
              <label>Puesto</label>
              <input name="position" value={form.position} onChange={handleChange} />
            </div>

            <div className="employees-form__field">
              <label>Fecha de ingreso</label>
              <input type="date" name="hire_date" value={form.hire_date} onChange={handleChange} />
            </div>

            <div className="employees-form__field">
              <label>Salario referencia</label>
              <input
                name="salary_reference"
                value={form.salary_reference}
                onChange={handleChange}
              />
            </div>

            <div className="employees-form__field employees-form__field--full">
              <label>Dirección</label>
              <input name="address" value={form.address} onChange={handleChange} />
            </div>

            <div className="employees-form__field employees-form__field--full">
              <label>Notas</label>
              <textarea name="notes" rows="4" value={form.notes} onChange={handleChange} />
            </div>
          </div>

          <div className="employees-form__actions">
            <button type="button" className="employees-form__secondary" onClick={() => setOpenModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="employees-form__primary">
              Guardar empleado
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EmployeesPage;