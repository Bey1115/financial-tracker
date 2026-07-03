import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import CutoffTabs from "./components/CutoffTabs";
import AddModal from "./components/AddModal";
import TemplateModal from "./components/TemplateModal";
import Auth from "./components/Auth";
import GroupedEntries from "./components/GroupedEntries";
import OverallSavings from "./pages/OverallSavings";
import OverallDebts from "./pages/OverallDebts";
import ExpensesStatistics from "./pages/ExpensesStatistics";
import { defaultData } from "./data/financeData";

import "./styles/app.css";

const cutoffLabels = {
  firstCutoff: "First Cut-Off",
  secondCutoff: "Second Cut-Off",
};

const pageTitles = {
  dashboard: "Dashboard",
  savings: "Savings",
  debts: "Debts",
  expenses: "Expenses",
};

const createEmptyMonth = () => JSON.parse(JSON.stringify(defaultData.years[2026].months.May));

function App() {
  const initialUser = localStorage.getItem("ft_currentUser");
  const initialFinanceData = initialUser
    ? JSON.parse(localStorage.getItem(`ft_data_${initialUser}`) || JSON.stringify(defaultData))
    : defaultData;

  const currentDate = new Date();
  const currentYearName = String(currentDate.getFullYear());
  const currentMonthName = currentDate.toLocaleString("default", { month: "long" });
  const availableYears = Object.keys(initialFinanceData.years || {});
  const initialYear = availableYears.includes(currentYearName)
    ? currentYearName
    : availableYears[0] || "2026";
  const availableMonths = Object.keys(initialFinanceData.years[initialYear]?.months || {});
  const initialMonth = availableMonths.includes(currentMonthName)
    ? currentMonthName
    : availableMonths[0] || "May";

  const [user, setUser] = useState(initialUser);
  const [financeData, setFinanceData] = useState(initialFinanceData);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [activeCutoff, setActiveCutoff] = useState("firstCutoff");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard"); // dashboard, savings, debts, expenses
  const [editingEntry, setEditingEntry] = useState(null);
  const [entryFilter, setEntryFilter] = useState("all");

  const filterTypes = [
    { label: "Income", value: "income" },
    { label: "Expenses", value: "expenses" },
    { label: "Savings", value: "savings" },
  ];

  useEffect(() => {
    if (window.innerWidth < 900) {
      setIsSidebarOpen(false);
    }
  }, []);

  if (!localStorage.getItem("ft_default_data")) {
    localStorage.setItem("ft_default_data", JSON.stringify(defaultData));
  }

  useEffect(() => {
    const yearKeys = Object.keys(financeData.years || {});
    if (!yearKeys.includes(String(selectedYear))) {
      setSelectedYear(yearKeys[0] || "2026");
    }
  }, [financeData, selectedYear]);

  useEffect(() => {
    const months = Object.keys(financeData.years?.[selectedYear]?.months || {});
    if (months.length && !months.includes(currentMonth)) {
      setCurrentMonth(months[0]);
    }
  }, [financeData, selectedYear, currentMonth]);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const yearData = financeData.years?.[selectedYear] || defaultData.years[2026];
  const currentMonthData = yearData.months?.[currentMonth] || createEmptyMonth();
  const cutoffData = currentMonthData[activeCutoff] || currentMonthData.firstCutoff;

  const isEntryIncluded = (entry) => entry.included !== false;

  const totals = {
    income: (cutoffData.income || []).filter((it) => !it.fundFromOverall && !it.transferEntry && isEntryIncluded(it)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
    expenses: (cutoffData.expenses || []).filter((it) => !it.fundFromOverall && !it.transferEntry && isEntryIncluded(it)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
    savings: (cutoffData.savings || []).filter((it) => !it.fundFromOverall && !it.transferEntry && isEntryIncluded(it)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
  };
  const overallDebtsArr = financeData.overallDebts || [];
  const currentMonthDebts = overallDebtsArr.filter((debt) => {
    if (debt.cutoff && debt.month === currentMonth && String(debt.year) === String(selectedYear) && debt.cutoff === activeCutoff) {
      return true;
    }
    if (!debt.cutoff && activeCutoff === "firstCutoff" && debt.date) {
      const parsed = new Date(debt.date);
      return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.getMonth() === new Date(`${currentMonth} 1, ${selectedYear}`).getMonth() &&
        parsed.getFullYear() === Number(selectedYear)
      );
    }
    return false;
  });
  const activeMonthDebts = currentMonthDebts.filter(isEntryIncluded);

  const cutoffMyDebtsTotal = activeMonthDebts.reduce((sum, it) => {
    const amount = Number(it.amount || 0);
    if (it.direction === "IOwe") {
      return sum + (it.debtAction === "Pay" ? -amount : amount);
    }
    return sum;
  }, 0);
  const cutoffOthersDebtsTotal = activeMonthDebts.reduce((sum, it) => {
    const amount = Number(it.amount || 0);
    if (it.direction === "TheyOwe") {
      return sum + (it.debtAction === "Pay" ? -amount : amount);
    }
    return sum;
  }, 0);

  totals.myDebts = cutoffMyDebtsTotal;
  totals.othersDebts = cutoffOthersDebtsTotal;
  totals.balance = totals.income - totals.expenses - totals.savings;
  const recentEntries = [
    ...Object.entries(cutoffData)
      .filter(([type]) => type !== "debts")
      .flatMap(([type, items]) =>
        items.map((item) => ({
          ...item,
          type,
        })),
      )
      .filter((item) => !item.fundFromOverall && !item.transferEntry),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const filteredEntries = recentEntries.filter((entry) => {
    if (entryFilter === "all") return true;
    const normalizedType = String(entry.type || "").toLowerCase();
    if (entryFilter === "savings") {
      return normalizedType.includes("saving");
    }
    return normalizedType === entryFilter;
  });

  const currentCutoffEntries = recentEntries;
  const allCurrentCutoffSelected = currentCutoffEntries.length > 0 && currentCutoffEntries.every(isEntryIncluded);

  const visibleOverallSavings = (financeData.overallSavings || []).filter(isEntryIncluded);
  const visibleOverallDebts = overallDebtsArr.filter(isEntryIncluded);

  const matchEntry = (item, entry) => {
    if (!item) return false;
    if (entry.id && item.id === entry.id) return true;
    const matchValue = (value) => String(value || "").trim().toLowerCase();
    return (
      matchValue(item.type) === matchValue(entry.type) &&
      matchValue(item.category) === matchValue(entry.category) &&
      matchValue(item.amount) === matchValue(entry.amount) &&
      matchValue(item.date) === matchValue(entry.date) &&
      matchValue(item.month) === matchValue(entry.month) &&
      matchValue(item.year) === matchValue(entry.year) &&
      matchValue(item.cutoff) === matchValue(entry.cutoff)
    );
  };

  const updateCurrentCutoffItem = (cutoffData, entry, included) => {
    if (!cutoffData || typeof cutoffData !== "object") return;
    Object.keys(cutoffData).forEach((type) => {
      if (!Array.isArray(cutoffData[type])) return;
      cutoffData[type] = cutoffData[type].map((item) =>
        matchEntry(item, entry) ? { ...item, included } : item
      );
    });
  };

  const toggleEntryIncluded = (entry, included) => {
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      const monthData = next.years?.[selectedYear]?.months?.[currentMonth];
      if (monthData) {
        const cutoffData = monthData[activeCutoff] || monthData.firstCutoff;
        updateCurrentCutoffItem(cutoffData, entry, included);
      }

      if (Array.isArray(next.overallDebts)) {
        next.overallDebts = next.overallDebts.map((item) =>
          matchEntry(item, entry) && item.month === currentMonth && String(item.year) === String(selectedYear) && item.cutoff === activeCutoff
            ? { ...item, included }
            : item
        );
      }

      if (Array.isArray(next.overallSavings)) {
        next.overallSavings = next.overallSavings.map((item) =>
          matchEntry(item, entry) && item.month === currentMonth && String(item.year) === String(selectedYear)
            ? { ...item, included }
            : item
        );
      }

      persistUserData(next);
      return next;
    });
  };

  const toggleAllCurrentCutoffEntries = (included) => {
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      const monthData = next.years?.[selectedYear]?.months?.[currentMonth];
      const currentCutoffData = monthData ? monthData[activeCutoff] || monthData.firstCutoff : null;

      if (currentCutoffData) {
        const entryIds = new Set(currentCutoffEntries.map((entry) => entry.id).filter(Boolean));
        const entryMatches = currentCutoffEntries.map((entry) => entry);

        Object.keys(currentCutoffData).forEach((type) => {
          if (!Array.isArray(currentCutoffData[type])) return;
          currentCutoffData[type] = currentCutoffData[type].map((item) => {
            const matched = entryIds.has(item.id) || entryMatches.some((entry) => matchEntry(item, entry));
            return matched ? { ...item, included } : item;
          });
        });
      }

      if (Array.isArray(next.overallDebts)) {
        next.overallDebts = next.overallDebts.map((item) => {
          const matched = currentCutoffEntries.some((entry) => matchEntry(item, entry));
          return matched && item.month === currentMonth && String(item.year) === String(selectedYear) && item.cutoff === activeCutoff
            ? { ...item, included }
            : item;
        });
      }

      if (Array.isArray(next.overallSavings)) {
        next.overallSavings = next.overallSavings.map((item) => {
          const matched = currentCutoffEntries.some((entry) => matchEntry(item, entry));
          return matched && item.month === currentMonth && String(item.year) === String(selectedYear)
            ? { ...item, included }
            : item;
        });
      }

      persistUserData(next);
      return next;
    });
  };

  const persistUserData = (next) => {
    if (user) {
      localStorage.setItem(`ft_data_${user}`, JSON.stringify(next));
    }
  };

  const handleExportData = () => {
    if (!user) return;
    const data = localStorage.getItem(`ft_data_${user}`) || JSON.stringify(defaultData);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${user}-financial-tracker-data.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (text) => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || !parsed.years) {
        throw new Error("Invalid data file");
      }
      setFinanceData(parsed);
      persistUserData(parsed);
      const newYear = Object.keys(parsed.years)[0] || "2026";
      setSelectedYear(newYear);
      setCurrentMonth(Object.keys(parsed.years[newYear]?.months || {})[0] || "May");
      window.alert("Data imported successfully.");
    } catch (error) {
      window.alert("Failed to import data. Please use a valid JSON export file.");
    }
  };

  const addEntry = (entry) => {
    const savedEntry = {
      ...entry,
      id: entry.id || Date.now().toString(),
      amount: Number(entry.amount),
      cutoff: entry.cutoff || activeCutoff,
      month: entry.month || currentMonth,
      year: entry.year || selectedYear,
      date: entry.date || getDefaultCutoffDate(entry.month || currentMonth, entry.year || selectedYear, entry.cutoff || activeCutoff),
      included: entry.included !== false,
    };

    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (!next.years) next.years = {};
      if (!next.years[savedEntry.year]) next.years[savedEntry.year] = { months: {} };
      if (!next.years[savedEntry.year].months[savedEntry.month]) {
        next.years[savedEntry.year].months[savedEntry.month] = createEmptyMonth();
      }

      if (savedEntry.type === "debts") {
        if (!next.overallDebts) next.overallDebts = [];
        next.overallDebts.push({
          ...savedEntry,
          category: savedEntry.category,
          direction: savedEntry.direction,
          debtAction: savedEntry.debtAction,
          paymentDestination: savedEntry.paymentDestination,
          splitCategories: savedEntry.splitCategories,
          month: savedEntry.month,
          year: savedEntry.year,
          cutoff: savedEntry.cutoff,
        });

        if (savedEntry.debtAction === "Pay" && savedEntry.direction === "TheyOwe") {
          if (savedEntry.paymentDestination === "overallSavings") {
            if (!next.overallSavings) next.overallSavings = [];
            next.overallSavings.push({
              id: `${savedEntry.id}-savings`,
              category: savedEntry.category || savedEntry.note,
              amount: savedEntry.amount,
              note: savedEntry.note,
              date: savedEntry.date,
              month: savedEntry.month,
              year: savedEntry.year,
              debtReferenceId: savedEntry.id,
            });
          }

          if (savedEntry.paymentDestination === "split") {
            const items = Array.isArray(savedEntry.splitCategories) && savedEntry.splitCategories.length > 0
              ? savedEntry.splitCategories
              : [{ category: savedEntry.category || "Savings", amount: Number(savedEntry.amount) }];
            if (!next.overallSavings) next.overallSavings = [];
            items.forEach((item, idx) => {
              const categoryName = typeof item === "object" ? item.category : item;
              const itemAmount = typeof item === "object" ? Number(item.amount) : Number(savedEntry.amount) / items.length;
              next.overallSavings.push({
                id: `${savedEntry.id}-split-${idx}`,
                category: categoryName,
                amount: Number(itemAmount),
                note: savedEntry.note,
                date: savedEntry.date,
                month: savedEntry.month,
                year: savedEntry.year,
                debtReferenceId: savedEntry.id,
              });
            });
          }
        }
      } else if (savedEntry.type === "savings" && savedEntry.isInitialSavings) {
        if (!next.overallSavings) next.overallSavings = [];
        next.overallSavings.push({
          ...savedEntry,
          category: savedEntry.category || savedEntry.note,
          month: savedEntry.month,
          year: savedEntry.year,
        });
      } else if (savedEntry.fundFromOverall) {
        // Add a visible entry in the selected cutoff so the user can delete it,
        // but mark it with `fundFromOverall` so it won't affect totals.
        const target = next.years[savedEntry.year].months[savedEntry.month][savedEntry.cutoff] || next.years[savedEntry.year].months[savedEntry.month].firstCutoff;
        if (!target[savedEntry.type]) target[savedEntry.type] = [];
        target[savedEntry.type].push({
          ...savedEntry,
          category: savedEntry.category,
          note: savedEntry.note,
          fundFromOverall: true,
        });

        if (!next.overallSavings) next.overallSavings = [];
        next.overallSavings.push({
          category: `Used for ${savedEntry.category}`,
          amount: -Number(savedEntry.amount),
          note: savedEntry.note,
          date: savedEntry.date,
          month: savedEntry.month,
          year: savedEntry.year,
          id: savedEntry.id,
        });
      } else {
        const target = next.years[savedEntry.year].months[savedEntry.month][savedEntry.cutoff] || next.years[savedEntry.year].months[savedEntry.month].firstCutoff;
        if (!target[savedEntry.type]) target[savedEntry.type] = [];
        target[savedEntry.type].push({
          ...savedEntry,
          category: savedEntry.category,
          note: savedEntry.note,
        });

        if (savedEntry.type === "savings") {
          if (!next.overallSavings) next.overallSavings = [];
          next.overallSavings.push({
            ...savedEntry,
            category: savedEntry.category || savedEntry.note,
            month: savedEntry.month,
            year: savedEntry.year,
          });
        }
      }

      persistUserData(next);
      return next;
    });
  };

  const updateEntry = (entry) => {
    const updatedEntry = {
      ...entry,
      amount: Number(entry.amount),
      cutoff: entry.cutoff || activeCutoff,
      month: entry.month || currentMonth,
      year: entry.year || selectedYear,
      date: entry.date || getDefaultCutoffDate(entry.month || currentMonth, entry.year || selectedYear, entry.cutoff || activeCutoff),
      id: entry.id || Date.now().toString(),
      included: entry.included !== false,
    };

    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (!next.years || !next.years[updatedEntry.year] || !next.years[updatedEntry.year].months[updatedEntry.month]) {
        return previous;
      }

      const cutoff = next.years[updatedEntry.year].months[updatedEntry.month][updatedEntry.cutoff] || next.years[updatedEntry.year].months[updatedEntry.month].firstCutoff;

      const removeMatching = (list) => {
        if (!Array.isArray(list)) return [];
        return list.filter((item) => {
          const sameItem = item.id === updatedEntry.id && item.category === updatedEntry.category && Number(item.amount) === Number(updatedEntry.amount) && item.date === updatedEntry.date && item.note === updatedEntry.note;
          const sameDebtReference = item.debtReferenceId === updatedEntry.id;
          return !sameItem && !sameDebtReference;
        });
      };

      Object.keys(cutoff).forEach((type) => {
        cutoff[type] = removeMatching(cutoff[type]);
      });

      if (next.overallSavings) {
        next.overallSavings = next.overallSavings.filter((item) => item.id !== updatedEntry.id);
      }
      if (next.overallDebts) {
        next.overallDebts = next.overallDebts.filter((item) => item.id !== updatedEntry.id);
      }

      if (updatedEntry.type === "debts") {
        if (!next.overallDebts) next.overallDebts = [];
        next.overallDebts.push({
          ...updatedEntry,
          category: updatedEntry.category,
          direction: updatedEntry.direction,
          debtAction: updatedEntry.debtAction,
          paymentDestination: updatedEntry.paymentDestination,
          splitCategories: updatedEntry.splitCategories,
          month: updatedEntry.month,
          year: updatedEntry.year,
          cutoff: updatedEntry.cutoff,
        });

        if (updatedEntry.debtAction === "Pay" && updatedEntry.direction === "TheyOwe") {
          if (updatedEntry.paymentDestination === "overallSavings") {
            if (!next.overallSavings) next.overallSavings = [];
            next.overallSavings.push({
              id: `${updatedEntry.id}-savings`,
              category: updatedEntry.category || updatedEntry.note,
              amount: updatedEntry.amount,
              note: updatedEntry.note,
              date: updatedEntry.date,
              month: updatedEntry.month,
              year: updatedEntry.year,
              debtReferenceId: updatedEntry.id,
            });
          }

          if (updatedEntry.paymentDestination === "split") {
            const items = Array.isArray(updatedEntry.splitCategories) && updatedEntry.splitCategories.length > 0
              ? updatedEntry.splitCategories
              : [{ category: updatedEntry.category || "Savings", amount: Number(updatedEntry.amount) }];
            if (!next.overallSavings) next.overallSavings = [];
            items.forEach((item, idx) => {
              const categoryName = typeof item === "object" ? item.category : item;
              const itemAmount = typeof item === "object" ? Number(item.amount) : Number(updatedEntry.amount) / items.length;
              next.overallSavings.push({
                id: `${updatedEntry.id}-split-${idx}`,
                category: categoryName,
                amount: Number(itemAmount),
                note: updatedEntry.note,
                date: updatedEntry.date,
                month: updatedEntry.month,
                year: updatedEntry.year,
                debtReferenceId: updatedEntry.id,
              });
            });
          }
        }
      } else if (updatedEntry.type === "savings" && updatedEntry.isInitialSavings) {
        if (!next.overallSavings) next.overallSavings = [];
        next.overallSavings.push({
          ...updatedEntry,
          category: updatedEntry.category || updatedEntry.note,
          month: updatedEntry.month,
          year: updatedEntry.year,
        });
      } else if (updatedEntry.fundFromOverall) {
        // Ensure a visible entry exists in the cutoff for editing/deleting,
        // but mark it so totals ignore it.
        if (!cutoff[updatedEntry.type]) cutoff[updatedEntry.type] = [];
        cutoff[updatedEntry.type].push({
          ...updatedEntry,
          category: updatedEntry.category,
          note: updatedEntry.note,
          fundFromOverall: true,
        });

        if (!next.overallSavings) next.overallSavings = [];
        next.overallSavings.push({
          category: `Used for ${updatedEntry.category}`,
          amount: -Number(updatedEntry.amount),
          note: updatedEntry.note,
          date: updatedEntry.date,
          month: updatedEntry.month,
          year: updatedEntry.year,
          id: updatedEntry.id,
        });
      } else {
        if (!cutoff[updatedEntry.type]) cutoff[updatedEntry.type] = [];
        cutoff[updatedEntry.type].push({
          ...updatedEntry,
          category: updatedEntry.category,
          note: updatedEntry.note,
        });

        if (updatedEntry.type === "savings") {
          if (!next.overallSavings) next.overallSavings = [];
          next.overallSavings.push({
            ...updatedEntry,
            category: updatedEntry.category || updatedEntry.note,
            month: updatedEntry.month,
            year: updatedEntry.year,
          });
        }
      }

      persistUserData(next);
      return next;
    });
  };

  const getDefaultCutoffDate = (month, year, cutoff) => {
    const day = cutoff === "secondCutoff" ? 16 : 1;
    const date = new Date(`${month} ${day}, ${year}`);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const applyTemplate = (templateId) => {
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      const template = (next.templates || []).find((t) => t.id === templateId);
      if (!template) return previous;
      if (!next.years) next.years = {};
      if (!next.years[selectedYear]) next.years[selectedYear] = { months: {} };
      if (!next.years[selectedYear].months[currentMonth]) {
        next.years[selectedYear].months[currentMonth] = createEmptyMonth();
      }
      const target = next.years[selectedYear].months[currentMonth][activeCutoff] || next.years[selectedYear].months[currentMonth].firstCutoff;
      template.entries.forEach((e) => {
        const item = {
          ...e,
          date: e.date || getDefaultCutoffDate(currentMonth, selectedYear, activeCutoff),
          id: `${Date.now()}-${Math.random()}`,
        };
        if (item.type === "debts") {
          if (!next.overallDebts) next.overallDebts = [];
          next.overallDebts.push({
            ...item,
            month: currentMonth,
            year: selectedYear,
            cutoff: item.cutoff || activeCutoff,
          });
          return;
        }
        if (!target[item.type]) target[item.type] = [];
        target[item.type].push(item);

        if (item.type === "savings") {
          if (!next.overallSavings) next.overallSavings = [];
          next.overallSavings.push({
            ...item,
            category: item.category || item.note,
            month: currentMonth,
            year: selectedYear,
          });
        }
      });
      persistUserData(next);
      return next;
    });
  };

  const createSavingsGoal = (goal) => {
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (!next.savingsGoals) next.savingsGoals = [];
      next.savingsGoals.push(goal);
      persistUserData(next);
      return next;
    });
  };

  const completeSavingsGoal = (goalId) => {
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (!next.savingsGoals) return previous;
      next.savingsGoals = next.savingsGoals.map((goal) =>
        goal.id === goalId
          ? { ...goal, completed: true, completedDate: new Date().toISOString().split("T")[0] }
          : goal
      );
      persistUserData(next);
      return next;
    });
  };

  const reactivateSavingsGoal = (goalId) => {
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (!next.savingsGoals) return previous;
      next.savingsGoals = next.savingsGoals.map((goal) =>
        goal.id === goalId ? { ...goal, completed: false, completedDate: null } : goal
      );
      persistUserData(next);
      return next;
    });
  };

  const updateSavingsGoal = (updatedGoal) => {
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (!next.savingsGoals) return previous;
      next.savingsGoals = next.savingsGoals.map((goal) =>
        goal.id === updatedGoal.id ? { ...goal, ...updatedGoal } : goal
      );
      persistUserData(next);
      return next;
    });
  };

  const removeEntry = (entry) => {
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (!next.years) return previous;

      const removeMatching = (list) => {
        if (!Array.isArray(list)) return list;
        return list.filter((item) => {
          if (!item) return false;
          const sameId = item.id === entry.id;
          const sameReference = item.debtReferenceId === entry.id;
          const sameMatch = item.category === entry.category && String(item.amount) === String(entry.amount) && item.date === entry.date;
          return !sameId && !sameReference && !sameMatch;
        });
      };

      Object.values(next.years).forEach((year) => {
        Object.values(year.months || {}).forEach((month) => {
          Object.keys(month).forEach((cutoffKey) => {
            const cutoff = month[cutoffKey];
            if (cutoff && typeof cutoff === "object") {
              Object.keys(cutoff).forEach((type) => {
                cutoff[type] = removeMatching(cutoff[type]);
              });
            }
          });
        });
      });

      if (next.overallSavings) {
        const normalize = (v) => String(v || "").toLowerCase().trim();
        const entryKey = normalize(entry.category || entry.note || "");
        const entryIdStr = String(entry.id || "");
        const entryAmountNum = Number(entry.amount || 0);
        next.overallSavings = next.overallSavings.filter((item) => {
          if (!item) return false;
          const itemIdStr = String(item.id || "");
          const sameIdExact = itemIdStr === entryIdStr;
          const idIncludes = entryIdStr && itemIdStr.includes(entryIdStr);
          const sameReferenceExact = String(item.debtReferenceId || "") === entryIdStr;
          const referenceIncludes = String(item.debtReferenceId || "").includes(entryIdStr);

          const itemAmountNum = Number(item.amount || 0);
          const amountExact = Object.is(itemAmountNum, entryAmountNum);
          const amountInverse = Object.is(itemAmountNum, -entryAmountNum);

          const itemKey = normalize(item.category || item.note || "");
          const fuzzyCategoryMatch = entryKey && (itemKey === entryKey || itemKey.includes(entryKey) || entryKey.includes(itemKey));
          const fundFromOverallMatch = entry.fundFromOverall && itemKey.includes(`used for ${entryKey}`);

          const monthYearMatch = item.month && entry.month && String(item.month) === String(entry.month) && String(item.year) === String(entry.year);

          const sameDetails = (amountExact || amountInverse) && (fuzzyCategoryMatch || fundFromOverallMatch || monthYearMatch);

          const shouldRemove = sameIdExact || idIncludes || sameReferenceExact || referenceIncludes || sameDetails;
          return !shouldRemove;
        });
      }

      if (next.overallDebts) {
        next.overallDebts = next.overallDebts.filter((it) => it.id !== entry.id);
      }

      if (next.overallDebtsArchived) {
        next.overallDebtsArchived = next.overallDebtsArchived.filter((it) => it.id !== entry.id);
      }

      persistUserData(next);
      return next;
    });
  };

  const archiveDebtCategory = (category, direction) => {
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (!next.overallDebts) return previous;
      const toArchive = next.overallDebts.filter(
        (d) => d.category === category && d.direction === direction
      );
      if (!toArchive.length) return previous;
      next.overallDebts = next.overallDebts.filter(
        (d) => !(d.category === category && d.direction === direction)
      );
      if (!next.overallDebtsArchived) next.overallDebtsArchived = [];
      next.overallDebtsArchived.push(
        ...toArchive.map((debt) => ({
          ...debt,
          archivedAt: new Date().toISOString().split("T")[0],
        }))
      );
      persistUserData(next);
      return next;
    });
  };

  const restoreDebtCategory = (category, direction) => {
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (!next.overallDebtsArchived) return previous;
      const toRestore = next.overallDebtsArchived.filter(
        (d) => d.category === category && d.direction === direction
      );
      if (!toRestore.length) return previous;
      next.overallDebtsArchived = next.overallDebtsArchived.filter(
        (d) => !(d.category === category && d.direction === direction)
      );
      if (!next.overallDebts) next.overallDebts = [];
      next.overallDebts.push(
        ...toRestore.map(({ archivedAt, ...rest }) => rest)
      );
      persistUserData(next);
      return next;
    });
  };

  const handleLogin = (username) => {
    setUser(username);
    const raw = localStorage.getItem(`ft_data_${username}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      setFinanceData(parsed);
      const newYear = Object.keys(parsed.years)[0] || "2026";
      setSelectedYear(newYear);
      setCurrentMonth(Object.keys(parsed.years[newYear]?.months || {})[0] || "May");
    } else {
      localStorage.setItem(`ft_data_${username}`, JSON.stringify(defaultData));
      setFinanceData(defaultData);
      setSelectedYear(Object.keys(defaultData.years)[0] || "2026");
      setCurrentMonth(Object.keys(defaultData.years[Object.keys(defaultData.years)[0]].months || {})[0] || "May");
    }
    localStorage.setItem("ft_currentUser", username);
  };

  const handleAddYear = () => {
    const yearInput = window.prompt("Enter the new year to add, for example 2027");
    if (!yearInput) return;
    const year = yearInput.trim();
    if (!/^[0-9]{4}$/.test(year)) {
      window.alert("Please enter a valid year number.");
      return;
    }
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (!next.years) next.years = {};
      if (next.years[year]) {
        window.alert("That year already exists.");
        return previous;
      }
      next.years[year] = { months: { January: createEmptyMonth() } };
      persistUserData(next);
      return next;
    });
    setSelectedYear(year);
    setCurrentMonth("January");
  };

  const handleAddMonth = () => {
    const monthInput = window.prompt("Enter the new month name to add, for example January");
    if (!monthInput) return;
    const month = monthInput.trim();
    if (!month) return;
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (!next.years) next.years = {};
      if (!next.years[selectedYear]) next.years[selectedYear] = { months: {} };
      if (next.years[selectedYear].months[month]) {
        window.alert("That month already exists for this year.");
        return previous;
      }
      next.years[selectedYear].months[month] = createEmptyMonth();
      persistUserData(next);
      return next;
    });
    setCurrentMonth(month);
  };

  const saveTemplate = (template) => {
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (!next.templates) next.templates = [];
      next.templates.push(template);
      persistUserData(next);
      return next;
    });
  };

  const updateTemplate = (template) => {
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (!next.templates) next.templates = [];
      next.templates = next.templates.map((t) => (t.id === template.id ? template : t));
      persistUserData(next);
      return next;
    });
  };

  const deleteTemplate = (templateId) => {
    setFinanceData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (!next.templates) return previous;
      next.templates = next.templates.filter((t) => t.id !== templateId);
      persistUserData(next);
      return next;
    });
  };

  const handleLogout = () => {
    setUser(null);
    setFinanceData(defaultData);
    setSelectedYear(Object.keys(defaultData.years)[0] || "2026");
    setCurrentMonth(Object.keys(defaultData.years[Object.keys(defaultData.years)[0]].months || {})[0] || "May");
    setEditingEntry(null);
    localStorage.removeItem("ft_currentUser");
  };

  const overallSavingsTotal = (financeData.overallSavings || []).reduce((s, it) => s + Number(it.amount || 0), 0);
  const overallDebtsTotal = (financeData.overallDebts || []).reduce((s, it) => s + Number(it.amount || 0), 0);

  const savingsCategoryOptions = Array.from(
    new Set(
      [
        ...(financeData.overallSavings || []).map((item) => item.category),
        ...(financeData.savingsGoals || []).map((goal) => goal.name || goal.category),
        ...Object.values(financeData.years || {}).flatMap((year) =>
          Object.values(year.months || {}).flatMap((month) => [
            ...(month.firstCutoff?.savings || []).map((item) => item.category),
            ...(month.secondCutoff?.savings || []).map((item) => item.category),
          ])
        ),
      ].filter(Boolean)
    )
  );

  // if not logged in, show auth modal only
  if (!user) {
    return (
      <div className="app">
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar
        isOpen={isSidebarOpen}
        user={user}
        years={Object.keys(financeData.years || {})}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        onAddYear={handleAddYear}
        months={Object.keys(yearData.months || {})}
        selectedMonth={currentMonth}
        onSelectMonth={setCurrentMonth}
        onAddMonth={handleAddMonth}
        templates={financeData.templates || []}
        onApplyTemplate={applyTemplate}
        onDeleteTemplate={deleteTemplate}
        overallSavings={financeData.overallSavings || []}
        overallDebts={financeData.overallDebts || []}
        onManageTemplates={() => setIsTemplateModalOpen(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className={`sidebar-backdrop ${isSidebarOpen ? "visible" : ""}`} onClick={() => setIsSidebarOpen(false)} />

      <main className="content">
        <header className="page-header">
          <div className="mobile-header-top mobile-only">
            <button className="mobile-menu-btn" title="Toggle sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="mobile-page-title">{pageTitles[currentPage]}</h1>
          </div>

          <div className="desktop-header desktop-only">
            <button className="icon-button" title="Toggle sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ marginRight: 12 }}>
              ☰
            </button>
            <h1>Financial Tracker</h1>
          </div>

          <div className="header-actions desktop-only">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {currentPage === 'dashboard' && (
                <>
                  {installPrompt && (
                    <button
                      className="secondary-button"
                      onClick={async () => {
                        installPrompt.prompt();
                        const choice = await installPrompt.userChoice;
                        if (choice.outcome === 'accepted') {
                          setInstallPrompt(null);
                        }
                      }}
                    >
                      Install app
                    </button>
                  )}
                  <button className="primary-button" onClick={() => setIsModalOpen(true)}>
                    + Add entry
                  </button>
                </>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={currentPage === 'dashboard' ? 'tab-button active' : 'tab-button'}
                  onClick={() => setCurrentPage('dashboard')}
                >
                  Dashboard
                </button>
                <button
                  className={currentPage === 'savings' ? 'tab-button active' : 'tab-button'}
                  onClick={() => setCurrentPage('savings')}
                >
                  Savings
                </button>
                <button
                  className={currentPage === 'debts' ? 'tab-button active' : 'tab-button'}
                  onClick={() => setCurrentPage('debts')}
                >
                  Debts
                </button>
                <button
                  className={currentPage === 'expenses' ? 'tab-button active' : 'tab-button'}
                  onClick={() => setCurrentPage('expenses')}
                >
                  Expenses
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Page */}
        {currentPage === 'dashboard' && (
          <>
            <Dashboard
              totals={totals}
              totalBalance={overallSavingsTotal}
              currentMonth={currentMonth}
              selectedYear={selectedYear}
            />

            <div className="cutoff-tabs desktop-only">
              <CutoffTabs activeCutoff={activeCutoff} setActiveCutoff={setActiveCutoff} />
            </div>

            <div className="mobile-cutoff-tabs mobile-only">
              <CutoffTabs activeCutoff={activeCutoff} setActiveCutoff={setActiveCutoff} />
            </div>

            <section className="tracker-panel">
              <div className="mobile-section-header mobile-only">
                <h2>Recent transactions</h2>
                <button
                  type="button"
                  className="view-all-link"
                  onClick={() => setEntryFilter("all")}
                >
                  View all
                </button>
              </div>

              <div className="tracker-header desktop-only">
                <div className="tracker-filters">
                  {filterTypes.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      className={`filter-button${entryFilter === filter.value ? " active" : ""}`}
                      onClick={() => setEntryFilter((current) => (current === filter.value ? "all" : filter.value))}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                {currentCutoffEntries.length > 0 && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => toggleAllCurrentCutoffEntries(!allCurrentCutoffSelected)}
                  >
                    {allCurrentCutoffSelected ? "Unselect all" : "Select all"}
                  </button>
                )}
              </div>

              <div className="tracker-list">
                <GroupedEntries
                  entries={filteredEntries}
                  onRemoveEntry={removeEntry}
                  onToggleIncluded={toggleEntryIncluded}
                  onEditEntry={(entry) => {
                    setEditingEntry(entry);
                    setIsModalOpen(true);
                  }}
                />
              </div>
            </section>
          </>
        )}

        {/* Savings Page */}
        {currentPage === 'savings' && (
          <OverallSavings
            overallSavings={visibleOverallSavings}
            savingsGoals={financeData.savingsGoals || []}
            onCreateGoal={createSavingsGoal}
            onCompleteGoal={completeSavingsGoal}
            onUpdateGoal={updateSavingsGoal}
            onRemoveEntry={removeEntry}
            onReactivateGoal={reactivateSavingsGoal}
            onAdd={addEntry}
          />
        )}

        {/* Debts Page */}
        {currentPage === 'debts' && (
          <OverallDebts
            overallDebts={visibleOverallDebts}
            financeData={financeData}
            activeCutoff={activeCutoff}
            currentMonth={currentMonth}
            selectedYear={selectedYear}
            onArchiveCategory={archiveDebtCategory}
            onRestoreCategory={restoreDebtCategory}
            onAdd={addEntry}
            onRemoveEntry={removeEntry}
          />
        )}

        {/* Expenses Page */}
        {currentPage === 'expenses' && (
          <ExpensesStatistics financeData={financeData} selectedYear={selectedYear} currentMonth={currentMonth} />
        )}
      </main>

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        templates={financeData.templates || []}
        onSaveTemplate={saveTemplate}
        onUpdateTemplate={updateTemplate}
        onDeleteTemplate={deleteTemplate}
      />

      <AddModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        onAdd={addEntry}
        onUpdate={updateEntry}
        entryToEdit={editingEntry}
        activeCutoff={activeCutoff}
        currentMonth={currentMonth}
        selectedYear={selectedYear}
        savingsCategoryOptions={savingsCategoryOptions}
      />

      <nav className="mobile-bottom-nav mobile-only" aria-label="Main navigation">
        <button
          type="button"
          className={`mobile-nav-item${currentPage === "dashboard" ? " active" : ""}`}
          onClick={() => setCurrentPage("dashboard")}
        >
          <span className="mobile-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <path d="M9 22V12h6v10" />
            </svg>
          </span>
          <span className="mobile-nav-label">Dashboard</span>
        </button>
        <button
          type="button"
          className={`mobile-nav-item${currentPage === "savings" ? " active" : ""}`}
          onClick={() => setCurrentPage("savings")}
        >
          <span className="mobile-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M19 11c0 4.418-3.582 8-8 8S3 15.418 3 11s3.582-8 8-8 8 3.582 8 8z" />
              <path d="M12 7v8M9 10h6" />
            </svg>
          </span>
          <span className="mobile-nav-label">Savings</span>
        </button>
        <button
          type="button"
          className={`mobile-nav-item${currentPage === "expenses" ? " active" : ""}`}
          onClick={() => setCurrentPage("expenses")}
        >
          <span className="mobile-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
              <path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
          </span>
          <span className="mobile-nav-label">Expenses</span>
        </button>
        <button
          type="button"
          className={`mobile-nav-item${currentPage === "debts" ? " active" : ""}`}
          onClick={() => setCurrentPage("debts")}
        >
          <span className="mobile-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <path d="M8 6h8M8 10h8M8 14h4" />
            </svg>
          </span>
          <span className="mobile-nav-label">Debts</span>
        </button>
        <button type="button" className="mobile-nav-item mobile-nav-add" onClick={() => setIsModalOpen(true)}>
          <span className="mobile-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="mobile-nav-label">Add Entry</span>
        </button>
      </nav>
    </div>
  );
}

export default App;