import { useEffect, useMemo, useState } from "react";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import SearchBar from "../../components/ui/SearchBar";
import SectionCard from "../../components/ui/SectionCard";
import SimpleTable from "../../components/ui/SimpleTable";
import StatelessMessage from "../../components/ui/StatelessMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  createExpenseRequest,
  createIncomeRequest,
  getExpensesRequest,
  getIncomesRequest,
} from "../../services/financesService";
import "./FinancesPage.css";

const initialIncomeForm = {
  branch_id: 1,
  work_order_id: "",
  type: "payment",
  concept: "",
  amount: "",
  payment_method: "cash",
  notes: "",
};

const initialExpenseForm = {
  branch_id: 1,
  category: "general",
  concept: "",
  amount: "",
  payment_method: "cash",
  notes: "",
};

function FinancesPage() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchIncomes, setSearchIncomes] = useState("");
  const [searchExpenses, setSearchExpenses] = useState("");

  const [openIncomeModal, setOpenIncomeModal] = useState(false);
  const [openExpenseModal, setOpenExpenseModal] = useState(false);

  const [incomeForm, setIncomeForm] = useState(initialIncomeForm);
  const [expenseForm, setExpenseForm] = useState(initialExpenseForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [incomesResponse, expensesResponse] = await Promise.all([
        getIncomesRequest(),
        getExpensesRequest(),
      ]);

      setIncomes(incomesResponse?.data || []);
      setExpenses(expensesResponse?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar las finanzas."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredIncomes = useMemo(() => {
    const term = searchIncomes.trim().toLowerCase();
    if (!term) return incomes;

    return incomes.filter((row) =>
      [
        row.concept,
        row.type,
        row.payment_method,
        row.work_order?.code,
        row.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [incomes, searchIncomes]);

  const filteredExpenses = useMemo(() => {
    const term = searchExpenses.trim().toLowerCase();
    if (!term) return expenses;

    return expenses.filter((row) =>
      [
        row.concept,
        row.category,
        row.payment_method,
        row.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [expenses, searchExpenses]);

  const handleIncomeSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createIncomeRequest({
        ...incomeForm,
        branch_id: incomeForm.branch_id ? Number(incomeForm.branch_id) : null,
        work_order_id: incomeForm.work_order_id ? Number(incomeForm.work_order_id) : null,
        amount: Number(incomeForm.amount),
      });

      setSuccess("Ingreso creado correctamente.");
      setIncomeForm(initialIncomeForm);
      setOpenIncomeModal(false);
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear el ingreso."
      );
    }
  };

  const handleExpenseSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createExpenseRequest({
        ...expenseForm,
        branch_id: expenseForm.branch_id ? Number(expenseForm.branch_id) : null,
        amount: Number(expenseForm.amount),
      });

      setSuccess("Egreso creado correctamente.");
      setExpenseForm(initialExpenseForm);
      setOpenExpenseModal(false);
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear el egreso."
      );
    }
  };

  const incomeColumns = [
    {
      key: "concept",
      label: "Concepto",
      render: (row) => row.concept || "-",
    },
    {
      key: "type",
      label: "Tipo",
      render: (row) => <StatusBadge variant="success">{row.type || "-"}</StatusBadge>,
    },
    {
      key: "amount",
      label: "Monto",
      render: (row) => `$${Number(row.amount || 0).toLocaleString("es-AR")}`,
    },
    {
      key: "payment_method",
      label: "Medio",
      render: (row) => row.payment_method || "-",
    },
    {
      key: "work_order",
      label: "Orden",
      render: (row) => row.work_order?.code || "-",
    },
  ];

  const expenseColumns = [
    {
      key: "concept",
      label: "Concepto",
      render: (row) => row.concept || "-",
    },
    {
      key: "category",
      label: "Categoría",
      render: (row) => <StatusBadge variant="warning">{row.category || "-"}</StatusBadge>,
    },
    {
      key: "amount",
      label: "Monto",
      render: (row) => `$${Number(row.amount || 0).toLocaleString("es-AR")}`,
    },
    {
      key: "payment_method",
      label: "Medio",
      render: (row) => row.payment_method || "-",
    },
    {
      key: "notes",
      label: "Notas",
      render: (row) => row.notes || "-",
    },
  ];

  return (
    <div className="finances-page">
      <PageHeader
        title="Finanzas"
        description="Administrá ingresos y egresos del negocio."
      />

      {error ? <StatelessMessage type="error">{error}</StatelessMessage> : null}
      {success ? <StatelessMessage type="success">{success}</StatelessMessage> : null}

      <SectionCard
        title="Ingresos"
        actions={
          <div className="finances-page__toolbar">
            <button onClick={() => setOpenIncomeModal(true)}>Nuevo ingreso</button>
            <SearchBar
              value={searchIncomes}
              onChange={(e) => setSearchIncomes(e.target.value)}
              placeholder="Buscar ingresos..."
            />
          </div>
        }
      >
        {loading ? (
          <div className="finances-page__messages">
            <StatelessMessage>Cargando ingresos...</StatelessMessage>
          </div>
        ) : (
          <SimpleTable
            columns={incomeColumns}
            rows={filteredIncomes}
            emptyText="Todavía no hay ingresos cargados."
          />
        )}
      </SectionCard>

      <SectionCard
        title="Egresos"
        actions={
          <div className="finances-page__toolbar">
            <button onClick={() => setOpenExpenseModal(true)}>Nuevo egreso</button>
            <SearchBar
              value={searchExpenses}
              onChange={(e) => setSearchExpenses(e.target.value)}
              placeholder="Buscar egresos..."
            />
          </div>
        }
      >
        {loading ? (
          <div className="finances-page__messages">
            <StatelessMessage>Cargando egresos...</StatelessMessage>
          </div>
        ) : (
          <SimpleTable
            columns={expenseColumns}
            rows={filteredExpenses}
            emptyText="Todavía no hay egresos cargados."
          />
        )}
      </SectionCard>

      <Modal
        open={openIncomeModal}
        title="Crear ingreso"
        onClose={() => setOpenIncomeModal(false)}
      >
        <form className="finances-form" onSubmit={handleIncomeSubmit}>
          <div className="finances-form__grid">
            <div className="finances-form__field">
              <label>Sucursal</label>
              <input
                value={incomeForm.branch_id}
                onChange={(e) =>
                  setIncomeForm((prev) => ({ ...prev, branch_id: e.target.value }))
                }
              />
            </div>

            <div className="finances-form__field">
              <label>ID orden</label>
              <input
                value={incomeForm.work_order_id}
                onChange={(e) =>
                  setIncomeForm((prev) => ({ ...prev, work_order_id: e.target.value }))
                }
              />
            </div>

            <div className="finances-form__field">
              <label>Tipo</label>
              <input
                value={incomeForm.type}
                onChange={(e) =>
                  setIncomeForm((prev) => ({ ...prev, type: e.target.value }))
                }
              />
            </div>

            <div className="finances-form__field">
              <label>Concepto</label>
              <input
                value={incomeForm.concept}
                onChange={(e) =>
                  setIncomeForm((prev) => ({ ...prev, concept: e.target.value }))
                }
                required
              />
            </div>

            <div className="finances-form__field">
              <label>Monto</label>
              <input
                value={incomeForm.amount}
                onChange={(e) =>
                  setIncomeForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                required
              />
            </div>

            <div className="finances-form__field">
              <label>Medio de pago</label>
              <input
                value={incomeForm.payment_method}
                onChange={(e) =>
                  setIncomeForm((prev) => ({
                    ...prev,
                    payment_method: e.target.value,
                  }))
                }
              />
            </div>

            <div className="finances-form__field finances-form__field--full">
              <label>Notas</label>
              <textarea
                rows="4"
                value={incomeForm.notes}
                onChange={(e) =>
                  setIncomeForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="finances-form__actions">
            <button
              type="button"
              className="finances-form__secondary"
              onClick={() => setOpenIncomeModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="finances-form__primary">
              Guardar ingreso
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openExpenseModal}
        title="Crear egreso"
        onClose={() => setOpenExpenseModal(false)}
      >
        <form className="finances-form" onSubmit={handleExpenseSubmit}>
          <div className="finances-form__grid">
            <div className="finances-form__field">
              <label>Sucursal</label>
              <input
                value={expenseForm.branch_id}
                onChange={(e) =>
                  setExpenseForm((prev) => ({ ...prev, branch_id: e.target.value }))
                }
              />
            </div>

            <div className="finances-form__field">
              <label>Categoría</label>
              <input
                value={expenseForm.category}
                onChange={(e) =>
                  setExpenseForm((prev) => ({ ...prev, category: e.target.value }))
                }
              />
            </div>

            <div className="finances-form__field">
              <label>Concepto</label>
              <input
                value={expenseForm.concept}
                onChange={(e) =>
                  setExpenseForm((prev) => ({ ...prev, concept: e.target.value }))
                }
                required
              />
            </div>

            <div className="finances-form__field">
              <label>Monto</label>
              <input
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                required
              />
            </div>

            <div className="finances-form__field">
              <label>Medio de pago</label>
              <input
                value={expenseForm.payment_method}
                onChange={(e) =>
                  setExpenseForm((prev) => ({
                    ...prev,
                    payment_method: e.target.value,
                  }))
                }
              />
            </div>

            <div className="finances-form__field finances-form__field--full">
              <label>Notas</label>
              <textarea
                rows="4"
                value={expenseForm.notes}
                onChange={(e) =>
                  setExpenseForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="finances-form__actions">
            <button
              type="button"
              className="finances-form__secondary"
              onClick={() => setOpenExpenseModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="finances-form__primary">
              Guardar egreso
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default FinancesPage;