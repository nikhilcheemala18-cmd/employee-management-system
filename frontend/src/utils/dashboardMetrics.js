export const countBy = (items, field) =>
  items.reduce((counts, item) => {
    const value = item[field] || "Not assigned";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});

export const chartItems = (items, field, limit = 5) =>
  Object.entries(countBy(items, field))
    .map(([label, value]) => ({ label, value }))
    .sort((first, second) => second.value - first.value)
    .slice(0, limit);

export const workforceSummary = (employees) => ({
  total: employees.length,
  active: employees.filter((employee) => employee.status === "Active").length,
  inactive: employees.filter((employee) => employee.status === "Inactive").length,
  operators: employees.filter((employee) => employee.type === "deo").length,
});
