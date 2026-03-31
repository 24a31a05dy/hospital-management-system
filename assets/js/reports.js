// Reporting for admin dashboard

document.addEventListener("DOMContentLoaded", () => {
    const { STORAGE_KEYS, getFromStorage } = window.HMSUtils;
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const appointments = getFromStorage(STORAGE_KEYS.APPOINTMENTS, []);
    const billing = getFromStorage(STORAGE_KEYS.BILLING, []);

    const totalPatients = users.filter(u => u.role === "patient").length;
    const totalDoctors = users.filter(u => u.role === "doctor").length;
    const totalAppointments = appointments.length;
    const totalRevenue = billing.reduce((sum, b) => sum + (b.amount || 0), 0);

    const patientsEl = document.getElementById("reportTotalPatients");
    const doctorsEl = document.getElementById("reportTotalDoctors");
    const appointmentsEl = document.getElementById("reportTotalAppointments");
    const revenueEl = document.getElementById("reportTotalRevenue");

    if (patientsEl) patientsEl.textContent = totalPatients;
    if (doctorsEl) doctorsEl.textContent = totalDoctors;
    if (appointmentsEl) appointmentsEl.textContent = totalAppointments;
    if (revenueEl) revenueEl.textContent = `$${totalRevenue.toFixed(2)}`;
});

