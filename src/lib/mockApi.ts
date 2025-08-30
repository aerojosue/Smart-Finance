export async function getDashboard() {
  const r = await fetch('/mocks/dashboard.json');
  if (!r.ok) throw new Error('dashboard mock not found');
  return r.json();
}

export async function getCalendar() {
  const r = await fetch('/mocks/calendar.json');
  if (!r.ok) throw new Error('calendar mock not found');
  return r.json();
}

export async function getCashflow() {
  const r = await fetch('/mocks/cashflow.json');
  if (!r.ok) throw new Error('cashflow mock not found');
  return r.json();
}

export async function getInstallment(id: string) {
  // para inst_1 => /mocks/installment_inst1.json
  const r = await fetch(`/mocks/installment_${id}.json`);
  if (!r.ok) throw new Error(`installment ${id} mock not found`);
  return r.json();
}

export async function getFxRoutes() {
  const r = await fetch('/mocks/fx_routes.json');
  if (!r.ok) return { routes: [], synthetic_rules: [], policy: {} };
  return r.json();
}

export async function getSettings() {
  const r = await fetch('/mocks/settings.json');
  if (!r.ok) return {};
  return r.json();
}
